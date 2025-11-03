import React from "react";

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  color: string;
}

const ActionButton: React.FC<ActionButtonProps> = React.memo(
  ({ icon: Icon, label, color }) => (
    <button
      className={`w-full bg-gradient-to-r ${color} hover:from-${
        color.split("-")[1]
      }-600 hover:to-${
        color.split("-")[3]
      }-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
    >
      <Icon className="inline-block h-5 w-5 mr-2" />
      {label}
    </button>
  ),
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
