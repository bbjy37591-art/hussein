import React from 'react';
import {
  ArrowRight,
  Crown,
  Moon,
  Plus,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';

export type WorkspaceTab =
  | 'list'
  | 'calendar'
  | 'hundred'
  | 'timeline'
  | 'focus'
  | 'analytics';

interface TopBarProps {
  activeTab: WorkspaceTab;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onOpenFiltersDrawer?: () => void;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenNewTaskModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  isDark,
  onToggleTheme,
  onOpenFiltersDrawer,
  onSelectTab,
  onOpenNewTaskModal,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 bg-[#FAF8F5]/95 dark:bg-[#08090C]/95 backdrop-blur-md border-b border-zinc-200 dark:border-amber-500/25 shrink-0">
      {/* Zone 1: Brand Title with Royal Crown */}
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('list');
        }}
        className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold tracking-tight font-display whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 rounded min-w-0"
      >
        <div className="w-7 h-7 rounded-lg royal-gold-btn flex items-center justify-center shrink-0 shadow-xs">
          <Crown className="w-4 h-4 text-zinc-950 shrink-0" aria-hidden="true" />
        </div>
        <span className="royal-gold-text truncate max-w-[170px] sm:max-w-none text-xs sm:text-sm font-bold">
          مهام المهندس حسين علاء
        </span>
      </a>

      {/* Zone 2: Mobile Action Controls & Theme/Filter Toggles */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Filter Drawer Toggle Button (only when in list view) */}
        {activeTab === 'list' && onOpenFiltersDrawer && (
          <button
            type="button"
            onClick={onOpenFiltersDrawer}
            aria-label="فتح قائمة تصنيفات وفلاتر المهام"
            title="تصنيفات وفلاتر المهام"
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-[#121318] hover:bg-amber-500/15 text-zinc-700 dark:text-amber-300 border border-zinc-200 dark:border-amber-500/30 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </button>
        )}

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الأسود الملكي'}
            title="تبديل المظهر"
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-[#121318] hover:bg-amber-500/15 text-zinc-700 dark:text-amber-300 border border-zinc-200 dark:border-amber-500/30 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            )}
          </button>
        )}

        {/* Primary Page Action Button */}
        {activeTab === 'hundred' ? (
          <button
            type="button"
            onClick={() => onSelectTab('list')}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg royal-gold-btn transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 shadow-sm"
          >
            <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>المهام</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg royal-gold-btn transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" aria-hidden="true" />
            <span className="hidden sm:inline">إضافة مهمة</span>
            <span className="sm:hidden">مهمة</span>
          </button>
        )}
      </div>
    </header>
  );
};
