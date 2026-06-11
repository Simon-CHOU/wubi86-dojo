import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getGoalForDay } from '../lib/goals';
import { formatTime } from '../lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { BarChart2, Clock, Hash, TrendingUp, Target, Play } from 'lucide-react';
import StatsCard from '../components/ui/StatsCard';
import Card from '../components/ui/Card';
import type { PracticeSession } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChartDataPoint {
  date: string;
  dateKey: string;
  targetWpm: number;
  avgWpm: number | null;
  maxWpm: number | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Group sessions by date (YYYY-MM-DD key) for chart matching. */
function groupSessionsByDate(
  sessions: PracticeSession[],
): Record<string, { wpmSum: number; count: number; maxWpm: number }> {
  const grouped: Record<string, { wpmSum: number; count: number; maxWpm: number }> = {};

  for (const session of sessions) {
    const d = new Date(session.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (!grouped[key]) {
      grouped[key] = { wpmSum: 0, count: 0, maxWpm: 0 };
    }
    grouped[key].wpmSum += session.wpm;
    grouped[key].count += 1;
    grouped[key].maxWpm = Math.max(grouped[key].maxWpm, session.wpm);
  }

  return grouped;
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

interface TooltipPayloadEntry {
  name: string;
  value: number | null;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--tooltip-bg, #fff)',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontSize: '13px',
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 6, color: '#374151' }}>
        {label}
      </p>
      {payload.map((entry) => {
        if (entry.value === null) return null;
        return (
          <p key={entry.name} style={{ color: entry.color, marginBottom: 2 }}>
            {entry.name}: {entry.value} WPM
          </p>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// StatsPage
// ---------------------------------------------------------------------------

const StatsPage: React.FC = () => {
  const { sessions, baseline, settings } = useStore();

  // -- Overall aggregate stats ----------------------------------------------
  const overallStats = useMemo(() => {
    if (sessions.length === 0) return null;

    const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0);
    const avgWpm = Math.round(
      sessions.reduce((acc, s) => acc + s.wpm, 0) / sessions.length,
    );
    const maxWpm = Math.max(...sessions.map((s) => s.wpm));
    const avgAccuracy = Math.round(
      sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length,
    );

    return { totalTime, avgWpm, maxWpm, avgAccuracy, totalSessions: sessions.length };
  }, [sessions]);

  // -- Chart data -----------------------------------------------------------
  const chartData = useMemo((): ChartDataPoint[] => {
    const grouped = groupSessionsByDate(sessions);

    const startDate = new Date(settings.startDate);
    const today = new Date();

    // Number of days from startDate to today (inclusive)
    const msPerDay = 86400000;
    const timeDiff = today.getTime() - startDate.getTime();
    const daysToShow = Math.max(Math.floor(timeDiff / msPerDay) + 1, 0);

    // Clamp to plan duration for target calculation
    const planDays = Math.max(settings.daysDuration, 1);
    const effectiveDays = Math.min(daysToShow, planDays + 1);

    const data: ChartDataPoint[] = [];

    for (let i = 0; i < effectiveDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // ISO date key for matching
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      // Display label in Chinese format
      const dateLabel = currentDate.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      });

      // Target from goals utility
      const targetWpm = baseline && baseline.wpm > 0
        ? getGoalForDay(baseline.wpm, planDays, i)
        : 0;

      const dayStats = grouped[dateKey];

      data.push({
        date: dateLabel,
        dateKey,
        targetWpm,
        avgWpm: dayStats ? Math.round(dayStats.wpmSum / dayStats.count) : null,
        maxWpm: dayStats?.maxWpm ?? null,
      });
    }

    return data;
  }, [sessions, baseline, settings]);

  // -- Empty state ----------------------------------------------------------
  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            练习进度统计
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            查看你的每日进步和目标达成情况。
          </p>
        </div>
        <div className="flex min-h-[300px] flex-col items-center justify-center py-16 text-center">
          <BarChart2
            className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
            aria-hidden="true"
          />
          <h3 className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
            开始练习以查看统计
          </h3>
          <p className="mb-6 max-w-sm text-gray-500 dark:text-gray-500">
            完成一次打字练习后，你的进度统计将在这里显示。现在就开始练习吧！
          </p>
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          >
            <Play className="mr-2 h-4 w-4" aria-hidden="true" />
            开始练习
          </Link>
        </div>
      </div>
    );
  }

  // -- Render stats + chart ------------------------------------------------
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          练习进度统计
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          查看你的每日进步和目标达成情况。
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          icon={Clock}
          label="总练习时长"
          value={formatTime(overallStats!.totalTime)}
          trend="neutral"
        />
        <StatsCard
          icon={Hash}
          label="总练习次数"
          value={overallStats!.totalSessions}
          suffix="次"
          trend="neutral"
        />
        <StatsCard
          icon={TrendingUp}
          label="平均速度"
          value={overallStats!.avgWpm}
          suffix="WPM"
          trend={overallStats!.avgWpm > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          icon={TrendingUp}
          label="最高速度"
          value={overallStats!.maxWpm}
          suffix="WPM"
          trend="up"
        />
        <StatsCard
          icon={Target}
          label="平均准确率"
          value={overallStats!.avgAccuracy}
          suffix="%"
          trend={overallStats!.avgAccuracy >= 90 ? 'up' : 'neutral'}
        />
      </div>

      {/* Chart */}
      <Card title="WPM 趋势与目标对比">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                className="dark:opacity-20"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                axisLine={{ stroke: '#E5E7EB' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                axisLine={{ stroke: '#E5E7EB' }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />

              {/* Target line – dashed gray */}
              <Line
                type="monotone"
                dataKey="targetWpm"
                name="目标"
                stroke="#9CA3AF"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />

              {/* Actual average – solid emerald */}
              <Line
                type="monotone"
                dataKey="avgWpm"
                name="平均"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#059669' }}
                connectNulls
              />

              {/* Actual max – lighter emerald */}
              <Line
                type="monotone"
                dataKey="maxWpm"
                name="最高"
                stroke="#34D399"
                strokeOpacity={0.6}
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />

              {/* Baseline reference line – red dashed */}
              {baseline && baseline.wpm > 0 && (
                <ReferenceLine
                  y={baseline.wpm}
                  label={{
                    value: `基线 ${baseline.wpm} WPM`,
                    position: 'insideTopRight',
                    fill: '#EF4444',
                    fontSize: 12,
                  }}
                  stroke="#EF4444"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Summary message */}
      {baseline && overallStats && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          {overallStats.avgWpm >= baseline.wpm ? (
            <p>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                恭喜！
              </span>
              {' '}你的平均速度已达到或超过基线水平（{baseline.wpm} WPM）。
            </p>
          ) : (
            <p>
              基线速度: <span className="font-semibold">{baseline.wpm} WPM</span>
              {' · '}当前差距:{' '}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {baseline.wpm - overallStats.avgWpm} WPM
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsPage;
