import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ButtonIcon from '../../components/ButtonIcon';
import Textarea from '../../components/Textarea';
import { create } from 'zustand';
import RowItem from '../../components/RowItem';
import AppBuilderView from '../../components/useCaseBuilder/UseCaseBuilderView';
import InputText from '../../components/InputText';
import { PiPlus, PiQuestion, PiTrash, PiEye, PiX } from 'react-icons/pi';
import useMyUseCases from '../../hooks/useCaseBuilder/useMyUseCases';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useUseCase from '../../hooks/useCaseBuilder/useUseCase';
import LoadingOverlay from '../../components/LoadingOverlay';
import { ROUTE_INDEX_USE_CASE_BUILDER } from '../../main';
import ModalDialogDeleteUseCase from '../../components/useCaseBuilder/ModalDialogDeleteUseCase';
import UseCaseBuilderHelp from '../../components/useCaseBuilder/UseCaseBuilderHelp';
import { UseCaseInputExample } from 'generative-ai-use-cases-jp';
import { produce } from 'immer';
import {
  NOLABEL,
  extractPlaceholdersFromPromptTemplate,
  getItemsFromPlaceholders,
  getTextFormItemsFromItems,
} from '../../utils/UseCaseBuilderUtils';
import usePageTitle from '../../hooks/usePageTitle';
import Select from '../../components/Select';
import Switch from '../../components/Switch';
import { MODELS } from '../../hooks/useModel';

type ErrorWithMenu = {
  message: string;
  menu: string;
};

const ErrorMesage: React.FC<{
  message: string;
  onClick: () => void;
}> = (props: { message: string; onClick: () => void }) => {
  return (
    <li
      className="text-aws-smile cursor-pointer text-xs font-bold leading-6 underline"
      onClick={props.onClick}>
      {props.message}
    </li>
  );
};

type StateType = {
  useCaseId: string | null;
  setUseCaseId: (s: string | null) => void;
  title: string;
  setTitle: (s: string) => void;
  description: string;
  setDescription: (s: string) => void;
  promptTemplate: string;
  setPromptTemplate: (s: string) => void;
  inputExamples: UseCaseInputExample[];
  pushInputExample: (inputExample: UseCaseInputExample) => void;
  removeInputExample: (index: number) => void;
  setInputExample: (index: number, inputExample: UseCaseInputExample) => void;
  setInputExamples: (inputExamples: UseCaseInputExample[]) => void;
  fixedModelId: string;
  setFixedModelId: (m: string) => void;
  fileUpload: boolean;
  setFileUpload: (u: boolean) => void;
  clear: () => void;
};

const useUseCaseBuilderEditPageState = create<StateType>((set, get) => {
  const INIT_STATE = {
    title: '',
    description: '',
    promptTemplate: '',
    inputExamples: [],
    fixedModelId: '',
    fileUpload: false,
  };
  return {
    ...INIT_STATE,
    useCaseId: null,
    setUseCaseId: (s) => {
      set(() => ({
        useCaseId: s,
      }));
    },
    setTitle: (s) => {
      set(() => ({
        title: s,
      }));
    },
    setDescription: (s) => {
      set(() => ({
        description: s,
      }));
    },
    setPromptTemplate: (s) => {
      set(() => ({
        promptTemplate: s,
      }));
    },
    pushInputExample: (inputExample) => {
      set(() => ({
        inputExamples: produce(get().inputExamples, (draft) => {
          draft.push(inputExample);
        }),
      }));
    },
    removeInputExample: (index) => {
      set(() => ({
        inputExamples: produce(get().inputExamples, (draft) => {
          draft.splice(index, 1);
        }),
      }));
    },
    setInputExample: (index, inputExample) => {
      set(() => ({
        inputExamples: produce(get().inputExamples, (draft) => {
          draft[index] = inputExample;
        }),
      }));
    },
    setInputExamples: (inputExamples) => {
      set(() => ({
        inputExamples: inputExamples,
      }));
    },
    setFixedModelId: (m: string) => {
      set(() => ({
        fixedModelId: m,
      }));
    },
    setFileUpload: (u: boolean) => {
      set(() => ({
        fileUpload: u,
      }));
    },
    clear: () => {
      set(INIT_STATE);
    },
  };
});

const UseCaseBuilderEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { useCaseId: useCaseIdPathParam } = useParams();
  const { state } = useLocation();

  const {
    title,
    setTitle,
    promptTemplate,
    setPromptTemplate,
    description,
    setDescription,
    useCaseId,
    setUseCaseId,
    inputExamples,
    pushInputExample,
    setInputExample,
    setInputExamples,
    removeInputExample,
    fixedModelId,
    setFixedModelId,
    fileUpload,
    setFileUpload,
    clear,
  } = useUseCaseBuilderEditPageState();

  const { useCase, isLoading } = useUseCase(useCaseId ?? useCaseIdPathParam);

  const {
    createUseCase,
    updateUseCase,
    deleteUseCase,
    updateRecentUseUseCase,
  } = useMyUseCases();
  const { setPageTitle } = usePageTitle();

  const [isDisabledUpdate, setIsDisabledUpdate] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isPreview, setIsPreview] = useState(true);

  // 作成条件を満たしていない場合のエラーメッセージ
  const [createErrorMessages, setCreateErrorMessages] = useState<
    ErrorWithMenu[]
  >([]);
  // 更新条件を満たしていない場合のエラーメッセージ
  const [updateErrorMessages, setUpdateErrorMessages] = useState<
    ErrorWithMenu[]
  >([]);

  const { modelIds: availableModels } = MODELS;

  useEffect(() => {
    // 初期表示時にIDを設定する
    setUseCaseId(useCaseIdPathParam ?? null);
  }, [setUseCaseId, useCaseIdPathParam]);

  useEffect(() => {
    // DBからデータを取得した場合
    if (useCaseId) {
      setTitle(useCase?.title ?? '');
      setPromptTemplate(useCase?.promptTemplate ?? '');
      setDescription(useCase?.description ?? '');
      setInputExamples(useCase?.inputExamples ?? []);
      setFixedModelId(useCase?.fixedModelId ?? '');
      setFileUpload(!!useCase?.fileUpload);

      // サンプル集から遷移した場合（RouterのStateから設定）
    } else if (state) {
      setTitle(state.title ?? '');
      setPromptTemplate(state.promptTemplate ?? '');
      setDescription(state.description ?? '');
      setInputExamples(state.inputExamples ?? []);
      setFixedModelId(state.fixedModelId ?? '');
      setFileUpload(!!state.fileUpload);
    } else {
      clear();
    }

    // 初期表示時は、更新ボタンをdisabledにする
    setIsDisabledUpdate(true);
  }, [
    useCaseId,
    useCase,
    state,
    setTitle,
    setPromptTemplate,
    setDescription,
    setInputExamples,
    setFixedModelId,
    setFileUpload,
    clear,
    setIsDisabledUpdate,
  ]);

  // プロンプトテンプレート中にあるプレースホルダ
  const placeholders = useMemo(() => {
    return extractPlaceholdersFromPromptTemplate(promptTemplate);
  }, [promptTemplate]);

  // プレースホルダをObjectに変換
  const items = useMemo(() => {
    return getItemsFromPlaceholders(placeholders);
  }, [placeholders]);

  const textFormItems = useMemo(() => {
    return getTextFormItemsFromItems(items);
  }, [items]);

  const isUpdate = useMemo(() => {
    return !!useCaseId;
  }, [useCaseId]);

  const menu = useMemo(() => {
    const base: string[] = [
      '앱 정의',
      '입력 예시',
      '모델 선택',
      '파일 첨부',
    ];

    if (isUpdate) {
      return [...base, '수정', '삭제'];
    } else {
      return [...base, '만들기'];
    }
  }, [isUpdate]);

  const [currentMenu, setCurrentMenu] = useState(menu[0]);

  // ページタイトルの設定
  useEffect(() => {
    setPageTitle(isUpdate ? '유스 케이스 편집' : '유스 케이스 신규 작성');
  }, [isUpdate, setPageTitle]);

  useEffect(() => {
    const tmp = [];

    // eslint-disable-next-line no-irregular-whitespace
    if (title.replace(/[ 　]/g, '') === '') {
      tmp.push({
        menu: '앱 정의',
        message: '제목을 입력하세요',
      });
    }

    // eslint-disable-next-line no-irregular-whitespace
    if (promptTemplate.replace(/[ 　]/g, '') === '') {
      tmp.push({
        menu: '앱 정의',
        message: '프롬프트 템플릿을 입력하세요.',
      });
    }

    if (placeholders.length === 0 && !fileUpload) {
      tmp.push({
        menu: '앱 정의',
        message:
          '사용 사례가 사용자 입력을 수락하지 않습니다. 프롬프트 템플릿에 placeholder를 추가하거나 파일 첨부를 켜십시오.',
      });
    }

    setCreateErrorMessages(tmp);
  }, [
    placeholders.length,
    promptTemplate,
    title,
    fileUpload,
    setCreateErrorMessages,
  ]);

  useEffect(() => {
    const tmp = [];

    if (isDisabledUpdate) {
      tmp.push({
        menu: '앱 정의',
        message: '업데이트 내용 없음',
      });
    }

    setUpdateErrorMessages(tmp);
  }, [isDisabledUpdate, setUpdateErrorMessages]);

  // ページ遷移時に存在しないメニューが表示されないようにする
  useEffect(() => {
    const idx = menu.indexOf(currentMenu);

    if (idx < 0) {
      setCurrentMenu(menu[0]);
    }
  }, [menu, currentMenu]);

  const canCreate = useMemo(() => {
    return createErrorMessages.length === 0;
  }, [createErrorMessages]);

  const canUpdate = useMemo(() => {
    return createErrorMessages.length === 0 && updateErrorMessages.length === 0;
  }, [createErrorMessages, updateErrorMessages]);

  const onClickRegister = useCallback(() => {
    setIsPosting(true);

    if (isUpdate) {
      updateUseCase({
        useCaseId: useCaseId!,
        title,
        promptTemplate,
        description: description === '' ? undefined : description,
        inputExamples,
        fixedModelId,
        fileUpload,
      })
        .then(() => {
          // DB変更直後は更新ボタンをDisabledにする
          setIsDisabledUpdate(true);
        })
        .finally(() => {
          setIsPosting(false);
        });
    } else {
      createUseCase({
        title,
        promptTemplate,
        description: description === '' ? undefined : description,
        inputExamples,
        fixedModelId,
        fileUpload,
      })
        .then(async (res) => {
          setUseCaseId(res.useCaseId);

          // 新規登録したら利用履歴に表示する（Drawerに表示する目的）
          await updateRecentUseUseCase(res.useCaseId);

          // 実行画面に遷移
          navigate(`${ROUTE_INDEX_USE_CASE_BUILDER}/execute/${res.useCaseId}`);
        })
        .finally(() => {
          setIsPosting(false);
        });
    }
  }, [
    createUseCase,
    description,
    inputExamples,
    isUpdate,
    navigate,
    promptTemplate,
    setUseCaseId,
    title,
    updateRecentUseUseCase,
    updateUseCase,
    useCaseId,
    fixedModelId,
    fileUpload,
  ]);

  const onClickDelete = useCallback(() => {
    if (!useCaseId) {
      return;
    }
    setIsDeleting(true);
    deleteUseCase(useCaseId)
      .then(() => {
        navigate(ROUTE_INDEX_USE_CASE_BUILDER);
      })
      .finally(() => {
        setIsDeleting(false);
      });
  }, [deleteUseCase, navigate, useCaseId]);

  return (
    <>
      <ModalDialogDeleteUseCase
        isOpen={isOpenDeleteDialog}
        targetLabel={title}
        onDelete={onClickDelete}
        onClose={() => {
          setIsOpenDeleteDialog(false);
        }}
      />
      {(isLoading || isDeleting || isPosting) && (
        <div className="absolute left-0 top-0">
          <LoadingOverlay>
            {isLoading
              ? '로드 중...'
              : isDeleting
                ? '削除中...'
                : isUpdate
                  ? '更新中...'
                  : '作成中...'}
          </LoadingOverlay>
        </div>
      )}

      <div className="grid h-screen grid-cols-12 gap-4 p-4">
        <div className="invisible col-span-12 my-0 flex h-0 items-center justify-center lg:visible lg:h-min print:visible print:h-min">
          <div className=" text-xl font-semibold">
            {isUpdate ? '유스 케이스 편집' : '유스 케이스 신규 작성'}
          </div>
        </div>

        <div className="col-span-12 flex flex-row lg:col-span-2 lg:flex-col 2xl:col-span-1">
          {menu.map((m, idx) => {
            if (currentMenu === m) {
              return (
                <div
                  key={idx}
                  className={`text-aws-smile border-aws-smile cursor-pointer border-b-2 px-2 py-2 text-sm font-bold lg:border-b-0 lg:border-r-2`}
                  onClick={() => {
                    setCurrentMenu(m);
                  }}>
                  {m}
                </div>
              );
            } else {
              return (
                <div
                  key={idx}
                  className={`hover:text-aws-smile cursor-pointer border-b-2 border-gray-200 px-2 py-2 text-sm text-gray-800 lg:border-b-0 lg:border-r-2`}
                  onClick={() => {
                    setCurrentMenu(m);
                  }}>
                  {m}
                </div>
              );
            }
          })}
        </div>

        <div className="col-span-12 lg:col-span-5">
          <Card label={currentMenu} className="relative">
            {currentMenu === '앱 정의' && (
              <>
                <RowItem>
                  <InputText
                    label="제목"
                    value={title}
                    onChange={(v) => {
                      setTitle(v);
                      setIsDisabledUpdate(false);
                    }}
                    required
                  />
                </RowItem>

                <RowItem>
                  <Textarea
                    label="개요"
                    rows={1}
                    value={description}
                    onChange={(v) => {
                      setDescription(v);
                      setIsDisabledUpdate(false);
                    }}
                  />
                </RowItem>
                <RowItem>
                  <Textarea
                    label="프롬프트 템플릿"
                    rows={30}
                    maxHeight={500}
                    value={promptTemplate}
                    onChange={(v) => {
                      setPromptTemplate(v);
                      setIsDisabledUpdate(false);
                    }}
                    placeholder="프런트 템플릿 작성 방법은 '도움말' 또는 '샘플집'을 참고하세요."
                    hint="사용자 입력을 허용하지 않는 사용 사례는 생성할 수 없습니다. 프롬프트 템플릿에 Placeholder를 정의하거나 파일 첨부 기능을 ON으로 설정해야 합니다."
                    required
                  />
                </RowItem>
              </>
            )}

            {currentMenu === '입력 예시' && (
              <div className="mt-2 flex flex-col gap-2">
                {inputExamples.map((inputExample, idx) => {
                  return (
                    <div key={idx} className="rounded border px-4 pt-2">
                      <div className="flex flex-col">
                        <div className="relative mb-4">
                          <InputText
                            label="제목"
                            value={inputExample.title}
                            onChange={(v) => {
                              setInputExample(idx, {
                                ...inputExample,
                                title: v,
                              });
                              setIsDisabledUpdate(false);
                            }}
                          />
                          <ButtonIcon
                            className="absolute -right-1 -top-1 h-6 w-6"
                            onClick={() => {
                              removeInputExample(idx);
                            }}>
                            <PiX className="" />
                          </ButtonIcon>
                        </div>

                        {textFormItems.map((item, itemIndex) => {
                          return (
                            <Textarea
                              key={itemIndex}
                              label={
                                item.label !== NOLABEL ? item.label : undefined
                              }
                              rows={item.inputType === 'text' ? 2 : 1}
                              value={
                                inputExample.examples
                                  ? inputExample.examples[item.label]
                                  : ''
                              }
                              onChange={(v) => {
                                setInputExample(idx, {
                                  title: inputExample.title,
                                  examples: produce(
                                    inputExample.examples,
                                    (draft) => {
                                      draft[item.label] = v;
                                    }
                                  ),
                                });
                                setIsDisabledUpdate(false);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <Button
                  outlined
                  onClick={() => {
                    const examples: Record<string, string> = {};
                    items.forEach((item) => {
                      examples[item.label] = '';
                    });
                    pushInputExample({
                      title: '',
                      examples,
                    });
                  }}>
                  <PiPlus className="pr-2 text-xl" />
                  입력 예시 추가
                </Button>
              </div>
            )}

            {currentMenu === '모델 선택' && (
              <div className="mt-4 flex flex-col gap-y-2">
                <Switch
                  checked={fixedModelId !== ''}
                  label={
                    fixedModelId !== ''
                      ? '모델이 고정되어 있습니다.'
                      : '모델이 고정되어 있지 않습니다.'
                  }
                  onSwitch={() => {
                    if (fixedModelId !== '') {
                      setFixedModelId('');
                    } else {
                      setFixedModelId(availableModels[0]);
                    }
                    setIsDisabledUpdate(false);
                  }}
                />

                {fixedModelId !== '' && (
                  <Select
                    value={fixedModelId}
                    onChange={(m) => {
                      setFixedModelId(m);
                      setIsDisabledUpdate(false);
                    }}
                    options={availableModels.map((m) => {
                      return { value: m, label: m };
                    })}
                  />
                )}

                <div className="text-xs text-gray-800">
                  {fixedModelId !== '' ? (
                    <>
                      모델 선택 UI가 표시되지 않기 때문에 사용자는 생성된 AI의 존재를 의식하지 않고
                      의 존재를 의식하지 않고도 사용 사례를 사용할 수 있습니다.
                    </>
                  ) : (
                    <>
                      모델 선택 UI
                      가 표시되며, 사용자는 자유롭게 모델을 선택할 수 있습니다.
                    </>
                  )}
                </div>
              </div>
            )}

            {currentMenu === '파일 첨부' && (
              <div className="mt-4 flex flex-col gap-y-2">
                <Switch
                  checked={fileUpload}
                  label={
                    fileUpload
                      ? 'ファイルを添付できます'
                      : 'ファイルは添付できません'
                  }
                  onSwitch={() => {
                    setFileUpload(!fileUpload);
                    setIsDisabledUpdate(false);
                  }}
                />

                <div className="text-xs text-gray-800">
                  添付可能なファイルはモデルによって異なります
                </div>
              </div>
            )}

            {currentMenu === '作成' && (
              <div className="mt-4 flex flex-col gap-y-2">
                <div className="text-xs text-gray-800">
                  ユースケースを作成します。プレビューで動作確認してから作成してください。作成後に編集することも可能です。
                </div>
                {createErrorMessages.length > 0 && (
                  <div className="my-2 flex flex-col gap-y-2">
                    <div className="text-aws-smile text-xs font-bold">
                      作成可能なユースケースの条件を満たしていません。以下条件を全て満たしてください。
                    </div>
                    <ul className="list-inside list-disc">
                      {createErrorMessages.map((m, idx) => (
                        <ErrorMesage
                          message={m.message}
                          key={idx}
                          onClick={() => {
                            setCurrentMenu(m.menu);
                          }}
                        />
                      ))}
                    </ul>
                  </div>
                )}
                <Button disabled={!canCreate} onClick={onClickRegister}>
                  作成
                </Button>
              </div>
            )}

            {currentMenu === '更新' && (
              <div className="mt-4 flex flex-col gap-y-2">
                <div className="text-xs text-gray-800">
                  ユースケースを更新します。ユースケースが共有され他ユーザーも利用している場合、その内容も更新されます。
                </div>
                {(createErrorMessages.length > 0 ||
                  updateErrorMessages.length > 0) && (
                  <div className="my-2 flex flex-col gap-y-2">
                    <div className="text-aws-smile text-xs font-bold">
                      更新するためには、以下条件を全て満たしてください。
                    </div>
                    <ul className="list-disc pl-4">
                      {[...createErrorMessages, ...updateErrorMessages].map(
                        (m, idx) => (
                          <ErrorMesage
                            message={m.message}
                            key={idx}
                            onClick={() => {
                              setCurrentMenu(m.menu);
                            }}
                          />
                        )
                      )}
                    </ul>
                  </div>
                )}
                <Button disabled={!canUpdate} onClick={onClickRegister}>
                  更新
                </Button>
              </div>
            )}

            {currentMenu === '削除' && (
              <div className="mt-4 flex flex-col gap-y-2">
                <div className="text-xs text-gray-800">
                  ユースケースを削除します。共有されている場合、他のユーザーからもアクセスできなくなります。
                </div>
                <Button
                  className="bg-red-600"
                  onClick={() => {
                    setIsOpenDeleteDialog(true);
                  }}>
                  <PiTrash className="mr-2" />
                  削除
                </Button>
              </div>
            )}
          </Card>
        </div>
        <div className="col-span-12 min-h-[calc(100vh-2rem)] lg:col-span-5 2xl:col-span-6">
          <Card
            label={`${isPreview ? '미리보기' : '도움말'}`}
            className="relative">
            <div className="absolute right-3 top-3 flex rounded border text-xs font-bold">
              <div
                className={`my-1 ml-1 flex cursor-pointer items-center rounded px-2 py-1 ${isPreview ? 'bg-gray-600 text-white' : 'text-gray-600'}`}
                onClick={() => {
                  setIsPreview(true);
                }}>
                <PiEye className="mr-1 text-base" />
                미리보기
              </div>
              <div
                className={`my-1 mr-1 flex cursor-pointer items-center rounded px-4 py-1.5 ${isPreview ? 'text-gray-600' : 'bg-gray-600 text-white'}`}
                onClick={() => {
                  setIsPreview(false);
                }}>
                <PiQuestion className="mr-1 text-base" />
                도움말
              </div>
            </div>

            {isPreview ? (
              <AppBuilderView
                title={title}
                promptTemplate={promptTemplate}
                description={description}
                inputExamples={inputExamples}
                fixedModelId={fixedModelId}
                fileUpload={fileUpload}
                previewMode
              />
            ) : (
              <UseCaseBuilderHelp />
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default UseCaseBuilderEditPage;
