import React, { useCallback, useState } from 'react';
import { BaseProps } from '../../../@types/common';
import { produce } from 'immer';
import DraggablePromptItem, { DragPromptItem } from './DraggablePromptItem';
import { SystemContext } from '../../../@types/chat';
import { presetPrompts as PRESET_PROMPTS } from './presetPrompts';
import { useDrop } from 'react-dnd';
import usePrompt from './usePrompt';
import { PiCaretLeft, PiDesktopTower } from 'react-icons/pi';
import { twMerge } from 'tailwind-merge';
import Button from '../common/components/Button';
import useSystemContext from './useSystemContext';
import { PromptSetting } from '../../../@types/settings';

export const ItemTypes = {
  PROMPT_ITEM: 'promptItem',
  PRESET_ITEM: 'presetItem',
  SYSTEM_CONTEXT_ITEM: 'systemContextItem',
} as const;

export type ItemTypeValues = (typeof ItemTypes)[keyof typeof ItemTypes];

type Props = BaseProps & {
  onBack: () => void;
};

const PromptSettings: React.FC<Props> = (props) => {
  const [presetPrompts] = useState<SystemContext[]>([...PRESET_PROMPTS]);
  const { prompts, savePrompts } = usePrompt();
  const { systemContexts } = useSystemContext();

  const movePrompt = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      savePrompts((prev) =>
        produce(prev, (draft) => {
          draft.splice(dragIndex, 1);
          draft.splice(hoverIndex, 0, prev[dragIndex]);
        }),
      );
    },
    [savePrompts],
  );

  const renderAvailablePromptItem = useCallback((prompt: PromptSetting, index: number) => {
    return (
      <DraggablePromptItem
        className="mx-1 first:mt-1 last:mb-1"
        type={ItemTypes.PROMPT_ITEM}
        key={prompt.systemContextId}
        index={index}
        prompt={prompt}
        isPromptSetting
        isPreset={
          PRESET_PROMPTS.findIndex(
            (prompt_) => prompt_.systemContextId === prompt.systemContextId,
          ) > -1
        }
        movePrompt={movePrompt}
        onDelete={() => {
          savePrompts((prev) =>
            produce(prev, (draft) => {
              draft.splice(index, 1);
            }),
          );
        }}
        onChange={(prompt_) => {
          savePrompts((prev) =>
            produce(prev, (draft) => {
              draft[index] = prompt_;
            }),
          );
        }}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPromptItem = useCallback(
    (prompt: SystemContext, index: number, type: ItemTypeValues) => {
      return (
        <DraggablePromptItem
          className="mx-1 first:mt-1 last:mb-1"
          type={type}
          key={prompt.systemContextId}
          index={index}
          prompt={prompt}
          isPreset={type === 'presetItem'}
          canDrag={
            prompts.findIndex((prompt_) => prompt_.systemContextId === prompt.systemContextId) < 0
          }
        />
      );
    },
    [prompts],
  );

  const [, drop] = useDrop({
    accept: [ItemTypes.PRESET_ITEM, ItemTypes.SYSTEM_CONTEXT_ITEM],
    drop: (item: DragPromptItem) => {
      if (
        prompts.findIndex((prompt_) => prompt_.systemContextId === item.prompt.systemContextId) > -1
      ) {
        return;
      }
      savePrompts((prev) =>
        produce(prev, (draft) => {
          draft.splice(item.index, 0, item.prompt);
        }),
      );
    },
  });

  const [isSelectedPreset, setisSelectedPreset] = useState(false);

  return (
    <div className="p-2 h-dvh flex flex-col gap-2">
      <div>
        <div className="text-base font-semibold mb-1">프롬프트 설정</div>
        <div className="font-light text-aws-font-color-gray mb-1 text-xs">
          이 확장 프로그램에서 사용할 프롬프트를 설정합니다. 드래그 &
          드롭으로 설정할 수 있습니다. "사용하는 프롬프트"는 각 프롬프트에 대해 상세한 설정을 할 수 있습니다.
        </div>
      </div>

      <div className="h-1/2 flex flex-col">
        <div className="text-sm font-semibold mb-1">사용하는 프롬프트</div>
        <div ref={drop} className="h-full overflow-y-auto bg-white/10 border rounded">
          {prompts.map((prompt, i) => renderAvailablePromptItem(prompt, i))}
        </div>
      </div>

      <div className="h-1/2 flex flex-col">
        <div className="flex text-sm font-semibold">
          <div
            className={twMerge(
              'border border-b-0 p-2 rounded-tl cursor-pointer hover:bg-white/50',
              !isSelectedPreset ? 'bg-white/30' : '',
            )}
            onClick={() => {
              setisSelectedPreset(false);
            }}
          >
            등록된 시스템 프롬프트
          </div>
          <div
            className={twMerge(
              'border border-b-0 p-2 rounded-tr border-l-0 flex items-center gap-1 cursor-pointer hover:bg-white/50',
              isSelectedPreset ? 'bg-white/30' : '',
            )}
            onClick={() => {
              setisSelectedPreset(true);
            }}
          >
            <PiDesktopTower /> 프리셋
          </div>
        </div>
        <div className="h-full overflow-y-auto bg-white/10 border rounded-b rounded-tr">
          {isSelectedPreset
            ? presetPrompts.map((prompt, i) => renderPromptItem(prompt, i, 'presetItem'))
            : systemContexts.map((prompt, i) => renderPromptItem(prompt, i, 'systemContextItem'))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button outlined icon={<PiCaretLeft />} onClick={props.onBack}>
          뒤로
        </Button>
      </div>
    </div>
  );
};

export default PromptSettings;
