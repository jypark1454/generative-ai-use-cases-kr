import React, { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import ExpandableField from '../components/ExpandableField';
import Switch from '../components/Switch';
import Select from '../components/Select';
import useChat from '../hooks/useChat';
import useLocalStorageBoolean from '../hooks/useLocalStorageBoolean';
import { create } from 'zustand';
import Texteditor from '../components/TextEditor';
import { DocumentComment } from 'generative-ai-use-cases-jp';
import debounce from 'lodash.debounce';
import { EditorialPageQueryParams } from '../@types/navigate';
import { MODELS } from '../hooks/useModel';
import { getPrompter } from '../prompts';
import queryString from 'query-string';

const REGEX_BRACKET = /\{(?:[^{}])*\}/g;
const REGEX_ZENKAKU =
  /[Ａ-Ｚａ-ｚ０-９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g;

type StateType = {
  sentence: string;
  setSentence: (s: string) => void;
  additionalContext: string;
  setAdditionalContext: (s: string) => void;
  comments: DocumentComment[];
  setComments: (comments: DocumentComment[]) => void;
  commentState: { [name: string]: boolean }; // excerpt -> bool
  setCommentState: (s: { [name: string]: boolean }) => void;
  clear: () => void;
};

const useEditorialPageState = create<StateType>((set) => {
  const INIT_STATE = {
    sentence: '',
    additionalContext: '',
    comments: [],
    commentState: {},
  };
  return {
    ...INIT_STATE,
    setSentence: (s: string) => {
      // Claude だと全角を半角に変換して出力するため入力を先に正規化
      const sentence = s
        .replace(REGEX_ZENKAKU, (s) => {
          return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
        })
        .replace(/[‐－―]/g, '-') // ハイフンなど
        .replace(/[～〜]/g, '~') // チルダ
        // eslint-disable-next-line no-irregular-whitespace
        .replace(/　/g, ' '); // スペース

      set(() => ({
        sentence,
      }));
    },
    setAdditionalContext: (s: string) => {
      set(() => ({
        additionalContext: s,
      }));
    },
    setComments: (comments: DocumentComment[]) => {
      set(() => ({
        comments: comments,
      }));
    },
    setCommentState: (s: { [name: string]: boolean }) => {
      set(() => ({
        commentState: s,
      }));
    },
    clear: () => {
      set(INIT_STATE);
    },
  };
});

const EditorialPage: React.FC = () => {
  const {
    sentence,
    setSentence,
    additionalContext,
    setAdditionalContext,
    comments,
    setComments,
    commentState,
    setCommentState,
    clear,
  } = useEditorialPageState();

  const { search } = useLocation();
  const { pathname } = useLocation();
  const {
    getModelId,
    setModelId,
    loading,
    messages,
    postChat,
    clear: clearChat,
    updateSystemContextByModel,
  } = useChat(pathname);
  const { modelIds: availableModels } = MODELS;
  const modelId = getModelId();
  const prompter = useMemo(() => {
    return getPrompter(modelId);
  }, [modelId]);
  const [auto, setAuto] = useLocalStorageBoolean('Auto_Editorial', true);

  useEffect(() => {
    updateSystemContextByModel();
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [prompter]);

  // Memo 変数
  const filterComment = (
    _comments: DocumentComment[],
    _commentState: { [name: string]: boolean }
  ) => {
    return _comments.filter(
      (x) =>
        x.excerpt &&
        _commentState[x.excerpt] === undefined &&
        x.excerpt !== x.replace
    );
  };
  const shownComment = useMemo(
    () => filterComment(comments, commentState),
    [comments, commentState]
  );
  const disabledExec = useMemo(() => {
    return sentence === '' || loading;
  }, [sentence, loading]);

  useEffect(() => {
    const _modelId = !modelId ? availableModels[0] : modelId;
    if (search !== '') {
      const params = queryString.parse(search) as EditorialPageQueryParams;
      setSentence(params.sentence ?? '');
      setModelId(
        availableModels.includes(params.modelId ?? '')
          ? params.modelId!
          : _modelId
      );
    } else {
      setModelId(_modelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSentence, modelId, availableModels, search]);

  // 文章の更新時にコメントを更新
  useEffect(() => {
    if (auto) {
      // debounce した後コメント更新
      onSentenceChange(
        sentence,
        additionalContext,
        comments,
        commentState,
        loading
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence]);

  // debounce した後コメントを更新
  // 入力を止めて1秒ほど待ってからコメントを更新し新規コメント追加リクエストを送信
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSentenceChange = useCallback(
    debounce(
      (
        _sentence: string,
        _additionalContext: string,
        _comments: DocumentComment[],
        _commentState: { [name: string]: boolean },
        _loading: boolean
      ) => {
        // ハイライト部分が変更されたらコメントを削除
        for (const _comment of _comments) {
          if (_sentence.indexOf(_comment.excerpt) === -1) {
            _commentState[_comment.excerpt] = true;
          }
        }
        setCommentState({ ..._commentState });

        // コメントがなくなったらコメントを取得
        const _shownComment = filterComment(_comments, _commentState);
        if (_shownComment.length === 0 && _sentence !== '' && !_loading) {
          getAnnotation(_sentence, _additionalContext);
        }
      },
      1000
    ),
    [prompter]
  );

  // コメントの更新時にリアルタイムで JSON 部分を抽出してコメントに変換
  useEffect(() => {
    if (messages.length === 0) return;
    const _lastMessage = messages[messages.length - 1];
    if (_lastMessage.role !== 'assistant') return;
    const _response = messages[messages.length - 1].content;
    const _comments = [..._response.matchAll(REGEX_BRACKET)].map((x) => {
      try {
        return JSON.parse(x[0]) as DocumentComment;
      } catch (error) {
        console.log(error);
        return { excerpt: '' };
      }
    });
    setComments(_comments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, commentState]);

  // コメントで指定された修正を実行
  const replaceSentence = (_comment: DocumentComment) => {
    if (_comment.replace) {
      setSentence(sentence.replace(_comment.excerpt, _comment.replace));
    }
    removeComment(_comment);
  };

  // コメントを削除
  const removeComment = (_comment: DocumentComment) => {
    commentState[_comment.excerpt] = true;
    setCommentState({ ...commentState });
  };

  // LLM にリクエスト送信
  const getAnnotation = (sentence: string, context: string) => {
    setCommentState({});
    postChat(
      prompter.editorialPrompt({
        sentence,
        context: context === '' ? undefined : context,
      }),
      true
    );
  };

  // コメントを取得
  const onClickExec = useCallback(() => {
    if (loading) return;
    getAnnotation(sentence, additionalContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence, additionalContext, loading, prompter]);

  // リセット
  const onClickClear = useCallback(() => {
    clear();
    clearChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-12">
      <div className="invisible col-span-12 my-0 flex h-0 items-center justify-center text-xl font-semibold lg:visible lg:my-5 lg:h-min print:visible print:my-5 print:h-min">
        교정
      </div>
      <div className="col-span-12 col-start-1 mx-2 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2">
        <Card label="교정하고 싶은 문장">
          <div className="mb-2 flex w-full flex-col justify-between sm:flex-row">
            <Select
              value={modelId}
              onChange={setModelId}
              options={availableModels.map((m) => {
                return { value: m, label: m };
              })}
            />
            <Switch label="자동 교정" checked={auto} onSwitch={setAuto} />
          </div>
          <Texteditor
            placeholder="입력해주세요"
            value={sentence}
            loading={loading}
            onChange={setSentence}
            comments={shownComment}
            replaceSentence={replaceSentence}
            removeComment={removeComment}
          />
          <ExpandableField label="추가 컨텍스트" optional>
            <Textarea
              placeholder="추가로 지적하고 싶은 점을 입력할 수 있습니다"
              value={additionalContext}
              onChange={setAdditionalContext}
            />
          </ExpandableField>
          <div className="flex justify-end gap-3">
            <Button outlined onClick={onClickClear} disabled={disabledExec}>
              지우기
            </Button>

            <Button disabled={disabledExec} onClick={onClickExec}>
              실행
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditorialPage;
