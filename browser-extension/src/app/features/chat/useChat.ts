import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  chatMessages,
  clearMessages,
  overwriteLatestMessage,
  pushMessages,
  replaceMessages,
} from './chatSlice';
import usePredict from './usePredict';
import { Message } from '../../../@types/chat';
import Browser from 'webextension-polyfill';
import { PromptSetting } from '../../../@types/settings';
import { StreamingChunk } from '../../../@types/backend-api';

const useChat = () => {
  // 여러 탭에서 시작될 수 있으므로 각 탭의 상태를 관리합니다.
  const [tabId, setTabId] = useState<number>(-1);
  Browser.tabs?.getCurrent().then((tab) => {
    if (tab) {
      if (tab.id !== tabId) {
        setTabId(tab.id ?? -1);
      }
    }
  });

  const messages = useAppSelector((state) => chatMessages(state, tabId));
  const dispatch = useAppDispatch();
  const { predictStream } = usePredict();

  const [isLoading, setIsLoading] = useState(false);

  const isEmptyMessages = useMemo(() => {
    return messages.length === 0;
  }, [messages]);

  return {
    messages,
    isEmptyMessages,
    sendMessage: async (promptSetting: PromptSetting, content: string, isReplace?: boolean) => {
      if (tabId === -1) {
        throw new Error('Tab ID를 얻을 수 없습니다.');
      }

      setIsLoading(true);
      try {
        const sendingMessage: Message[] = [
          {
            role: 'user',
            content: content,
          },
        ];
        // ignoreHistory의 경우 질문과 답변의 형식입니다
        if (isEmptyMessages || promptSetting.ignoreHistory) {
          sendingMessage.unshift({
            role: 'system',
            title: promptSetting.systemContextTitle,
            content: promptSetting.systemContext,
          });
        }

        const stream = predictStream({
          model: {
            modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
            type: 'bedrock',
          },
          messages:
            isReplace || promptSetting.ignoreHistory
              ? sendingMessage
              : [...messages, ...sendingMessage],
        });
        dispatch(
          isReplace
            ? replaceMessages(tabId, [
                ...sendingMessage,
                {
                  role: 'assistant',
                  content: '▍',
                },
              ])
            : pushMessages(tabId, [
                ...sendingMessage,
                {
                  role: 'assistant',
                  content: '▍',
                },
              ]),
        );

        // Assistant 답변 업데이트
        let tmpChunk = '';

        for await (const chunks of stream) {
          // 청크 데이터는 줄 바꿈 코드로 구분되어 전송되므로 분할하여 처리합니다.
          for (const chunk_ of chunks.split('\n')) {
            if (chunk_) {
              const chunk: StreamingChunk = JSON.parse(chunk_);
              tmpChunk += chunk.text;
            }
          }
          // chunk는 10자 이상으로 함께 처리합니다.
          // 버퍼를 사용하지 않으면 다음 오류가 발생합니다.
          // Maximum update depth exceeded
          if (tmpChunk.length >= 10) {
            dispatch(overwriteLatestMessage(tabId, tmpChunk + '▍'));
          }
        }
        dispatch(overwriteLatestMessage(tabId, tmpChunk));
      } finally {
        setIsLoading(false);
      }
    },
    clearMessages: () => {
      if (tabId === -1) {
        throw new Error('Tab ID를 얻을 수 없습니다.');
      }

      dispatch(clearMessages({ tabId }));
    },
    isLoading,
  };
};

export default useChat;