import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  label: string;
  icon?: React.ElementType;
  name: string;
  type?: string;
  placeholder?: string;
  register?: any;
  errors?: any;
  showToggle?: boolean;
  showPassword?: boolean;
  togglePassword?: () => void;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string | number;
  step?: string | number;
}

const InputField: React.FC<InputFieldProps> = React.memo(
  ({
    label,
    icon: Icon,
    name,
    type = "text",
    placeholder = "",
    register,
    errors,
    showToggle,
    showPassword,
    togglePassword,
    value,
    onChange,
    min,
    step,
  }) => {
    const hasError = errors && !!errors[name];
    const isPassword = type === "password";

    return (
      <div>
        <label className="block text-sm font-semibold text-warm-700 mb-2">
          {label}
        </label>

        <div className="relative flex items-center">
          {Icon && !isPassword && (
            <div className="absolute left-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-warm-400" />
            </div>
          )}

          <input
            type={showToggle && showPassword ? "text" : type}
            {...(register ? register : { name, value, onChange })}
            min={min}
            step={step}
            className={`w-full ${
              Icon && !isPassword ? "pl-10" : "pl-4"
            } pr-10 py-3 border-2 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/50 ${
              hasError ? "border-red-400" : "border-warm-200"
            }`}
            placeholder={placeholder}
          />

          {showToggle && isPassword && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 text-warm-400 hover:text-warm-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {hasError && (
          <p className="mt-2 text-sm text-primary-600 flex items-center animate-pulse">
            ⚠️ {errors[name]?.message}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
