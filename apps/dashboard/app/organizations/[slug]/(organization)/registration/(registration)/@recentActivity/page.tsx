import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  DollarSignIcon, 
  PackageIcon, 
  TrendingUpIcon,
  FileTextIcon
} from "lucide-react";

import { getOrganizationRecentActivity } from '~/data/organization/get-organization-recent-activity';

// Get icon component based on icon name
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'dollar-sign':
      return DollarSignIcon;
    case 'package':
      return PackageIcon;
    case 'trending-up':
      return TrendingUpIcon;
    case 'file-text':
      return FileTextIcon;
    default:
      return PackageIcon;
  }
};

// Get icon color based on color name
const getIconColor = (color: string) => {
  switch (color) {
    case 'green':
      return 'text-green-600';
    case 'blue':
      return 'text-blue-600';
    case 'purple':
      return 'text-purple-600';
    case 'orange':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

// Format relative time
const formatRelativeTime = (date: Date) => {
  return formatDistanceToNow(date, { addSuffix: true });
};

export default async function RecentActivityPage(): Promise<React.JSX.Element> {
  const activities = await getOrganizationRecentActivity(5);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUpIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          No recent activity. Start by creating your first order!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = getIconComponent(activity.icon);
          const iconColor = getIconColor(activity.color);
          
          return (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <IconComponent className={`h-4 w-4 ${iconColor}`} />
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(activity.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
