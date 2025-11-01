import React from "react";

interface SelectFieldProps {
  label: string;
  icon: React.ElementType;
  name: string;
  children: React.ReactNode;
  register?: any;
  errors?: any;
  disabled?: boolean;

  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectField: React.FC<SelectFieldProps> = React.memo(
  ({
    label,
    icon: Icon,
    name,
    children,
    register,
    errors,
    disabled,
    value,
    onChange,
  }) => {
    const hasError = errors && !!errors[name];

    return (
      <div>
        <label className="block text-sm font-semibold text-warm-700 mb-2">
          {label}
        </label>
        <div className="relative">
          <select
            {...(register ? register : { name, value, onChange })}
            disabled={disabled}
            onChange={(e) => {
              if (register?.onChange) register.onChange(e);
              onChange?.(e);
            }}
            className={`w-full px-4 py-3 border-2 rounded-xl text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/50 appearance-none disabled:opacity-50 ${
              hasError ? "border-red-400" : "border-warm-200"
            }`}
          >
            {children}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-warm-400" />
          </div>
        </div>
        {hasError && (
          <p className="mt-2 text-sm text-primary-600 flex items-center animate-pulse">
            Warning: {errors[name]?.message}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

export default SelectField;
