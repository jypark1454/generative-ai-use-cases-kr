import React, { useCallback, useEffect, useMemo } from 'react';
import Select from '../Select';
import Button from '../Button';
import useChat from '../../hooks/useChat';
import { useLocation } from 'react-router-dom';
import { MODELS } from '../../hooks/useModel';
import Markdown from '../Markdown';
import ButtonCopy from '../ButtonCopy';
import useTyping from '../../hooks/useTyping';
import { create } from 'zustand';
import Textarea from '../Textarea';
import { produce } from 'immer';
import ButtonFavorite from './ButtonFavorite';
import ButtonShare from './ButtonShare';
import ButtonUseCaseEdit from './ButtonUseCaseEdit';
import Skeleton from '../Skeleton';
import useMyUseCases from '../../hooks/useCaseBuilder/useMyUseCases';
import { UseCaseInputExample } from 'generative-ai-use-cases-jp';
import {
  extractPlaceholdersFromPromptTemplate,
  getItemsFromPlaceholders,
} from '../../utils/UseCaseBuilderUtils';

type Props = {
  modelId?: string;
  title: string;
  promptTemplate: string;
  description?: string;
  inputExamples?: UseCaseInputExample[];
  isLoading?: boolean;
} & (
  | {
      previewMode?: false;
      useCaseId: string;
      isFavorite: boolean;
      hasShared: boolean;
      canEdit?: boolean;
      onToggleFavorite: () => void;
      onToggleShared: () => void;
    }
  | {
      previewMode: true;
    }
);

type StateType = {
  text: string;
  setText: (s: string) => void;
  values: string[];
  setValue: (index: number, value: string) => void;
  clear: (valueLength: number) => void;
};

const useUseCaseBuilderViewState = create<StateType>((set, get) => {
  const INIT_STATE = {
    text: '',
    values: [],
  };
  return {
    ...INIT_STATE,
    setText: (s: string) => {
      set(() => ({
        text: s,
      }));
    },
    setValue: (index, value) => {
      set(() => ({
        values: produce(get().values, (draft) => {
          draft[index] = value;
        }),
      }));
    },
    clear: (valueLength: number) => {
      set({
        ...INIT_STATE,
        values: new Array(valueLength).fill(''),
      });
    },
  };
});

const UseCaseBuilderView: React.FC<Props> = (props) => {
  const { pathname } = useLocation();

  const { text, setText, values, setValue, clear } =
    useUseCaseBuilderViewState();
  const {
    getModelId,
    setModelId,
    loading,
    messages,
    postChat,
    clear: clearChat,
  } = useChat(pathname);
  const modelId = getModelId();
  const { modelIds: availableModels } = MODELS;
  const { setTypingTextInput, typingTextOutput } = useTyping(loading);
  const { updateRecentUseUseCase } = useMyUseCases();

  const placeholders = useMemo(() => {
    return extractPlaceholdersFromPromptTemplate(props.promptTemplate);
  }, [props.promptTemplate]);

  const items = useMemo(() => {
    return getItemsFromPlaceholders(placeholders);
  }, [placeholders]);

  useEffect(() => {
    clear(placeholders.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholders]);

  useEffect(() => {
    setModelId(
      availableModels.includes(props.modelId ?? '')
        ? props.modelId!
        : availableModels[0]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableModels, props.modelId, pathname]);

  useEffect(() => {
    setTypingTextInput(text);
  }, [text, setTypingTextInput]);

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

    let prompt = props.promptTemplate;
    placeholders.forEach((p, idx) => {
      prompt = prompt.replace(p, values[idx]);
    });
    postChat(prompt, true);
    if (!props.previewMode) {
      updateRecentUseUseCase(props.useCaseId);
    }
  }, [loading, placeholders, postChat, props, updateRecentUseUseCase, values]);

  // リセット
  const onClickClear = useCallback(() => {
    clear(placeholders.length);
    clearChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fillInputFromExample = useCallback(
    (inputs: Record<string, string>) => {
      Object.entries(inputs).forEach(([key, value]) => {
        const index = items.findIndex((item) => item.label === key);
        if (index > -1) {
          setValue(index, value);
        }
      });
    },
    [items, setValue]
  );

  return (
    <div className="relative">
      <div className="col-span-12 mb-4 flex h-0 items-center justify-center text-xl font-semibold">
        {props.isLoading
          ? '読み込み中...'
          : props.title
            ? props.title
            : '[タイトル未入力]'}
      </div>
      {!props.previewMode && (
        <div className="absolute -top-2 right-0">
          <div className="flex items-center gap-2">
            <ButtonFavorite
              isFavorite={props.isFavorite}
              disabled={props.isLoading}
              onClick={props.onToggleFavorite}
            />

            {props.canEdit && (
              <>
                <ButtonShare
                  hasShared={props.hasShared}
                  disabled={props.isLoading}
                  onClick={props.onToggleShared}
                />
                <ButtonUseCaseEdit useCaseId={props.useCaseId} />
              </>
            )}
          </div>
        </div>
      )}

      <div className="pb-4 text-sm text-gray-600">
        {props.description ?? ''}
      </div>

      <div className="mb-2 flex w-full flex-col justify-between sm:flex-row">
        <Select
          value={modelId}
          onChange={setModelId}
          options={availableModels.map((m) => {
            return { value: m, label: m };
          })}
        />
      </div>
      {props.isLoading && (
        <div className="my-3 flex flex-col gap-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}
      {!props.isLoading && (
        <>
          <div className="flex flex-col ">
            {items.map((item, idx) => (
              <div key={idx}>
                <Textarea
                  label={item.label}
                  rows={2}
                  value={values[idx]}
                  onChange={(v) => {
                    setValue(idx, v);
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}
      <div className="flex flex-1 items-end justify-between">
        <div>
          {props.inputExamples && props.inputExamples.length > 0 && (
            <>
              <div className="mb-1 text-sm font-bold text-gray-600">入力例</div>
              <div className="flex flex-wrap gap-2">
                {props.inputExamples.map((inputExample, idx) => {
                  return (
                    <div
                      key={idx}
                      className="cursor-pointer rounded-full border px-4 py-1 text-sm text-gray-600 hover:bg-gray-100"
                      onClick={() => {
                        fillInputFromExample(inputExample.examples);
                      }}>
                      {inputExample.title}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="flex shrink-0 gap-3 ">
          <Button outlined onClick={onClickClear} disabled={props.isLoading}>
            クリア
          </Button>

          <Button onClick={onClickExec} disabled={props.isLoading}>
            実行
          </Button>
        </div>
      </div>

      <div className="mt-5 rounded border border-black/30 p-1.5">
        <Markdown>{typingTextOutput}</Markdown>
        {!loading && text === '' && (
          <div className="text-gray-500">実行結果がここに表示されます</div>
        )}
        {loading && (
          <div className="border-aws-sky size-5 animate-spin rounded-full border-4 border-t-transparent"></div>
        )}
        <div className="flex w-full justify-end">
          <ButtonCopy text={text} interUseCasesKey="text"></ButtonCopy>
        </div>
      </div>
    </div>
  );
};

export default UseCaseBuilderView;
