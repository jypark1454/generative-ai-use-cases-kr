import React, { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import Markdown from '../components/Markdown';
import ButtonCopy from '../components/ButtonCopy';
import Select from '../components/Select';
import useChat from '../hooks/useChat';
import useTyping from '../hooks/useTyping';
import { create } from 'zustand';
import { GenerateTextPageQueryParams } from '../@types/navigate';
import { MODELS } from '../hooks/useModel';
import { getPrompter } from '../prompts';
import queryString from 'query-string';

type StateType = {
  information: string;
  setInformation: (s: string) => void;
  context: string;
  setContext: (s: string) => void;
  text: string;
  setText: (s: string) => void;
  clear: () => void;
};

const useGenerateTextPageState = create<StateType>((set) => {
  const INIT_STATE = {
    information: '',
    context: '',
    text: '',
  };
  return {
    ...INIT_STATE,
    setInformation: (s: string) => {
      set(() => ({
        information: s,
      }));
    },
    setContext: (s: string) => {
      set(() => ({
        context: s,
      }));
    },
    setText: (s: string) => {
      set(() => ({
        text: s,
      }));
    },
    clear: () => {
      set(INIT_STATE);
    },
  };
});

const GenerateTextPage: React.FC = () => {
  const {
    information,
    setInformation,
    context,
    setContext,
    text,
    setText,
    clear,
  } = useGenerateTextPageState();
  const { pathname, search } = useLocation();
  const {
    getModelId,
    setModelId,
    loading,
    messages,
    postChat,
    continueGeneration,
    clear: clearChat,
    updateSystemContextByModel,
    getStopReason,
  } = useChat(pathname);
  const { setTypingTextInput, typingTextOutput } = useTyping(loading);
  const { modelIds: availableModels } = MODELS;
  const modelId = getModelId();
  const prompter = useMemo(() => {
    return getPrompter(modelId);
  }, [modelId]);
  const stopReason = getStopReason();

  useEffect(() => {
    updateSystemContextByModel();
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [prompter]);

  const disabledExec = useMemo(() => {
    return information === '' || loading;
  }, [information, loading]);

  useEffect(() => {
    const _modelId = !modelId ? availableModels[0] : modelId;
    if (search !== '') {
      const params = queryString.parse(search) as GenerateTextPageQueryParams;
      setInformation(params.information ?? '');
      setContext(params.context ?? '');

      setModelId(
        availableModels.includes(params.modelId ?? '')
          ? params.modelId!
          : _modelId
      );
    } else {
      setModelId(_modelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setInformation, setContext, modelId, availableModels, search]);

  useEffect(() => {
    setTypingTextInput(text);
  }, [text, setTypingTextInput]);

  const getGeneratedText = (information: string, context: string) => {
    postChat(
      prompter.generateTextPrompt({
        information,
        context,
      }),
      true
    );
  };

  // リアルタイムにレスポンスを表示
  useEffect(() => {
    if (messages.length === 0) return;
    const _lastMessage = messages[messages.length - 1];
    if (_lastMessage.role !== 'assistant') return;
    const _response = messages[messages.length - 1].content;
    setText(_response.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // 要約を実行
  const onClickExec = useCallback(() => {
    if (loading) return;
    getGeneratedText(information, context);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [information, context, loading]);

  // リセット
  const onClickClear = useCallback(() => {
    clear();
    clearChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-12">
      <div className="invisible col-span-12 my-0 flex h-0 items-center justify-center text-xl font-semibold lg:visible lg:my-5 lg:h-min print:visible print:my-5 print:h-min">
        기사 생성
      </div>
      <div className="col-span-12 col-start-1 mx-2 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2">
        <Card label="문장의 기초가 되는 정보">
          <div className="mb-2 flex w-full">
            <Select
              value={modelId}
              onChange={setModelId}
              options={availableModels.map((m) => {
                return { value: m, label: m };
              })}
            />
          </div>

          <Textarea
            placeholder="입력해주세요"
            value={information}
            onChange={setInformation}
            maxHeight={-1}
          />

          <Textarea
            placeholder="문장의 형식을 알려주십시오. (마크 다운, 블로그, 비즈니스 메일 등)"
            value={context}
            onChange={setContext}
          />

          <div className="flex justify-end gap-3">
            {stopReason === 'max_tokens' && (
              <Button onClick={continueGeneration}>계속 출력</Button>
            )}

            <Button outlined onClick={onClickClear} disabled={disabledExec}>
              지우기
            </Button>

            <Button disabled={disabledExec} onClick={onClickExec}>
              실행
            </Button>
          </div>

          <div className="mt-5 rounded border border-black/30 p-1.5">
            <Markdown>{typingTextOutput}</Markdown>
            {!loading && text === '' && (
              <div className="text-gray-500">
                생성된 문장이 여기에 표시됩니다.
              </div>
            )}
            {loading && (
              <div className="border-aws-sky size-5 animate-spin rounded-full border-4 border-t-transparent"></div>
            )}
            <div className="flex w-full justify-end">
              <ButtonCopy text={text} interUseCasesKey="text"></ButtonCopy>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GenerateTextPage;
