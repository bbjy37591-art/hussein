import React from 'react';
import {
  Award,
  Calendar,
  CheckSquare,
  Flame,
  Lock,
  Sparkles,
} from 'lucide-react';
import { WorkspaceTab } from './TopBar';

interface BottomTabBarProps {
  activeTab: WorkspaceTab;
  pendingTasksCount: number;
  hundredCompletedCount: number;
  hundredTotalDays: number;
  onSelectTab: (tab: WorkspaceTab) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  pendingTasksCount,
  hundredCompletedCount,
  hundredTotalDays,
  onSelectTab,
}) => {
  const tabs: {
    id: WorkspaceTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    isLocked?: boolean;
  }[] = [
    {
      id: 'list',
      label: 'المهام',
      icon: <CheckSquare className="w-5 h-5 shrink-0" aria-hidden="true" />,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'hundred',
      label: 'التحديات',
      icon: <Award className="w-5 h-5 shrink-0" aria-hidden="true" />,
      badge: `${hundredCompletedCount}/${hundredTotalDays}`,
      isLocked: true,
    },
    {
      id: 'focus',
      label: 'التركيز',
      icon: <Flame className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'calendar',
      label: 'التقويم',
      icon: <Calendar className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'analytics',
      label: 'التحليلات',
      icon: <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />,
    },
  ];

  return (
    <nav
      aria-label="شريط التنقل السفلي للهاتف"
      className="sticky bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/98 dark:bg-[#08090C]/98 backdrop-blur-md border-t border-zinc-200 dark:border-amber-500/25 px-2 py-1.5 shrink-0 select-none"
    >
      <div className="flex items-center justify-around gap-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer flex-1 min-w-0 ${
                isActive
                  ? 'text-zinc-950 dark:text-amber-300 font-bold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-amber-200'
              }`}
            >
              {/* Active Golden Background Indicator */}
              {isActive && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 royal-gold-btn opacity-15 dark:opacity-20 rounded-xl"
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center shrink-0 mb-0.5">
                <div
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-amber-500 dark:text-amber-400' : ''
                  }`}
                >
                  {tab.icon}
                </div>

                {tab.isLocked && (
                  <Lock
                    className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400 absolute -top-1 -right-1"
                    aria-hidden="true"
                  />
                )}

                {tab.badge !== undefined && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 -left-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center royal-gold-btn text-zinc-950 shadow-xs"
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Tab Title Label */}
              <span
                className={`text-[10px] tracking-tight leading-tight whitespace-nowrap truncate max-w-full ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
