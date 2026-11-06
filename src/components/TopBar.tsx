import React from 'react';
import { ArrowRight, Crown, Lock, Plus } from 'lucide-react';

export type WorkspaceTab =
  | 'list'
  | 'calendar'
  | 'hundred'
  | 'timeline'
  | 'focus'
  | 'analytics';

interface TopBarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenNewTaskModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewTaskModal,
}) => {
  const navItems: { id: WorkspaceTab; label: string; isLocked?: boolean }[] = [
    { id: 'list', label: 'مهام اليوم' },
    { id: 'calendar', label: 'التقويم الشهري' },
    { id: 'timeline', label: 'المخطط الزمني' },
    { id: 'focus', label: 'جلسة التركيز' },
    { id: 'analytics', label: 'التحليلات' },
    { id: 'hundred', label: 'جدول التحديات', isLocked: true },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3.5 bg-[#FAF8F5]/95 dark:bg-[#08090C]/95 backdrop-blur-md border-b border-zinc-200 dark:border-amber-500/25">
      {/* Zone 1: Brand Title Wordmark */}
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('list');
        }}
        className="inline-flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight font-display whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 rounded"
      >
        <Crown className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
        <span className="royal-gold-text">مهام المهندس حسين علاء</span>
      </a>

      {/* Zone 2: Navigation links for all app pages */}
      <nav
        aria-label="التنقل الرئيسي"
        className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 overflow-x-auto no-scrollbar"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 ${
                isActive
                  ? 'border-amber-400 text-zinc-900 dark:text-amber-300 font-semibold'
                  : 'border-transparent hover:text-zinc-900 dark:hover:text-amber-200'
              }`}
            >
              {item.isLocked && (
                <Lock className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        {activeTab === 'hundred' ? (
          <button
            type="button"
            onClick={() => onSelectTab('list')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg royal-gold-btn transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 shadow-sm"
          >
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
            <span>صفحة المهام اليومية</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg royal-gold-btn transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>إضافة مهمة</span>
          </button>
        )}
      </div>
    </header>
  );
};
