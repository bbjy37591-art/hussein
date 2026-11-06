import React, { useEffect, useState, useCallback } from 'react';
import {
  Brain,
  Sparkles,
  RefreshCw,
  Quote,
  Globe,
  Lightbulb,
} from 'lucide-react';
import {
  DailyPsychologyQuotePayload,
  TODAY_DATE_STR,
  buildDailyPsychologyQuote,
} from '../utils/taskLogic';

const DAILY_QUOTE_CACHE_KEY = 'hussein_daily_psychology_quote_v1';

export const DailyPsychologyQuoteBanner: React.FC = () => {
  const todayStr =
    typeof window !== 'undefined'
      ? new Date().toISOString().slice(0, 10)
      : TODAY_DATE_STR;

  const [offset, setOffset] = useState<number>(0);
  const [quoteData, setQuoteData] = useState<DailyPsychologyQuotePayload>(() =>
    buildDailyPsychologyQuote(todayStr, 0)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchExternalDailyPsychologyQuote = useCallback(
    async (targetDate: string, nextOffset: number, forceNetwork = false) => {
      if (!forceNetwork && nextOffset === 0) {
        try {
          const rawCache = localStorage.getItem(DAILY_QUOTE_CACHE_KEY);
          if (rawCache) {
            const parsed = JSON.parse(rawCache) as DailyPsychologyQuotePayload;
            if (parsed && parsed.dateStr === targetDate && parsed.quoteAr) {
              setQuoteData(parsed);
              return;
            }
          }
        } catch {
          // Ignore cache error
        }
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/daily-psychology-quote?date=${encodeURIComponent(
            targetDate
          )}&offset=${nextOffset}`
        );
        if (res.ok) {
          const data = await res.json();
          const built = buildDailyPsychologyQuote(targetDate, nextOffset, {
            quoteEn: data.externalQuoteEn,
            authorEn: data.externalAuthorEn,
            sourceService: data.sourceService,
          });
          setQuoteData(built);
          if (nextOffset === 0) {
            try {
              localStorage.setItem(DAILY_QUOTE_CACHE_KEY, JSON.stringify(built));
            } catch {
              // Ignore quota errors
            }
          }
          setIsLoading(false);
          return;
        }
      } catch {
        // Fallback to local psychology quote builder if network fails
      }

      const fallback = buildDailyPsychologyQuote(targetDate, nextOffset);
      setQuoteData(fallback);
      setIsLoading(false);
    },
    []
  );

  useEffect(() => {
    fetchExternalDailyPsychologyQuote(todayStr, 0, false);
  }, [todayStr, fetchExternalDailyPsychologyQuote]);

  const handleRefreshQuote = () => {
    const nextOffset = offset + 1;
    setOffset(nextOffset);
    fetchExternalDailyPsychologyQuote(todayStr, nextOffset, true);
  };

  return (
    <section
      aria-label="مقولة اليوم التحفيزية من علم النفس"
      className="bg-gradient-to-l from-amber-500/15 via-white to-zinc-50 dark:from-amber-500/12 dark:via-[#12131A] dark:to-[#0C0D12] border border-amber-500/40 rounded-xl p-4 shadow-sm space-y-2.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg royal-gold-btn flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-amber-300 font-display">
                مقولة اليوم التحفيزية — علم النفس والإنجاز اليومي
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                <Globe className="w-3 h-3" aria-hidden="true" />
                <span>{quoteData.sourceService}</span>
              </span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400/90 font-semibold">
              {quoteData.psychologyPrincipleAr} · {quoteData.authorAr}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefreshQuote}
          disabled={isLoading}
          aria-label="جلب مقولة تحفيزية جديدة من خدمة مقولات علم النفس"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold royal-gold-btn transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>مقولة نفسية جديدة</span>
        </button>
      </div>

      <div className="p-3 rounded-lg bg-white/80 dark:bg-[#090A0E]/90 border border-amber-500/25 space-y-1.5">
        <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed flex items-start gap-2">
          <Quote
            className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>«{quoteData.quoteAr}»</span>
        </p>

        {quoteData.quoteEn && (
          <p
            dir="ltr"
            className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 pl-6 italic"
          >
            “{quoteData.quoteEn}” — {quoteData.authorEn}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-300">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <span>تطبيق عملي لليوم: {quoteData.behavioralTipAr}</span>
        </span>
        <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
          تتحدث تلقائياً كل يوم ({quoteData.dateStr}) ·{' '}
          <Sparkles className="w-3 h-3 inline text-amber-400" aria-hidden="true" />
        </span>
      </div>
    </section>
  );
};
