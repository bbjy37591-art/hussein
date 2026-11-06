import React from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  FolderKanban,
  Layers,
  Lock,
  Moon,
  Star,
  Sun,
  Sunset,
  Sunrise,
  X,
} from 'lucide-react';
import {
  Category,
  CATEGORY_LABELS,
  DailyMetrics,
  StatusFilter,
  TaskFilterState,
  TimeBlock,
  TIME_BLOCK_LABELS,
} from '../utils/taskLogic';
import { WorkspaceTab } from './TopBar';

interface SidebarProps {
  filters: TaskFilterState;
  metrics: DailyMetrics;
  hundredCompletedCount: number;
  hundredTotalDays?: number;
  activeTab: WorkspaceTab;
  isDark: boolean;
  onClose?: () => void;
  onUpdateFilter: (patch: Partial<TaskFilterState>) => void;
  onSelectTab: (tab: WorkspaceTab) => void;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  metrics,
  hundredCompletedCount,
  hundredTotalDays = 100,
  activeTab,
  isDark,
  onClose,
  onUpdateFilter,
  onSelectTab,
  onToggleTheme,
}) => {
  const smartViews: {
    id: StatusFilter;
    label: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'all',
      label: 'كافة مهام اليوم',
      count: metrics.totalCount,
      icon: <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'active',
      label: 'قيد التنفيذ',
      count: metrics.pendingCount,
      icon: <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'urgent',
      label: 'الأولويات العاجلة',
      count: metrics.urgentPendingCount,
      icon: <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'starred',
      label: 'المميزة بنجمة',
      count: metrics.starredCount,
      icon: <Star className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" aria-hidden="true" />,
    },
    {
      id: 'completed',
      label: 'المكتملة',
      count: metrics.completedCount,
      icon: <CheckCircle2 className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" aria-hidden="true" />,
    },
  ];

  const categories: Category[] = ['work', 'personal', 'health', 'learning'];

  const timeBlocks: { id: TimeBlock; icon: React.ReactNode }[] = [
    { id: 'morning', icon: <Sunrise className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" aria-hidden="true" /> },
    { id: 'afternoon', icon: <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" aria-hidden="true" /> },
    { id: 'evening', icon: <Sunset className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" aria-hidden="true" /> },
  ];

  const handleSelectStatus = (status: StatusFilter) => {
    onUpdateFilter({ status, category: 'all', timeBlock: 'all' });
    if (activeTab !== 'list') {
      onSelectTab('list');
    }
    if (onClose) onClose();
  };

  const handleSelectCategory = (cat: Category) => {
    const nextCat = filters.category === cat ? 'all' : cat;
    onUpdateFilter({ category: nextCat });
    if (activeTab !== 'list') {
      onSelectTab('list');
    }
    if (onClose) onClose();
  };

  const handleSelectTimeBlock = (block: TimeBlock) => {
    const nextBlock = filters.timeBlock === block ? 'all' : block;
    onUpdateFilter({ timeBlock: nextBlock });
    if (activeTab !== 'list') {
      onSelectTab('list');
    }
    if (onClose) onClose();
  };

  const handleSelectPageTab = (tab: WorkspaceTab) => {
    onSelectTab(tab);
    if (onClose) onClose();
  };

  return (
    <aside
      aria-label="القائمة الجانبية لتصنيف المهام"
      className="w-full shrink-0 bg-white dark:bg-[#0B0C10] p-4 sm:p-5 flex flex-col justify-between gap-5 select-none"
    >
      <div className="space-y-5">
        {/* Mobile Drawer Header with Close Button */}
        {onClose && (
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg royal-gold-btn flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-zinc-950 shrink-0" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-amber-200 font-display">
                تصنيفات وفلاتر المهام
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق قائمة التصنيفات"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/80 cursor-pointer"
            >
              <X className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        )}
        {/* Daily Completion Progress */}
        <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-700 dark:text-amber-200/90">
              مؤشر الإنجاز اليومي
            </span>
            <span className="text-sm font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {metrics.completionPercentage}%
            </span>
          </div>
          <div
            className="w-full h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-amber-500/25"
            role="progressbar"
            aria-valuenow={metrics.completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="نسبة إنجاز مهام اليوم"
          >
            <div
              className="h-full royal-gold-btn transition-transform duration-200 origin-right"
              style={{
                transform: `scaleX(${metrics.completionPercentage / 100})`,
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              أُنجزت <strong className="font-mono tabular-nums text-zinc-900 dark:text-amber-300">{metrics.completedCount}</strong> من{' '}
              <strong className="font-mono tabular-nums text-zinc-900 dark:text-amber-300">{metrics.totalCount}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              متبقي <strong className="font-mono tabular-nums text-zinc-900 dark:text-amber-300">{metrics.remainingMinutes}</strong> د
            </span>
          </div>
        </div>

        {/* Royal Quick Views: All Workspace Pages */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-amber-500/80 mb-2 px-2">
            الأقسام والصفحات الرئيسية
          </h2>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => onSelectTab('list')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'list'
                    ? 'royal-gold-btn font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/10'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Layers
                    className={`w-4 h-4 ${
                      activeTab === 'list'
                        ? 'text-zinc-950'
                        : 'text-amber-500 dark:text-amber-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">مهام اليوم</span>
                </span>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    activeTab === 'list'
                      ? 'text-zinc-950 font-bold'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {metrics.totalCount}
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectTab('calendar')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'calendar'
                    ? 'royal-gold-btn font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/10'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Calendar
                    className={`w-4 h-4 ${
                      activeTab === 'calendar'
                        ? 'text-zinc-950'
                        : 'text-amber-500 dark:text-amber-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">التقويم الشهري</span>
                </span>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    activeTab === 'calendar'
                      ? 'text-zinc-950 font-bold'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  نوفمبر
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectTab('timeline')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'timeline'
                    ? 'royal-gold-btn font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/10'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Clock
                    className={`w-4 h-4 ${
                      activeTab === 'timeline'
                        ? 'text-zinc-950'
                        : 'text-amber-500 dark:text-amber-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">المخطط الزمني اليومي</span>
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectTab('focus')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'focus'
                    ? 'royal-gold-btn font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/10'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Flame
                    className={`w-4 h-4 ${
                      activeTab === 'focus'
                        ? 'text-zinc-950'
                        : 'text-amber-500 dark:text-amber-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">جلسة التركيز</span>
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectTab('analytics')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'royal-gold-btn font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/10'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Star
                    className={`w-4 h-4 ${
                      activeTab === 'analytics'
                        ? 'text-zinc-950'
                        : 'text-amber-500 dark:text-amber-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">التحليلات</span>
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onSelectTab('hundred')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'hundred'
                    ? 'royal-gold-btn font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/10'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Award
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === 'hundred'
                        ? 'text-zinc-950'
                        : 'text-amber-500 dark:text-amber-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">جدول التحديات</span>
                  <Lock
                    className={`w-3.5 h-3.5 shrink-0 ${
                      activeTab === 'hundred'
                        ? 'text-zinc-950'
                        : 'text-amber-500/80 dark:text-amber-400/80'
                    }`}
                    aria-hidden="true"
                  />
                </span>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    activeTab === 'hundred'
                      ? 'text-zinc-950 font-bold'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {hundredCompletedCount}/{hundredTotalDays}
                </span>
              </button>
            </li>
          </ul>
        </div>

        {/* Smart Filters */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-amber-500/80 mb-2 px-2">
            العروض الذكية
          </h2>
          <ul className="space-y-1">
            {smartViews.map((view) => {
              const isSelected =
                activeTab === 'list' &&
                filters.status === view.id &&
                filters.category === 'all' &&
                filters.timeBlock === 'all';
              return (
                <li key={view.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectStatus(view.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/35 font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      {view.icon}
                      <span className="truncate">{view.label}</span>
                    </span>
                    {view.count >= 0 && (
                      <span className="text-xs font-mono tabular-nums text-amber-700 dark:text-amber-400">
                        {view.count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Time Blocks */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-amber-500/80 mb-2 px-2">
            الفترات الزمنية
          </h2>
          <ul className="space-y-1">
            {timeBlocks.map(({ id, icon }) => {
              const isSelected = filters.timeBlock === id;
              const stats = metrics.byTimeBlock[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => handleSelectTimeBlock(id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'royal-gold-btn font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      {icon}
                      <span className="truncate">{TIME_BLOCK_LABELS[id].title}</span>
                    </span>
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        isSelected
                          ? 'text-zinc-950 font-bold'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {stats.completed}/{stats.total}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-amber-500/80 mb-2 px-2">
            المجالات والتصنيفات
          </h2>
          <ul className="space-y-1">
            {categories.map((cat) => {
              const isSelected = filters.category === cat;
              const stats = metrics.byCategory[cat];
              return (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'royal-gold-btn font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <FolderKanban
                        className={`w-4 h-4 shrink-0 ${
                          isSelected
                            ? 'text-zinc-950'
                            : 'text-amber-500 dark:text-amber-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{CATEGORY_LABELS[cat]}</span>
                    </span>
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        isSelected
                          ? 'text-zinc-950 font-bold'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {stats.total}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Theme Toggle Footer */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          المظهر الملكي
        </span>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الأسود والذهبي الملكي'}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-amber-300 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-amber-500/30 hover:border-amber-400 transition-colors cursor-pointer whitespace-nowrap"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>الوضع الفاتح</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>الأسود والذهبي</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
