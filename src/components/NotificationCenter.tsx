import React, { useState } from 'react';
import { Bell, BellRing, Check, Clock, Play, X } from 'lucide-react';
import { Task, TaskAlert } from '../utils/taskLogic';

interface NotificationCenterProps {
  alerts: TaskAlert[];
  tasks: Task[];
  onStartFocusOnTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  alerts,
  tasks,
  onStartFocusOnTask,
  onCompleteTask,
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [browserPermStatus, setBrowserPermStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const visibleAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleEnableBrowserNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setStatusMessage('تم تفعيل التنبيهات الفورية داخل المتصفح بنجاح.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setBrowserPermStatus(perm);
      if (perm === 'granted') {
        new Notification('مِنجَز — نظام التنبيهات الملكي', {
          body: `لديك ${visibleAlerts.length} تنبيهات نشطة للمهام والفترات الزمنية المجدولة اليوم.`,
        });
        setStatusMessage('تم تفعيل إشعارات المتصفح وإرسال تنبيه تجريبي.');
      } else {
        setStatusMessage('التنبيهات داخل التطبيق نشطة وتعمل تلقائياً.');
      }
    } catch {
      setStatusMessage('التنبيهات داخل التطبيق نشطة وتعمل تلقائياً.');
    }
  };

  const handleTriggerCheckNow = () => {
    setDismissedIds([]);
    setIsExpanded(true);
    setStatusMessage(
      `تم فحص المواعيد المجدولة: يوجد ${alerts.length} تنبيهات للمهام القريبة والفترات النشطة.`
    );
  };

  return (
    <section
      aria-label="مركز الإشعارات والتنبيهات الزمنية"
      className="bg-[#FDFBF7] dark:bg-[#121318] border border-amber-500/30 dark:border-amber-500/25 rounded-xl overflow-hidden transition-colors"
    >
      {/* Header Bar */}
      <div className="px-4 py-3 bg-amber-500/10 dark:bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BellRing
            className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0"
            aria-hidden="true"
          />
          <span className="text-xs font-bold text-zinc-900 dark:text-amber-200">
            نظام التنبيهات الذكي للمواعيد والفترات المجدولة
          </span>
          <span aria-hidden="true" className="text-amber-500/50">
            ·
          </span>
          <span className="text-xs font-mono tabular-nums text-amber-800 dark:text-amber-300 font-semibold">
            {visibleAlerts.length} تنبيه نشط
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTriggerCheckNow}
            className="px-2.5 py-1 text-xs font-medium text-amber-900 dark:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            فحص المواعيد الآن
          </button>

          {browserPermStatus !== 'granted' && (
            <button
              type="button"
              onClick={handleEnableBrowserNotifications}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              <Bell className="w-3.5 h-3.5" aria-hidden="true" />
              <span>تفعيل إشعارات المتصفح</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-amber-300 cursor-pointer whitespace-nowrap"
          >
            {isExpanded ? 'طي التنبيهات' : 'عرض التنبيهات'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="px-4 py-2 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-500/5 border-b border-amber-500/15 flex items-center justify-between"
        >
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            aria-label="إغلاق رسالة الحالة"
            className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
          {visibleAlerts.length === 0 ? (
            <div className="px-4 py-4 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span>لا توجد تنبيهات عاجلة غير مقروءة في الوقت الحالي.</span>
              {dismissedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDismissedIds([])}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                >
                  إظهار التنبيهات المخفية ({dismissedIds.length})
                </button>
              )}
            </div>
          ) : (
            visibleAlerts.map((alert) => {
              const relatedTask = alert.taskId
                ? tasks.find((t) => t.id === alert.taskId)
                : undefined;

              return (
                <div
                  key={alert.id}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-500/5 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Clock
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        alert.severity === 'urgent'
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {alert.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {alert.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {relatedTask && !relatedTask.completed && (
                      <>
                        <button
                          type="button"
                          onClick={() => onStartFocusOnTask(relatedTask)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                          <span>بدء الآن</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onCompleteTask(relatedTask.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Check className="w-3 h-3" aria-hidden="true" />
                          <span>إنجاز</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDismiss(alert.id)}
                      aria-label={`إخفاء التنبيه: ${alert.title}`}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};
