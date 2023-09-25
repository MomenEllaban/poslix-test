import classNames from 'classnames';

interface IMainTextInputProps {
  name: string;
  label: string;
  placeholder?: string;
  value: string | number;
  defaultValue?: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function MainTextInput(props: IMainTextInputProps) {
  const {
    name,
    label,
    autoFocus = false,
    placeholder,
    value,
    defaultValue,
    onChange,
    type,
    disabled,
    required,
    className,
    style,
  } = props;

  return (
    <div className="form-group d-flex flex-column gap-1">
      <label htmlFor={name}>{label}</label>
      <input
        autoFocus={autoFocus}
        type={type}
        id={name}
        name={name}
        className={classNames('rounded', className)}
        style={style}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
