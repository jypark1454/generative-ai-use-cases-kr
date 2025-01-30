import { useMemo } from 'react';
import useChat from './useChat';
import useRagKnowledgeBaseApi from './useRagKnowledgeBaseApi';
import { getPrompter } from '../prompts';
import { RetrieveResultItem } from '@aws-sdk/client-kendra';
import { ShownMessage } from 'generative-ai-use-cases-jp';
import { cleanEncode } from '../utils/URLUtils';
import { arrangeItems } from './useRag';

// s3://<BUCKET>/<PREFIX> から https://s3.<REGION>.amazonaws.com/<BUCKET>/<PREFIX> に変換する
const convertS3UriToUrl = (s3Uri: string, region: string): string => {
  const result = /^s3:\/\/(?<bucketName>.+?)\/(?<prefix>.+)/.exec(s3Uri);

  if (!result) {
    return s3Uri;
  }

  const groups = result?.groups as {
    bucketName: string;
    prefix: string;
  };

  return `https://s3.${region}.amazonaws.com/${groups.bucketName}/${groups.prefix}`;
};

const useRagKnowledgeBase = (id: string) => {
  const {
    getModelId,
    messages,
    postChat,
    clear,
    loading,
    setLoading,
    updateSystemContext,
    popMessage,
    pushMessage,
    isEmpty,
  } = useChat(id);

  const modelId = getModelId();
  const { retrieve } = useRagKnowledgeBaseApi();
  const prompter = useMemo(() => {
    return getPrompter(modelId);
  }, [modelId]);

  return {
    isEmpty,
    loading,
    setLoading,
    messages,
    postChat,
    clear,
    postMessage: async (content: string) => {
      setLoading(true);

      const modelRegion = import.meta.env.VITE_APP_MODEL_REGION!;

      pushMessage('user', content);
      pushMessage(
        'assistant',
        'Knowledge Base 에서 참고 문서 가져 오기 중...'
      );

      let retrievedItems = null;

      try {
        retrievedItems = await retrieve(content);
      } catch (e) {
        console.error(e);
        popMessage();
        pushMessage(
          'assistant',
          `Retrieve 시 오류가 발생했습니다. 다음과 같은 대응을 고려해봅시다.
- cdk.json에서 지정한 embeddingModelId의 모델이 Amazon Bedrock (${modelRegion})에서 활성화되어 있는지 확인합니다.`
        );
        setLoading(false);
        return;
      }

      if (
        !retrievedItems ||
        !retrievedItems.data.retrievalResults ||
        retrievedItems.data.retrievalResults.length === 0
      ) {
        popMessage();
        pushMessage(
          'assistant',
          `참고 문서를 찾을 수 없습니다. 다음과 같은 대응을 고려해 보세요.
- Knowledge Base의 데이터 소스에 대상 문서가 추가되어 있는지 확인합니다.
- Knowledge Base의 데이터 소스가 동기화되어 있는지 확인하기
- 입력 표현 변경하기`
        );
        setLoading(false);
        return;
      }

      // Prompt を使いまわすために Amazon Kendra の retrieve item と同じ形式にする
      // Knowledge Base のみを利用する場合は本来不要な処理
      const retrievedItemsKendraFormat: RetrieveResultItem[] =
        retrievedItems.data.retrievalResults!.map((r, idx) => {
          const sourceUri =
            r.metadata?.['x-amz-bedrock-kb-source-uri']?.toString() ?? '';
          const pageNumber =
            r.metadata?.['x-amz-bedrock-kb-document-page-number'];

          return {
            Content: r.content?.text ?? '',
            DocumentId: `${idx}`,
            DocumentTitle: sourceUri.split('/').pop(),
            DocumentURI: convertS3UriToUrl(sourceUri, modelRegion),
            DocumentAttributes: pageNumber
              ? [
                  {
                    Key: '_excerpt_page_number',
                    Value: { LongValue: Number(pageNumber) },
                  },
                ]
              : [],
          };
        });
      const items = arrangeItems(retrievedItemsKendraFormat);

      updateSystemContext(
        prompter.ragPrompt({
          promptType: 'SYSTEM_CONTEXT',
          referenceItems: items,
        })
      );

      popMessage();
      popMessage();
      postChat(
        content,
        false,
        (messages: ShownMessage[]) => {
          // 前処理：Few-shot で参考にされてしまうため、過去ログから footnote を削除
          return messages.map((message) => ({
            ...message,
            content: message.content
              .replace(/\[\^0\]:[\s\S]*/s, '') // 文末の脚注を削除
              .replace(/\[\^(\d+)\]/g, '') // 文中の脚注アンカーを削除
              .trim(), // 前後の空白を削除
          }));
        },
        (message: string) => {
          // 後処理：Footnote の付与
          const footnote = items
            .map((item, idx) => {
              // 参考にしたページ番号がある場合は、アンカーリンクとして設定する
              const _excerpt_page_number = item.DocumentAttributes?.find(
                (attr) => attr.Key === '_excerpt_page_number'
              )?.Value?.LongValue;
              return message.includes(`[^${idx}]`)
                ? `[^${idx}]: [${item.DocumentTitle}${
                    _excerpt_page_number
                      ? `(${_excerpt_page_number} ページ)`
                      : ''
                  }](
                  ${item.DocumentURI ? cleanEncode(item.DocumentURI) : ''}${
                    _excerpt_page_number ? `#page=${_excerpt_page_number}` : ''
                  })`
                : '';
            })
            .filter((x) => x)
            .join('\n');
          return message + '\n' + footnote;
        }
      );
    },
  };
};

export default useRagKnowledgeBase;
