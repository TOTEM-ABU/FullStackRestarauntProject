import React from "react";

interface StatCardProps {
  name: string;
  value: string | number;
  icon: React.ElementType;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = React.memo(
  ({ name, value, icon: Icon, bgColor }) => {
    return (
      <div className="restaurant-card group hover:scale-105 transition-all duration-300">
        <div className="flex items-center">
          <div
            className={`flex-shrink-0 p-4 rounded-xl ${bgColor} shadow-lg group-hover:shadow-xl transition-shadow`}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-warm-600 truncate">
                {name}
              </dt>
              <dd className="text-2xl font-bold text-warm-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    );
  },
);

StatCard.displayName = "StatCard";

export default StatCard;
