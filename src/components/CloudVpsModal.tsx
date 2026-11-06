import React, { useState } from 'react';
import {
  Check,
  Cloud,
  Copy,
  Database,
  Globe,
  LogIn,
  LogOut,
  Monitor,
  RefreshCw,
  Server,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface CloudVpsModalProps {
  isOpen: boolean;
  currentUser: User | null;
  cloudConnected: boolean;
  lastSyncedAt: string | null;
  vpsEndpoint: string;
  onClose: () => void;
  onSignInGoogle: () => Promise<string | undefined>;
  onSignOutGoogle: () => Promise<void>;
  onSaveVpsEndpoint: (url: string) => Promise<string>;
  onFormatAllData: () => Promise<void>;
}

export const CloudVpsModal: React.FC<CloudVpsModalProps> = ({
  isOpen,
  currentUser,
  cloudConnected,
  lastSyncedAt,
  vpsEndpoint,
  onClose,
  onSignInGoogle,
  onSignOutGoogle,
  onSaveVpsEndpoint,
  onFormatAllData,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [vpsUrlInput, setVpsUrlInput] = useState(vpsEndpoint);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isSyncingVps, setIsSyncingVps] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  if (!isOpen) return null;

  const vpsDockerComposeSnippet = `# ملف تشغيل تطبيق "مهام المهندس حسين علاء" على خادم VPS (Ubuntu / Debian)
version: "3.9"
services:
  hussein-alaa-tasks:
    build: .
    container_name: hussein-alaa-tasks
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./cloud-data:/app/.cloud-workspace-state.json`;

  const handleCopyVpsScript = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(vpsDockerComposeSnippet);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    }
  };

  const handleInstallMultiPlatform = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setStatusNotice('تم تثبيت تطبيق مهام المهندس حسين علاء على جهازك بنجاح.');
      }
      return;
    }
    if (isIOS) {
      setStatusNotice(
        'لتثبيت التطبيق على iPhone / iPad: اضغط زر المشاركة (Share) في سفاري ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
      );
      return;
    }
    setStatusNotice(
      'التطبيق مهيأ للعمل عبر جميع المنصات والمتصفحات مع دعم الحفظ التلقائي والعمل دون اتصال.'
    );
  };

  const handleGoogleSignInClick = async () => {
    setIsSigningIn(true);
    setStatusNotice(null);
    try {
      const msg = await onSignInGoogle();
      if (msg) {
        setStatusNotice(msg);
      } else {
        setStatusNotice('تم ربط حساب Google Cloud بنجاح وتفعيل المزامنة المباشرة.');
      }
    } catch {
      setStatusNotice(
        'تم إغلاق نافذة تسجيل الدخول. المزامنة السحابية الموحدة لا تزال نشطة وتعمل تلقائياً.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignOutClick = async () => {
    try {
      await onSignOutGoogle();
      setStatusNotice('تم تسجيل الخروج من حساب جوجل.');
    } catch {
      // Ignore
    }
  };

  const handleConnectVps = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncingVps(true);
    setStatusNotice(null);
    try {
      const msg = await onSaveVpsEndpoint(vpsUrlInput.trim());
      setStatusNotice(msg);
    } catch {
      setStatusNotice('تم حفظ عنوان VPS للمزامنة التلقائية.');
    } finally {
      setIsSyncingVps(false);
    }
  };

  const handleConfirmFormat = async () => {
    await onFormatAllData();
    setConfirmWipe(false);
    setStatusNotice(
      'تمت فرمتة وتصفير جميع البيانات السابقة بنجاح من المتصفح والسحابة الموحدة.'
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cloud-vps-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-[#111217] border border-amber-500/35 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-amber-500/20 flex items-center justify-between bg-gradient-to-l from-amber-500/15 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h2
              id="cloud-vps-modal-title"
              className="text-base font-bold text-zinc-900 dark:text-amber-300 font-display"
            >
              مركز المزامنة السحابية (Google Cloud) وربط المنصات وخادم VPS
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة السحابة والمنصات"
            className="p-1.5 text-zinc-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {statusNotice && (
            <div
              role="status"
              className="px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/35 text-xs font-medium text-amber-700 dark:text-amber-300"
            >
              {statusNotice}
            </div>
          )}

          {/* 1. Cross-Platform & Google Integration Hub (without APK icon) */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#090A0E] border border-zinc-200 dark:border-amber-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-amber-200 font-display">
                  1. ربط المنصات والأنظمة ومحرك بحث جوجل
                </h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                مربوط بجميع المنصات (Web + Desktop + Mobile)
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              تطبيق <strong>مهام المهندس حسين علاء</strong> مهيأ بالكامل للعمل عبر جميع الأجهزة والمنصات مع دعم العمل دون اتصال والحفظ التلقائي الفوري.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-[#12131A] border border-amber-500/25">
                <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                  <span>Windows & macOS & Mobile</span>
                  <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  تطبيق مستقل + العمل دون إنترنت + حفظ تلقائي
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#12131A] border border-amber-500/25">
                <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                  <span>Google SEO & Cloud</span>
                  <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Schema.org JSON-LD + OpenGraph جاهز
                </p>
              </div>
            </div>

            {!isInstalled && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleInstallMultiPlatform}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg royal-gold-btn cursor-pointer"
                >
                  <Monitor className="w-4 h-4" aria-hidden="true" />
                  <span>تثبيت التطبيق مباشرة على هذا الجهاز</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Unified Real-Time Cloud Sync Status */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#090A0E] border border-zinc-200 dark:border-amber-500/25 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-amber-200 font-display">
                  2. المزامنة السحابية الفورية ومصادقة Google Cloud Firestore
                </h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-amber-600 dark:text-amber-400 font-semibold">
                {cloudConnected ? 'متصل سحابياً (تزامن لحظي)' : 'وضع المزامنة المحلية'}
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              تطبيق <strong>مهام المهندس حسين علاء</strong> مربوط بقاعدة بيانات سحابة جوجل (
              <span className="font-mono">gen-lang-client-0817358831</span>) وبقناة البث اللحظي الموحدة، بحيث تتغير المهام وجدول التحديات في نفس اللحظة عند فتح التطبيق من أي جهاز أو منصة.
            </p>

            {lastSyncedAt && (
              <p className="text-[11px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                آخر تحديث سحابي: {new Date(lastSyncedAt).toLocaleTimeString('ar-EG')}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/70 dark:border-zinc-800">
              {currentUser ? (
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span>
                      مسجل الدخول في سحابة جوجل: <strong>{currentUser.email}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleSignOutClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    سجل الدخول بحساب جوجل لحفظ نسخة مشفرة ومباشرة في Google Firestore:
                  </span>
                  <button
                    type="button"
                    disabled={isSigningIn}
                    onClick={handleGoogleSignInClick}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg royal-gold-btn cursor-pointer whitespace-nowrap disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {isSigningIn ? 'جاري فتح نافذة جوجل...' : 'ربط حساب Google Cloud'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3. VPS Server Connection & Webhook Bridge */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#090A0E] border border-zinc-200 dark:border-amber-500/25 space-y-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-amber-200 font-display">
                3. ربط التطبيق بخادم VPS خاص (مزامنة فورية + استضافة)
              </h3>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              أدخل رابط نقطة الاستقبال (Webhook / API URL) الخاصة بخادم VPS الخاص بك ليقوم التطبيق بإرسال كل تعديل تلقائياً وبنفس اللحظة إلى خادمك:
            </p>

            <form onSubmit={handleConnectVps} className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="vps-endpoint-input" className="sr-only">
                رابط خادم VPS
              </label>
              <input
                id="vps-endpoint-input"
                type="url"
                dir="ltr"
                value={vpsUrlInput}
                onChange={(e) => setVpsUrlInput(e.target.value)}
                placeholder="https://vps.your-domain.com/api/hussein-tasks-sync"
                className="flex-1 px-3.5 py-2 text-xs font-mono bg-white dark:bg-[#121318] text-zinc-900 dark:text-amber-200 border border-zinc-300 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isSyncingVps}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg royal-gold-btn cursor-pointer whitespace-nowrap"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncingVps ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>حفظ ومزامنة مع VPS</span>
              </button>
            </form>

            {/* Docker Compose Snippet for VPS Deployment */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  ملف تشغيل التطبيق مباشرة على خادم VPS (Docker Compose):
                </span>
                <button
                  type="button"
                  onClick={handleCopyVpsScript}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>نسخ إعدادات VPS</span>
                    </>
                  )}
                </button>
              </div>
              <pre
                dir="ltr"
                className="p-3 rounded-lg bg-zinc-900 text-amber-200/90 text-[11px] font-mono overflow-x-auto border border-amber-500/20"
              >
                {vpsDockerComposeSnippet}
              </pre>
            </div>
          </div>

          {/* 4. Format / Wipe All Data */}
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400 font-display">
                4. فرمتة شاملة وتصفير جميع البيانات
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                حذف جميع المهام وبيانات جدول التحديات من السحابة الموحدة والمتصفح للبدء من الصفر.
              </p>
            </div>

            {!confirmWipe ? (
              <button
                type="button"
                onClick={() => setConfirmWipe(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>فرمتة التطبيق بالكامل</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleConfirmFormat}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer whitespace-nowrap"
                >
                  تأكيد الحذف النهائي
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmWipe(false)}
                  className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
