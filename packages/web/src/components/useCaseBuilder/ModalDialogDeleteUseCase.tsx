import React from 'react';
import ModalDialog from '../ModalDialog';
import Button from '../Button';
import { BaseProps } from '../../@types/common';
import Alert from '../Alert';

type Props = BaseProps & {
  isOpen: boolean;
  targetLabel: string;
  isShared?: boolean;
  onDelete: () => void;
  onClose: () => void;
};

const ModalDialogDeleteUseCase: React.FC<Props> = (props) => {
  return (
    <ModalDialog
      isOpen={props.isOpen}
      title="내 사용 사례 삭제"
      onClose={() => {
        props.onClose();
      }}>
      <div className="flex flex-col gap-2">
        {props.isShared && (
          <Alert severity="warning" className="mb-2">
            이 사용 사례는 공유됩니다. 삭제하면 모든 사용자가 이 사용 사례를 사용할 수 없게 됩니다.
          </Alert>
        )}
        <div>
          <strong>{props.targetLabel}</strong>を削除しますか？
        </div>

        <div className="flex justify-end gap-2">
          <Button
            outlined
            onClick={() => {
              props.onClose();
            }}>
            キャンセル
          </Button>
          <Button
            className="bg-red-600"
            onClick={() => {
              props.onDelete();
            }}>
            삭제
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
};

export default ModalDialogDeleteUseCase;
