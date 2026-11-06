import React, { useState } from 'react';
import { Palette, Plus, Tag, X } from 'lucide-react';
import {
  Category,
  CATEGORY_ICON_OPTIONS,
  CATEGORY_LABELS,
  CreateTaskInput,
  CUSTOM_CATEGORY_COLOR_PALETTE,
  CustomCategory,
  Priority,
  PRIORITY_LABELS,
  TaskIconName,
  TimeBlock,
  TIME_BLOCK_LABELS,
  TODAY_DATE_STR,
} from '../utils/taskLogic';
import { renderTaskCustomIcon } from './TaskRow';

interface QuickAddTaskBarProps {
  defaultCategory?: Category;
  defaultTimeBlock?: TimeBlock;
  customCategories?: CustomCategory[];
  onCreateCustomCategory?: (
    label: string,
    iconColor: string,
    icon: TaskIconName
  ) => CustomCategory;
  onAddTask: (input: CreateTaskInput) => void;
}

export const QuickAddTaskBar: React.FC<QuickAddTaskBarProps> = ({
  defaultCategory = 'work',
  defaultTimeBlock = 'morning',
  customCategories = [],
  onCreateCustomCategory,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  // Selected category value can be a standard Category ('work' | 'personal' | 'health' | 'learning') or a customCategory.id
  const [selectedCategoryKey, setSelectedCategoryKey] =
    useState<string>(defaultCategory);
  const [timeBlock, setTimeBlock] = useState<TimeBlock>(defaultTimeBlock);
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [dueDate, setDueDate] = useState<string>(TODAY_DATE_STR);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom Category Creator inline panel state
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState<string>('');
  const [newCategoryColor, setNewCategoryColor] = useState<string>(
    CUSTOM_CATEGORY_COLOR_PALETTE[0].hex
  );
  const [newCategoryIcon, setNewCategoryIcon] =
    useState<TaskIconName>('rocket');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const selectedCustomCat = customCategories.find(
    (c) => c.id === selectedCategoryKey
  );

  const handleCreateCategory = () => {
    const trimmed = newCategoryLabel.trim();
    if (!trimmed) {
      setCategoryError('يرجى إدخال اسم التصنيف المخصص الجديد.');
      return;
    }
    if (onCreateCustomCategory) {
      const created = onCreateCustomCategory(
        trimmed,
        newCategoryColor,
        newCategoryIcon
      );
      setSelectedCategoryKey(created.id);
    }
    setNewCategoryLabel('');
    setCategoryError(null);
    setIsCreatingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setErrorMessage('يرجى كتابة عنوان المهمة أولاً قبل الإضافة.');
      return;
    }

    const baseCategory: Category = selectedCustomCat
      ? 'work'
      : (selectedCategoryKey as Category);

    onAddTask({
      title: trimmed,
      priority,
      category: baseCategory,
      customCategoryId: selectedCustomCat?.id,
      customCategoryLabel: selectedCustomCat?.label,
      customIconColor: selectedCustomCat?.iconColor,
      customIcon: selectedCustomCat?.icon,
      timeBlock,
      scheduledTime,
      dueDate,
      estimatedMinutes,
    });

    setTitle('');
    setErrorMessage(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="إضافة مهمة يومية سريعة"
      className="bg-white dark:bg-[#121318] border border-zinc-200 dark:border-amber-500/25 rounded-xl p-4 transition-colors space-y-3"
    >
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <label htmlFor="quick-task-title" className="sr-only">
            عنوان المهمة الجديدة
          </label>
          <input
            id="quick-task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="أضف مهمة جديدة لليوم... (مثال: مراجعة التقرير المالي للربع الرابع)"
            className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-400 dark:focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Priority Select */}
          <div>
            <label htmlFor="quick-task-priority" className="sr-only">
              الأولوية
            </label>
            <select
              id="quick-task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              aria-label="أولوية المهمة"
              className="px-3 py-2 text-xs font-medium bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-amber-200 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                <option key={p} value={p}>
                  أولوية: {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select + Custom Category Badge & Creator Trigger */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="quick-task-category" className="sr-only">
              التصنيف
            </label>
            <div className="relative flex items-center">
              {selectedCustomCat && (
                <span
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-full ml-1.5 shrink-0"
                  style={{ backgroundColor: selectedCustomCat.iconColor }}
                />
              )}
              <select
                id="quick-task-category"
                value={selectedCategoryKey}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__new_custom__') {
                    setIsCreatingCategory(true);
                  } else {
                    setSelectedCategoryKey(val);
                  }
                }}
                aria-label="تصنيف المهمة"
                className="px-3 py-2 text-xs font-medium bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <optgroup label="التصنيفات الافتراضية">
                  {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </optgroup>
                {customCategories.length > 0 && (
                  <optgroup label="تصنيفات مخصصة">
                    {customCategories.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        ★ {cc.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="__new_custom__">+ إنشاء تصنيف مخصص جديد...</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsCreatingCategory((prev) => !prev)}
              aria-expanded={isCreatingCategory}
              aria-label="إنشاء تصنيف مهام جديد مخصص"
              title="إنشاء تصنيف مهام جديد مخصص مع لون أيقونة فريد"
              className={`inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isCreatingCategory
                  ? 'bg-amber-500/20 text-amber-400 border-amber-400'
                  : 'bg-zinc-50 dark:bg-[#09090B] text-amber-600 dark:text-amber-400 border-amber-500/35 hover:border-amber-400'
              }`}
            >
              <Palette className="w-3.5 h-3.5" aria-hidden="true" />
              <span>تصنيف مخصص</span>
            </button>
          </div>

          {/* Time Block Select */}
          <div>
            <label htmlFor="quick-task-timeblock" className="sr-only">
              الفترة الزمنية
            </label>
            <select
              id="quick-task-timeblock"
              value={timeBlock}
              onChange={(e) => setTimeBlock(e.target.value as TimeBlock)}
              aria-label="الفترة الزمنية"
              className="px-3 py-2 text-xs font-medium bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {(Object.keys(TIME_BLOCK_LABELS) as TimeBlock[]).map((tb) => (
                <option key={tb} value={tb}>
                  {TIME_BLOCK_LABELS[tb].title}
                </option>
              ))}
            </select>
          </div>

          {/* Scheduled Time Input */}
          <div>
            <label htmlFor="quick-task-time" className="sr-only">
              وقت المهمة
            </label>
            <input
              id="quick-task-time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              aria-label="وقت المهمة"
              className="px-2.5 py-2 text-xs font-mono tabular-nums bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
            />
          </div>

          {/* Date Select */}
          <div>
            <label htmlFor="quick-task-date" className="sr-only">
              تاريخ المهمة
            </label>
            <input
              id="quick-task-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="تاريخ المهمة"
              className="px-2.5 py-2 text-xs font-mono tabular-nums bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
            />
          </div>

          {/* Duration Select */}
          <div>
            <label htmlFor="quick-task-duration" className="sr-only">
              المدة المقدرة بالدقائق
            </label>
            <select
              id="quick-task-duration"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              aria-label="المدة المقدرة"
              className="px-3 py-2 text-xs font-mono tabular-nums bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value={5}>5 د</option>
              <option value={10}>10 د</option>
              <option value={15}>15 د</option>
              <option value={20}>20 د</option>
              <option value={25}>25 د</option>
              <option value={30}>30 د</option>
              <option value={45}>45 د</option>
              <option value={60}>60 د</option>
              <option value={90}>90 د</option>
              <option value={120}>120 د</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg royal-gold-btn transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>إضافة سريعة</span>
          </button>
        </div>
      </div>

      {/* Custom Category & Unique Icon Color Creator Panel */}
      {isCreatingCategory && (
        <div
          role="region"
          aria-label="إنشاء تصنيف مهام جديد مخصص وتحديد لون أيقونة فريد"
          className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#0A0B0F] border border-amber-500/35 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <span className="text-xs font-bold text-zinc-900 dark:text-amber-300 font-display">
                إنشاء تصنيف مهام مخصص جديد مع لون أيقونة فريد
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreatingCategory(false);
                setCategoryError(null);
              }}
              className="text-xs text-zinc-400 hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>إغلاق</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
            {/* Step 1: Category Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="custom-category-name-input"
                className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400"
              >
                اسم التصنيف المخصص
              </label>
              <input
                id="custom-category-name-input"
                type="text"
                value={newCategoryLabel}
                onChange={(e) => {
                  setNewCategoryLabel(e.target.value);
                  if (categoryError) setCategoryError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
                placeholder="مثال: مشاريع هندسية، استثمار، بحث..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#121318] text-zinc-900 dark:text-zinc-100 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Step 2: Unique Icon Color Swatches + Custom Color Picker */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                اختر لون أيقونة فريد للتصنيف
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {CUSTOM_CATEGORY_COLOR_PALETTE.map((swatch) => {
                  const active =
                    newCategoryColor.toLowerCase() === swatch.hex.toLowerCase();
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => setNewCategoryColor(swatch.hex)}
                      title={swatch.label}
                      aria-label={`لون ${swatch.label}`}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        active
                          ? 'scale-110 border-white dark:border-amber-200 ring-2 ring-amber-400'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                  );
                })}
                <label
                  title="اختيار لون مخصص حر"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-white dark:bg-[#121318] border border-zinc-200 dark:border-zinc-800 cursor-pointer text-zinc-600 dark:text-zinc-300"
                >
                  <input
                    type="color"
                    aria-label="لون أيقونة مخصص"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-4 h-4 border-0 bg-transparent cursor-pointer"
                  />
                  <span>لون حر</span>
                </label>
              </div>
            </div>

            {/* Step 3: Icon Selection & Live Preview + Save */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                أيقونة التصنيف ومعاينة اللون
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${newCategoryColor}22`,
                    borderColor: newCategoryColor,
                    color: newCategoryColor,
                  }}
                >
                  {renderTaskCustomIcon(newCategoryIcon, 'w-4 h-4')}
                </div>
                <select
                  aria-label="أيقونة التصنيف المخصص"
                  value={newCategoryIcon}
                  onChange={(e) =>
                    setNewCategoryIcon(e.target.value as TaskIconName)
                  }
                  className="flex-1 px-2.5 py-2 text-xs bg-white dark:bg-[#121318] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {CATEGORY_ICON_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.group})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-2 text-xs font-bold rounded-lg royal-gold-btn cursor-pointer shrink-0"
                >
                  حفظ التصنيف
                </button>
              </div>
            </div>
          </div>

          {categoryError && (
            <p
              role="alert"
              className="text-xs font-medium text-red-500 dark:text-red-400"
            >
              {categoryError}
            </p>
          )}
        </div>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="text-xs font-medium text-red-500 dark:text-red-400"
        >
          {errorMessage}
        </p>
      )}
    </form>
  );
};

