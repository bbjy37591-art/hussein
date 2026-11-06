import React, { useState } from 'react';
import {
  Briefcase,
  Check,
  Coffee,
  Dumbbell,
  GraduationCap,
  Layers,
  Plus,
  Sparkles,
} from 'lucide-react';
import { TASK_TEMPLATES, TaskIconName } from '../utils/taskLogic';

interface TaskTemplatesBarProps {
  onApplyTemplate: (templateId: string) => void;
}

function renderTemplateIcon(icon: TaskIconName) {
  switch (icon) {
    case 'coffee':
      return <Coffee className="w-4 h-4 text-amber-400" aria-hidden="true" />;
    case 'dumbbell':
      return <Dumbbell className="w-4 h-4 text-amber-400" aria-hidden="true" />;
    case 'briefcase':
      return <Briefcase className="w-4 h-4 text-amber-400" aria-hidden="true" />;
    case 'graduation':
      return (
        <GraduationCap className="w-4 h-4 text-amber-400" aria-hidden="true" />
      );
    case 'sparkles':
    default:
      return <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />;
  }
}

export const TaskTemplatesBar: React.FC<TaskTemplatesBarProps> = ({
  onApplyTemplate,
}) => {
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const handleAddClick = (templateId: string) => {
    onApplyTemplate(templateId);
    setRecentlyAddedId(templateId);
    setTimeout(() => {
      setRecentlyAddedId((prev) => (prev === templateId ? null : prev));
    }, 1800);
  };

  return (
    <section
      aria-label="مكتبة قوالب المهام الجاهزة"
      className="bg-white dark:bg-[#111217] border border-zinc-200 dark:border-amber-500/25 rounded-xl p-4 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-amber-200 font-display">
            مكتبة قوالب المهام الجاهزة — أضفها لجدولك بضغطة واحدة
          </h2>
        </div>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          اختر القالب لإضافة مهامه مباشرة إلى جدول اليوم
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {TASK_TEMPLATES.map((tpl) => {
          const isJustAdded = recentlyAddedId === tpl.id;
          return (
            <div
              key={tpl.id}
              className="flex flex-col justify-between gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-[#0B0C10] border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-amber-200">
                    {renderTemplateIcon(tpl.icon)}
                    <span>{tpl.title}</span>
                  </span>
                  <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {tpl.tasks.length} مهام
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  {tpl.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddClick(tpl.id)}
                className={`w-full py-1.5 px-2.5 rounded-md text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isJustAdded
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'royal-gold-btn shadow-2xs'
                }`}
              >
                {isJustAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                    <span>تمت الإضافة للجدول</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                    <span>إضافة بضغطة واحدة</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
