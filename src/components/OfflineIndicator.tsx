import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  WifiOff,
  X,
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

interface OfflineIndicatorProps {
  cloudConnected?: boolean;
  lastSyncedAt?: string | null;
  onTriggerManualSync?: () => Promise<void> | void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  lastSyncedAt = null,
  onTriggerManualSync,
}) => {
  const isOnline = useOnlineStatus();

  const [showRestoredBanner, setShowRestoredBanner] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCheckingSync, setIsCheckingSync] = useState<boolean>(false);
  const prevOnlineRef = useRef<boolean>(isOnline);

  // Detect transition from offline to online -> show 'حفظ تلقائي' banner
  useEffect(() => {
    if (!prevOnlineRef.current && isOnline) {
      setShowRestoredBanner(true);
      const timer = setTimeout(() => {
        setShowRestoredBanner(false);
      }, 6000);
      prevOnlineRef.current = isOnline;
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  const handleManualSyncClick = async () => {
    setIsCheckingSync(true);
    try {
      await onTriggerManualSync?.();
      if (isOnline) {
        setShowRestoredBanner(true);
      }
    } finally {
      setTimeout(() => {
        setIsCheckingSync(false);
      }, 350);
    }
  };

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'الآن';

  // 1. Offline / Disconnected Interactive State
  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl bg-zinc-950/95 border border-amber-500/60 p-3.5 text-xs text-zinc-100 shadow-2xl backdrop-blur-md space-y-2.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>وضع عدم الاتصال — بياناتك مؤمّنة محلياً</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-[11px] font-semibold text-amber-300 hover:underline cursor-pointer shrink-0"
          >
            {isExpanded ? 'إخفاء التفاصيل' : 'التفاصيل'}
          </button>
        </div>

        <p className="text-[11px] text-zinc-300 leading-relaxed">
          يتم حفظ جميع مهامك وتعديلاتك تلقائياً في ذاكرة الجهاز، وسيتم تفعيل{' '}
          <strong className="text-amber-300">حفظ تلقائي</strong> فور عودة الاتصال.
        </p>

        {isExpanded && (
          <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>حالة التخزين المحلي:</span>
              <span className="text-emerald-400 font-semibold">نشط ومؤمّن 100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>آخر تزامن سحابي:</span>
              <span className="font-mono tabular-nums text-amber-300">
                {formattedSyncTime}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleManualSyncClick}
            disabled={isCheckingSync}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg royal-gold-btn text-[11px] font-bold cursor-pointer transition-all"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isCheckingSync ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>إعادة فحص الاتصال والمزامنة</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Cloud Connection Restored / Auto-Save Confirmation Toast ('حفظ تلقائي')
  if (showRestoredBanner) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl bg-zinc-950/95 border border-emerald-500/50 p-3.5 text-xs text-zinc-100 shadow-2xl backdrop-blur-md space-y-2"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>حفظ تلقائي — تمت استعادة الاتصال بالسحابة</span>
          </div>
          <button
            type="button"
            onClick={() => setShowRestoredBanner(false)}
            aria-label="إغلاق إشعار الحفظ التلقائي"
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-[11px] text-zinc-300 leading-relaxed">
          تمت مزامنة وتأمين جميع بياناتك تلقائياً ({formattedSyncTime}).
        </p>

        <div className="flex items-center justify-between pt-1 text-[11px]">
          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>حماية البيانات السحابية نشطة</span>
          </span>
        </div>
      </div>
    );
  }

  return null;
};
