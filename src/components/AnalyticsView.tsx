import React, { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BarChart3,
  Crown,
  Flame,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Category,
  CATEGORY_LABELS,
  DailyMetrics,
  generateThirtyDayAnalytics,
  Task,
  ThirtyDayPoint,
  TimeBlock,
  TIME_BLOCK_LABELS,
} from '../utils/taskLogic';

interface AnalyticsViewProps {
  metrics: DailyMetrics;
  tasks?: Task[];
}

type ChartMode = 'composed' | 'bars';
type RangeFilter = '30d' | '14d' | 'peaks';

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: ThirtyDayPoint;
  }[];
}

const CustomArabicTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="p-3.5 rounded-xl bg-[#0D0E14] border border-amber-500/45 shadow-2xl text-right min-w-[210px]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2 mb-2">
        <span className="text-xs font-bold text-amber-300 font-display">
          {point.shortLabel} ({point.dateStr})
        </span>
        {point.isPeakProductivity && (
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" aria-hidden="true" />
            <span>ذروة إنتاجية</span>
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">المهام المكتملة:</span>
          <strong className="font-mono tabular-nums text-amber-400">
            {point.completed} مهام
          </strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">المهام المتأخرة:</span>
          <strong className="font-mono tabular-nums text-red-400">
            {point.overdue} مهام
          </strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">معدل الكفاءة اليومي:</span>
          <strong className="font-mono tabular-nums text-emerald-400">
            {point.efficiencyRate}%
          </strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">دقائق التركيز:</span>
          <strong className="font-mono tabular-nums text-zinc-200">
            {point.focusedMinutes} د
          </strong>
        </div>
      </div>

      {point.isPeakProductivity && (
        <div className="mt-2 pt-2 border-t border-amber-500/20 text-[11px] text-amber-300/90 font-medium">
          ★ {point.peakPeriodLabel}
        </div>
      )}
    </div>
  );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  metrics,
  tasks = [],
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('composed');
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('30d');
  const [includeBaseline, setIncludeBaseline] = useState<boolean>(true);

  const categories = Object.keys(CATEGORY_LABELS) as Category[];
  const timeBlocks = Object.keys(TIME_BLOCK_LABELS) as TimeBlock[];

  const thirtyDaySummary = useMemo(
    () => generateThirtyDayAnalytics(tasks, includeBaseline),
    [tasks, includeBaseline]
  );

  const displayedPoints = useMemo(() => {
    if (rangeFilter === '14d') {
      return thirtyDaySummary.points.slice(-14);
    }
    if (rangeFilter === 'peaks') {
      return thirtyDaySummary.points.filter((p) => p.isPeakProductivity);
    }
    return thirtyDaySummary.points;
  }, [thirtyDaySummary.points, rangeFilter]);

  return (
    <div className="space-y-8">
      <div className="border-b border-zinc-200 dark:border-amber-500/20 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display royal-gold-text">
            تحليلات الإنتاجية وتوزيع الـ 30 يوماً
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            مقارنة تفاعلية لتوزيع المهام المكتملة مقابل المهام المتأخرة خلال الـ 30 يوماً الماضية مع تمييز فترات الإنتاجية القصوى.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIncludeBaseline((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-500/35 text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span>
            {includeBaseline
              ? 'عرض: نموذج الـ 30 يوماً + مهامك الفورية'
              : 'عرض: المهام المسجلة حالياً فقط'}
          </span>
        </button>
      </div>

      {/* Top Summary Strip - Single elevation grid with hairline dividers */}
      <div className="bg-white dark:bg-[#111217] border border-zinc-200 dark:border-amber-500/25 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-zinc-200 dark:divide-zinc-800">
        <div className="p-5">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            المهام المكتملة (30 يوماً)
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {thirtyDaySummary.totalCompleted30d}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            بنسبة كفاءة إجمالية {thirtyDaySummary.overallEfficiency}%
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            المهام المتأخرة (30 يوماً)
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-red-500 dark:text-red-400">
            {thirtyDaySummary.totalOverdue30d}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            مقابل {metrics.completedCount} مكتملة اليوم
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            أيام ذروة الإنتاجية القصوى
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-500 dark:text-amber-300">
            {thirtyDaySummary.peakDays.length} أيام
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            أعلاها: {thirtyDaySummary.topPeakDay?.shortLabel} (
            {thirtyDaySummary.topPeakDay?.completed} مهام)
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            فترة الذروة الذهبية اليومية
          </div>
          <div className="mt-2 text-lg font-bold font-mono tabular-nums text-zinc-900 dark:text-amber-200">
            08:00 – 11:30 ص
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            الفترة الأعلى إنجازاً وتركيزاً
          </div>
        </div>
      </div>

      {/* Interactive Recharts 30-Day Completed vs Overdue + Peak Productivity Card */}
      <section
        aria-label="المخطط البياني التفاعلي لـ 30 يوماً"
        className="bg-white dark:bg-[#111217] border border-zinc-200 dark:border-amber-500/30 rounded-xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp
                className="w-5 h-5 text-amber-400 shrink-0"
                aria-hidden="true"
              />
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-amber-200 font-display">
                توزيع المهام المكتملة مقابل المتأخرة خلال الـ 30 يوماً الماضية
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              النقاط الذهبية المضيئة (★) تميّز فترات وأيام الإنتاجية القصوى التي سُجّل فيها أعلى معدل إنجاز بأقل تأخير.
            </p>
          </div>

          {/* Interactive Controls: Range + Chart Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="نطاق الأيام"
              className="inline-flex items-center gap-1 p-1 bg-zinc-100 dark:bg-[#090A0E] border border-amber-500/20 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setRangeFilter('30d')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  rangeFilter === '30d'
                    ? 'royal-gold-btn'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-300'
                }`}
              >
                30 يوماً
              </button>
              <button
                type="button"
                onClick={() => setRangeFilter('14d')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  rangeFilter === '14d'
                    ? 'royal-gold-btn'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-300'
                }`}
              >
                آخر 14 يوماً
              </button>
              <button
                type="button"
                onClick={() => setRangeFilter('peaks')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  rangeFilter === 'peaks'
                    ? 'royal-gold-btn'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-300'
                }`}
              >
                أيام الذروة القصوى ({thirtyDaySummary.peakDays.length})
              </button>
            </div>

            <div
              role="group"
              aria-label="نوع الرسم البياني"
              className="inline-flex items-center gap-1 p-1 bg-zinc-100 dark:bg-[#090A0E] border border-amber-500/20 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setChartMode('composed')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  chartMode === 'composed'
                    ? 'royal-gold-btn'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-300'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                <span>منحنى المساحات</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('bars')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  chartMode === 'bars'
                    ? 'royal-gold-btn'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-300'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>أعمدة مقارنة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chart Legend Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-5">
            <span className="inline-flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
              <span className="w-3 h-3 rounded-xs bg-amber-400 inline-block" />
              <span>المهام المكتملة (الذهبي الملكي)</span>
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
              <span className="w-3 h-3 rounded-xs bg-red-500 inline-block" />
              <span>المهام المتأخرة</span>
            </span>
            <span className="inline-flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>تمييز فترات الإنتاجية القصوى (★ ذروة الأداء)</span>
            </span>
          </div>

          <span className="text-zinc-500 dark:text-zinc-400">
            إجمالي النقاط المعروضة:{' '}
            <strong className="font-mono tabular-nums text-amber-500 dark:text-amber-300">
              {displayedPoints.length}
            </strong>{' '}
            يوم
          </span>
        </div>

        {/* Recharts Responsive Viewport */}
        <div className="h-[340px] w-full pt-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'composed' ? (
              <ComposedChart
                data={displayedPoints}
                margin={{ top: 20, right: 16, left: 0, bottom: 8 }}
              >
                <defs>
                  <linearGradient
                    id="royalGoldAreaGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient
                    id="overdueAreaGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(245, 158, 11, 0.12)"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: '#A1A1AA', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(245, 158, 11, 0.2)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#A1A1AA', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomArabicTooltip />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="المهام المكتملة"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#royalGoldAreaGrad)"
                />
                <Bar
                  dataKey="overdue"
                  name="المهام المتأخرة"
                  barSize={12}
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#FDE68A"
                  strokeWidth={1.5}
                  dot={false}
                />
                {displayedPoints
                  .filter((p) => p.isPeakProductivity)
                  .map((peak) => (
                    <ReferenceDot
                      key={peak.dateStr}
                      x={peak.shortLabel}
                      y={peak.completed}
                      r={6}
                      fill="#FDE68A"
                      stroke="#B45309"
                      strokeWidth={2}
                    />
                  ))}
              </ComposedChart>
            ) : (
              <BarChart
                data={displayedPoints}
                margin={{ top: 20, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(245, 158, 11, 0.12)"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: '#A1A1AA', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(245, 158, 11, 0.2)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#A1A1AA', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomArabicTooltip />} />
                <Bar
                  dataKey="completed"
                  name="المهام المكتملة"
                  radius={[4, 4, 0, 0]}
                >
                  {displayedPoints.map((entry) => (
                    <Cell
                      key={entry.dateStr}
                      fill={entry.isPeakProductivity ? '#FDE68A' : '#F59E0B'}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="overdue"
                  name="المهام المتأخرة"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Highlighted Peak Productivity Periods Strip */}
        <div className="p-4 rounded-xl bg-gradient-to-l from-amber-500/15 via-[#12141C] to-[#0A0B0F] border border-amber-500/35">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <h3 className="text-xs sm:text-sm font-bold text-amber-300 font-display">
                سجل فترات الإنتاجية القصوى المميزة خلال الـ 30 يوماً
              </h3>
            </div>
            <span className="text-xs font-mono tabular-nums text-amber-400">
              ذروة النشاط: {thirtyDaySummary.peakWindowRange}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {thirtyDaySummary.peakDays.slice(0, 6).map((peak) => (
              <div
                key={peak.dateStr}
                className="p-2.5 rounded-lg bg-[#090A0E]/90 border border-amber-500/30 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                  <span>{peak.shortLabel}</span>
                  <span className="font-mono tabular-nums text-emerald-400">
                    {peak.efficiencyRate}%
                  </span>
                </div>
                <div className="mt-1.5 text-sm font-bold font-mono tabular-nums text-white">
                  {peak.completed} مكتملة
                </div>
                <div className="mt-0.5 text-[10px] font-mono tabular-nums text-zinc-400">
                  متأخرة: {peak.overdue} · تركيز {peak.focusedMinutes} د
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Breakdown Table */}
      <div className="bg-white dark:bg-[#121318] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-amber-200 font-display">
            الأداء حسب التصنيف والمجال
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-[#0D0E12] text-xs text-zinc-500 dark:text-zinc-400">
                <th className="py-3 px-5 font-semibold">المجال</th>
                <th className="py-3 px-5 font-semibold">إجمالي المهام</th>
                <th className="py-3 px-5 font-semibold">المكتملة</th>
                <th className="py-3 px-5 font-semibold">الوقت المخصص</th>
                <th className="py-3 px-5 font-semibold">نسبة الإنجاز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {categories.map((cat) => {
                const row = metrics.byCategory[cat];
                const rate =
                  row.total === 0
                    ? 0
                    : Math.round((row.completed / row.total) * 100);
                return (
                  <tr
                    key={cat}
                    className="hover:bg-amber-500/5 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                      {CATEGORY_LABELS[cat]}
                    </td>
                    <td className="py-3.5 px-5 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                      {row.total}
                    </td>
                    <td className="py-3.5 px-5 font-mono tabular-nums text-amber-600 dark:text-amber-400">
                      {row.completed}
                    </td>
                    <td className="py-3.5 px-5 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                      {row.minutes} د
                    </td>
                    <td className="py-3.5 px-5 font-mono tabular-nums font-semibold text-zinc-900 dark:text-amber-300">
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Block Breakdown Table */}
      <div className="bg-white dark:bg-[#121318] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-amber-200 font-display">
            توزيع الجهد حسب الفترات الزمنية
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-[#0D0E12] text-xs text-zinc-500 dark:text-zinc-400">
                <th className="py-3 px-5 font-semibold">الفترة الزمنية</th>
                <th className="py-3 px-5 font-semibold">النطاق</th>
                <th className="py-3 px-5 font-semibold">عدد المهام</th>
                <th className="py-3 px-5 font-semibold">المكتملة</th>
                <th className="py-3 px-5 font-semibold">إجمالي الدقائق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {timeBlocks.map((tb) => {
                const row = metrics.byTimeBlock[tb];
                return (
                  <tr
                    key={tb}
                    className="hover:bg-amber-500/5 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                      {TIME_BLOCK_LABELS[tb].title}
                    </td>
                    <td className="py-3.5 px-5 font-mono tabular-nums text-xs text-zinc-500 dark:text-zinc-400">
                      {TIME_BLOCK_LABELS[tb].range}
                    </td>
                    <td className="py-3.5 px-5 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                      {row.total}
                    </td>
                    <td className="py-3.5 px-5 font-mono tabular-nums text-amber-600 dark:text-amber-400">
                      {row.completed}
                    </td>
                    <td className="py-3.5 px-5 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                      {row.minutes} د
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
