import React from "react";
import { Star } from "lucide-react";

interface ActivityItemProps {
  icon: React.ElementType;
  title: string;
  time: string;
  color: string;
}

const ActivityItem: React.FC<ActivityItemProps> = React.memo(
  ({ icon: Icon, title, time, color }) => (
    <div className="flex items-center space-x-4 p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors">
      <div className="flex-shrink-0">
        <div
          className={`w-10 h-10 bg-gradient-to-r ${color} rounded-full flex items-center justify-center`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-warm-900">{title}</p>
        <p className="text-sm text-warm-500">{time}</p>
      </div>
      <Star className="h-4 w-4 text-yellow-500 fill-current" />
    </div>
  ),
);

ActivityItem.displayName = "ActivityItem";

export default ActivityItem;
