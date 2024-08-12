import { Fragment, useCallback, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { PiCaretUpDown, PiCheck, PiX } from 'react-icons/pi';
import RowItem, { RowItemProps } from './RowItem';
import ButtonIcon from './ButtonIcon';
import Help from './Help';

type Props = RowItemProps & {
  label?: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  help?: string;
  clearable?: boolean;
  fullWidth?: boolean;
  colorchip?: boolean;
  onChange: (value: string) => void;
};

const Select: React.FC<Props> = (props) => {
  const selectedOption = useMemo(() => {
    return props.value === ''
      ? null
      : props.options.find((o) => o.value === props.value);
  }, [props.options, props.value]);

  const onClear = useCallback(() => {
    props.onChange('');
  }, [props]);

  const renderColorChips = (value: string) => {
    const colors = value.split(',').map((color) => color.trim());
    return (
      <div className="flex items-center">
        {colors.map((color, index) => (
          <div
            key={index}
            style={{
              backgroundColor: color,
              width: '16px',
              height: '16px',
              marginRight: '4px',
              border: '1px solid #ccc',
            }}
          />
        ))}
      </div>
    );
  };

  const renderOptionContent = (option: { value: string; label: string }) => {
    if (props.colorchip) {
      return (
        <div className="flex items-center">
          {renderColorChips(option.value)}
          <span className="mr-2">{option.label}</span>
        </div>
      );
    }
    return option.label;
  };

  return (
    <RowItem notItem={props.notItem} className="relative">
      {props.label && (
        <div className="flex items-center">
          <span className="text-sm">{props.label}</span>
          {props.help && <Help className="ml-1" message={props.help} />}
        </div>
      )}
      <Listbox value={props.value} onChange={props.onChange}>
        <div className="relative">
          <Listbox.Button
            className={`relative h-8 cursor-pointer rounded border border-black/30 bg-white pl-3 pr-10 text-left focus:outline-none ${props.fullWidth ? 'w-full' : 'w-fit'}`}>
            <span className="block truncate">
              {selectedOption ? renderOptionContent(selectedOption) : ''}
            </span>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <PiCaretUpDown className="text-sm" />
            </span>
          </Listbox.Button>
          {props.clearable && props.value !== '' && (
            <span className="absolute inset-y-0 right-3 flex items-center pr-2">
              <ButtonIcon onClick={onClear}>
                <PiX className="text-sm" />
              </ButtonIcon>
            </span>
          )}
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-fit overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {props.options.map((option, idx) => (
              <Listbox.Option
                key={idx}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-aws-smile/10 text-aws-smile' : 'text-gray-900'
                  }`
                }
                value={option.value}>
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}>
                      {renderOptionContent(option)}
                    </span>
                    {selected ? (
                      <span className="text-aws-smile absolute inset-y-0 left-0 flex items-center pl-3">
                        <PiCheck className="size-5" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </RowItem>
  );
};

export default Select;
