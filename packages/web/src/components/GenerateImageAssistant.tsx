import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from './Card';
import InputChatContent from './InputChatContent';
import Select from './Select';
import { useLocation } from 'react-router-dom';
import useChat from '../hooks/useChat';
import { PiLightbulbFilamentBold, PiWarningFill } from 'react-icons/pi';
import { BaseProps } from '../@types/common';
import Button from './Button';

type Props = BaseProps & {
  modelId: string;
  onChangeModel: (s: string) => void;
  modelIds: string[];
  content: string;
  isGeneratingImage: boolean;
  onChangeContent: (s: string) => void;
  onGenerate: (
    prompt: string,
    negativePrompt: string,
    stylePreset?: string
  ) => Promise<void>;
};

const GenerateImageAssistant: React.FC<Props> = (props) => {
  const { pathname } = useLocation();
  const { loading, messages, postChat, popMessage } = useChat(pathname);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  const contents = useMemo<
    (
      | {
          role: 'user';
          content: string;
        }
      | {
          role: 'assistant';
          content: {
            prompt: string | null;
            negativePrompt: string | null;
            comment: string;
            recommendedStylePreset: string[];
            error?: boolean;
          };
        }
    )[]
  >(() => {
    return messages.flatMap((m, idx) => {
      if (m.role === 'user') {
        return {
          role: 'user',
          content: m.content,
        };
      } else {
        if (loading && messages.length - 1 === idx) {
          return {
            role: 'assistant',
            content: {
              prompt: null,
              negativePrompt: null,
              comment: '',
              recommendedStylePreset: [],
            },
          };
        }
        try {
          return {
            role: 'assistant',
            content: JSON.parse(m.content),
          };
        } catch (e) {
          console.error(e);
          return {
            role: 'assistant',
            content: {
              prompt: null,
              negativePrompt: null,
              comment: '',
              error: true,
              recommendedStylePreset: [],
            },
          };
        }
      }
    });
  }, [loading, messages]);

  const scrollToBottom = useCallback(() => {
    const elementId = 'image-assistant-chat';
    document.getElementById(elementId)?.scrollTo({
      top: document.getElementById(elementId)?.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    // メッセージ追加時の画像の自動生成
    const _length = contents.length;
    if (contents.length === 0) {
      return;
    }

    const message = contents[_length - 1];
    if (
      !loading &&
      message.role === 'assistant' &&
      message.content.prompt &&
      message.content.negativePrompt
    ) {
      setIsAutoGenerating(true);
      props
        .onGenerate(message.content.prompt, message.content.negativePrompt)
        .finally(() => {
          setIsAutoGenerating(false);
          scrollToBottom();
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, scrollToBottom]);

  const onSend = useCallback(() => {
    postChat(props.content);
    props.onChangeContent('');
    scrollToBottom();
  }, [postChat, props, scrollToBottom]);

  const onRetrySend = useCallback(() => {
    popMessage();
    const lastMessage = popMessage();
    postChat(lastMessage?.content ?? '');
  }, [popMessage, postChat]);

  return (
    <div className="relative size-full">
      <Card
        label="채팅 형식으로 이미지 생성"
        help="채팅 형식으로 프롬프트 생성 및 설정, 이미지 생성을 자동으로 수행합니다."
        className={`${props.className ?? ''} h-full pb-32`}>
        <div className="mb-2 flex w-full">
          <Select
            value={props.modelId}
            onChange={props.onChangeModel}
            options={props.modelIds.map((m) => {
              return { value: m, label: m };
            })}
          />
        </div>
        <div
          id="image-assistant-chat"
          className="h-full overflow-y-auto overflow-x-hidden pb-16">
          {contents.length === 0 && (
            <div className="rounded border border-gray-400 bg-gray-100/50 p-2 text-gray-600">
              <div className="flex items-center font-bold">
                <PiLightbulbFilamentBold className="mr-2" />
                팁
              </div>
              <div className="m-1 rounded border p-2 text-sm">
               구체적이고 상세한 지시를 내도록 합시다.
               형용사와 부사를 사용하여 정확하게 표현하는 것이 중요합니다.
              </div>
              <div className="m-1 rounded border p-2 text-sm">
               '개가 놀고 있다'가 아니라 '시바개가 초원에서 즐겁게 뛰어다니'처럼 구체적으로 지시를 합시다.
              </div>
              <div className="m-1 rounded border p-2 text-sm">
               문장으로 작성하기 어려운 경우에는 문장으로 작성할 필요가 없습니다. "건강, 공 놀이, 점프하고있다"와 같이 특징을 나열하고 지시를합시다.
              </div>
              <div className="m-1 rounded border p-2 text-sm">
               제외하고 싶은 요소도 지시할 수 있습니다. 「사람은 출력하지 않는다」 등.
              </div>
              <div className="m-1 rounded border p-2 text-sm">
                LLM
                하지만 대화의 흐름을 고려해 주기 때문에, 「역시 개가 아니고 고양이로 해」등의 대화 형식의 지시도 할 수 있습니다.
              </div>
              <div className="m-1 rounded border p-2 text-sm">
               프롬프트에서 의도한 이미지를 생성할 수 없는 경우 초기 이미지를 설정하거나 파라미터를 변경해 보세요.
              </div>
            </div>
          )}

          {contents.map((c, idx) => (
            <div
              key={idx}
              className={`mb-1 rounded border border-black/30 p-2 ${
                c.role === 'user' ? 'bg-gray-100' : ''
              }`}>
              {c.role === 'user' && (
                <>
                  {c.content.split('\n').map((m, idx) => (
                    <div key={idx}>{m}</div>
                  ))}
                </>
              )}
              {c.role === 'assistant' && c.content.error && (
                <div>
                  <div className="flex items-center gap-2 font-bold text-red-500">
                    <PiWarningFill />
                    오류
                  </div>
                  <div className="text-gray-600">
                   프롬프트를 생성하는 중에 오류가 발생했습니다.
                  </div>
                  <div className="mt-3 flex w-full justify-center">
                    <Button outlined onClick={onRetrySend}>
                      재실행
                    </Button>
                  </div>
                </div>
              )}
              {c.role === 'assistant' &&
                c.content.prompt === null &&
                !c.content.error && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="border-aws-sky size-5 animate-spin rounded-full border-4 border-t-transparent"></div>
                    프롬프트 생성 중
                  </div>
                )}
              {c.role === 'assistant' && c.content.prompt !== null && (
                <>
                  {contents.length - 1 === idx &&
                  props.isGeneratingImage &&
                  isAutoGenerating ? (
                    <>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="size-5 rounded-full border-4 border-gray-600"></div>
                        프롬프트 생성 완료
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="border-aws-sky size-5 animate-spin rounded-full border-4 border-t-transparent"></div>
                        이미지 생성 중
                      </div>
                    </>
                  ) : (
                    <>
                      {c.content.comment.split('\n').map((m, idx) => (
                        <div key={idx}>{m}</div>
                      ))}
                      <div className="mt-3">
                        <div className="font-bold">추천 StylePreset</div>
                        <div className="mt-1 grid grid-cols-2 gap-1 xl:flex xl:gap-3">
                          {c.content.recommendedStylePreset.flatMap(
                            (preset, idx) => (
                              <Button
                                key={idx}
                                onClick={() => {
                                  props.onGenerate(
                                    c.content.prompt ?? '',
                                    c.content.negativePrompt ?? '',
                                    preset
                                  );
                                }}>
                                {preset}
                              </Button>
                            )
                          )}
                          <Button
                            outlined
                            onClick={() => {
                              props.onGenerate(
                                c.content.prompt ?? '',
                                c.content.negativePrompt ?? '',
                                ''
                              );
                            }}>
                            미설정
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 z-0 -ml-2 flex w-full items-end justify-center pr-6">
          <InputChatContent
            placeholder="출력하고 싶은 이미지의 개요를 입력"
            fullWidth
            hideReset
            content={props.content}
            loading={loading || props.isGeneratingImage}
            onChangeContent={props.onChangeContent}
            onSend={onSend}
          />
        </div>
      </Card>
    </div>
  );
};

export default GenerateImageAssistant;
