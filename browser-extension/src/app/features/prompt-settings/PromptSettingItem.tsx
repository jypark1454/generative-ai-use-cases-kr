import React from 'react';
import { twMerge } from 'tailwind-merge';
import { BaseProps } from '../../../@types/common';
import { PromptSetting } from '../../../@types/settings';
import InputText from '../common/components/InputText';
import ButtonIcon from '../common/components/ButtonIcon';
import { PiTrash } from 'react-icons/pi';
import Button from '../common/components/Button';

import Checkbox from '../common/components/Checkbox';
import { produce } from 'immer';

type Props = BaseProps & {
  prompt: PromptSetting;
  disabled?: boolean;
  onChange?: (propmt: PromptSetting) => void;
};

const PromptSettingItem: React.FC<Props> = (props) => {
  return (
    <div className={twMerge('flex flex-col gap-1', props.className)}>
      <div>
        <div className="text-xs ">프롬프트</div>
        <textarea
          className={twMerge(
            'text-xs text-aws-font-color-gray border p-1 rounded bg-aws-squid-ink w-full resize-none',
          )}
          rows={13}
          value={props.prompt.systemContext}
        />
      </div>
      <div>
        <Checkbox
          label="양식 형식으로 입력"
          value={props.prompt.useForm ?? false}
          disabled={props.disabled}
          onChange={(checked) => {
            props.onChange
              ? props.onChange({
                  ...props.prompt,
                  useForm: checked,
                  formDefinitions: props.prompt.formDefinitions ?? [
                    {
                      label: '',
                      tag: '',
                      autoCopy: true,
                    },
                  ],
                })
              : null;
          }}
        />

        {props.prompt.useForm && (
          <div className="flex flex-col gap-1">
            {props.prompt.formDefinitions?.map((def, idx) => (
              <div className="flex gap-1 items-center" key={idx}>
                <InputText
                  label="라벨"
                  value={def.label}
                  disabled={props.disabled}
                  onChange={(val) => {
                    props.onChange
                      ? props.onChange({
                          ...props.prompt,
                          formDefinitions: produce(props.prompt.formDefinitions, (draft) => {
                            if (draft) {
                              draft[idx].label = val;
                            }
                          }),
                        })
                      : null;
                  }}
                />
                <InputText
                  label="프롬프트 태그"
                  value={def.tag}
                  disabled={props.disabled}
                  onChange={(val) => {
                    props.onChange
                      ? props.onChange({
                          ...props.prompt,
                          formDefinitions: produce(props.prompt.formDefinitions, (draft) => {
                            if (draft) {
                              draft[idx].tag = val;
                            }
                          }),
                        })
                      : null;
                  }}
                />
                <Checkbox
                  label="선택 부분을 자동 복사"
                  value={def.autoCopy}
                  disabled={props.disabled}
                  onChange={(val) => {
                    props.onChange
                      ? props.onChange({
                          ...props.prompt,
                          formDefinitions: produce(props.prompt.formDefinitions, (draft) => {
                            if (draft) {
                              draft[idx].autoCopy = val;
                            }
                          }),
                        })
                      : null;
                  }}
                />
                {props.onChange && (
                  <ButtonIcon
                    className="text-base mt-3"
                    onClick={() => {
                      props.onChange
                        ? props.onChange({
                            ...props.prompt,
                            formDefinitions: produce(props.prompt.formDefinitions, (draft) => {
                              if (draft) {
                                draft.splice(idx, 1);
                                if (draft.length === 0) {
                                  draft.push({
                                    autoCopy: true,
                                    label: '',
                                    tag: '',
                                  });
                                }
                              }
                            }),
                          })
                        : null;
                    }}
                  >
                    <PiTrash />
                  </ButtonIcon>
                )}
              </div>
            ))}

            {!props.disabled && (
              <div>
                <Button
                  className="ml-auto"
                  outlined
                  onClick={() => {
                    props.onChange
                      ? props.onChange({
                          ...props.prompt,
                          formDefinitions: produce(props.prompt.formDefinitions, (draft) => {
                            if (draft) {
                              draft.push({
                                autoCopy: false,
                                label: '',
                                tag: '',
                              });
                            }
                          }),
                        })
                      : null;
                  }}
                >
                  追加
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <Checkbox
          label="일문일답 형식으로 한다(대화 이력을 무시한다)"
          value={props.prompt.ignoreHistory ?? false}
          disabled={props.disabled}
          onChange={(checked) => {
            props.onChange
              ? props.onChange({
                  ...props.prompt,
                  ignoreHistory: checked,
                })
              : null;
          }}
        />
      </div>
      <div>
        <Checkbox
          label="확장 프로그램을 열 때 즉시 전송"
          value={props.prompt.directSend ?? false}
          disabled={props.disabled}
          onChange={(checked) => {
            props.onChange
              ? props.onChange({
                  ...props.prompt,
                  directSend: checked,
                })
              : null;
          }}
        />
      </div>
      <div>
        <Checkbox
          label="초기화된 상태에서 확장 기능 열기"
          value={props.prompt.initializeMessages ?? false}
          disabled={props.disabled}
          onChange={(checked) => {
            props.onChange
              ? props.onChange({
                  ...props.prompt,
                  initializeMessages: checked,
                })
              : null;
          }}
        />
      </div>
    </div>
  );
};

export default PromptSettingItem;
