import React, { useEffect, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import {
  Category,
  CATEGORY_LABELS,
  CreateTaskInput,
  Priority,
  PRIORITY_LABELS,
  SubTask,
  Task,
  TimeBlock,
  TIME_BLOCK_LABELS,
  TODAY_DATE_STR,
} from '../utils/taskLogic';

interface TaskDetailModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  defaultTimeBlock?: TimeBlock;
  defaultDueDate?: string;
  onClose: () => void;
  onSaveNew: (input: CreateTaskInput) => void;
  onUpdateExisting: (
    taskId: string,
    patch: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  editingTask,
  defaultTimeBlock = 'morning',
  defaultDueDate = TODAY_DATE_STR,
  onClose,
  onSaveNew,
  onUpdateExisting,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [timeBlock, setTimeBlock] = useState<TimeBlock>(defaultTimeBlock);
  const [scheduledTime, setScheduledTime] = useState('09:30');
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [starred, setStarred] = useState(false);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setNotes(editingTask.notes);
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
      setTimeBlock(editingTask.timeBlock);
      setScheduledTime(editingTask.scheduledTime);
      setDueDate(editingTask.dueDate);
      setEstimatedMinutes(editingTask.estimatedMinutes);
      setStarred(editingTask.starred);
      setSubTasks(editingTask.subTasks);
    } else {
      setTitle('');
      setNotes('');
      setPriority('medium');
      setCategory('work');
      setTimeBlock(defaultTimeBlock);
      setScheduledTime(
        defaultTimeBlock === 'morning'
          ? '09:30'
          : defaultTimeBlock === 'afternoon'
          ? '14:00'
          : '19:00'
      );
      setDueDate(defaultDueDate);
      setEstimatedMinutes(30);
      setStarred(false);
      setSubTasks([]);
    }
    setNewSubTaskTitle('');
    setError(null);
  }, [editingTask, defaultTimeBlock, defaultDueDate, isOpen]);

  if (!isOpen) return null;

  const handleAddSubTask = () => {
    const clean = newSubTaskTitle.trim();
    if (!clean) return;
    setSubTasks((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: clean,
        completed: false,
      },
    ]);
    setNewSubTaskTitle('');
  };

  const handleToggleSub = (subId: string) => {
    setSubTasks((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSub = (subId: string) => {
    setSubTasks((prev) => prev.filter((s) => s.id !== subId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('يرجى إدخال عنوان المهمة.');
      return;
    }

    if (editingTask) {
      onUpdateExisting(editingTask.id, {
        title: cleanTitle,
        notes: notes.trim(),
        priority,
        category,
        timeBlock,
        scheduledTime,
        dueDate,
        estimatedMinutes,
        starred,
        subTasks,
      });
    } else {
      onSaveNew({
        title: cleanTitle,
        notes: notes.trim(),
        priority,
        category,
        timeBlock,
        scheduledTime,
        dueDate,
        estimatedMinutes,
        starred,
        subTasks,
      });
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-task-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-[#121318] border border-zinc-200 dark:border-amber-500/30 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2
            id="modal-task-heading"
            className="text-base font-bold text-zinc-900 dark:text-amber-300 font-display"
          >
            {editingTask ? 'تعديل تفاصيل المهمة' : 'إضافة مهمة جديدة'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="p-1.5 text-zinc-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="modal-task-title"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              عنوان المهمة
            </label>
            <input
              id="modal-task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="مثال: إعداد خطة الإطلاق الأسبوعية"
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
            />
            {error && (
              <p role="alert" className="mt-1 text-xs text-red-500 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="modal-task-notes"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              ملاحظات وسياق العمل
            </label>
            <textarea
              id="modal-task-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تفاصيل إضافية أو روابط مرجعية..."
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="modal-task-priority"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                الأولوية
              </label>
              <select
                id="modal-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs font-medium bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg"
              >
                {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="modal-task-category"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                التصنيف
              </label>
              <select
                id="modal-task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 text-xs font-medium bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg"
              >
                {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label
                htmlFor="modal-task-date"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                تاريخ المهمة
              </label>
              <input
                id="modal-task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="modal-task-timeblock"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                الفترة الزمنية
              </label>
              <select
                id="modal-task-timeblock"
                value={timeBlock}
                onChange={(e) => setTimeBlock(e.target.value as TimeBlock)}
                className="w-full px-2.5 py-2 text-xs font-medium bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg"
              >
                {(Object.keys(TIME_BLOCK_LABELS) as TimeBlock[]).map((tb) => (
                  <option key={tb} value={tb}>
                    {TIME_BLOCK_LABELS[tb].title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="modal-task-time"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                الوقت المحدد
              </label>
              <input
                id="modal-task-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="modal-task-duration"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                المدة (دقائق)
              </label>
              <input
                id="modal-task-duration"
                type="number"
                min={5}
                max={480}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs font-mono tabular-nums bg-zinc-50 dark:bg-[#09090B] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-lg"
              />
            </div>
          </div>

          {/* Subtasks Manager */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <label
              htmlFor="modal-new-subtask"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              الخطوات الفرعية ({subTasks.length})
            </label>
            <div className="flex items-center gap-2">
              <input
                id="modal-new-subtask"
                type="text"
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubTask();
                  }
                }}
                placeholder="أضف خطوة فرعية واضغط إضافة..."
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddSubTask}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>إضافة خطوة</span>
              </button>
            </div>

            {subTasks.length > 0 && (
              <ul className="mt-2.5 space-y-1.5 max-h-36 overflow-y-auto">
                {subTasks.map((st) => (
                  <li
                    key={st.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-zinc-50 dark:bg-[#09090B] text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSub(st.id)}
                      className="flex items-center gap-2 text-right flex-1 cursor-pointer"
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          st.completed
                            ? 'bg-amber-400 border-amber-400 text-zinc-950'
                            : 'border-zinc-300 dark:border-amber-500/40'
                        }`}
                      >
                        {st.completed && <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />}
                      </span>
                      <span
                        className={
                          st.completed
                            ? 'line-through text-zinc-400'
                            : 'text-zinc-700 dark:text-zinc-200'
                        }
                      >
                        {st.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSub(st.id)}
                      aria-label={`حذف الخطوة الفرعية ${st.title}`}
                      className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            {editingTask ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(editingTask.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>حذف المهمة</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                {editingTask ? 'حفظ التعديلات' : 'حفظ المهمة'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
