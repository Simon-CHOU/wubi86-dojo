import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const StatsPage: React.FC = () => {
  const { sessions, baseline, settings } = useStore();

  const statsData = useMemo(() => {
    // 1. Group sessions by date
    const sessionsByDate: Record<string, { totalWpm: number; count: number; maxWpm: number }> = {};
    
    sessions.forEach(session => {
      const dateStr = new Date(session.date).toLocaleDateString();
      if (!sessionsByDate[dateStr]) {
        sessionsByDate[dateStr] = { totalWpm: 0, count: 0, maxWpm: 0 };
      }
      sessionsByDate[dateStr].totalWpm += session.wpm;
      sessionsByDate[dateStr].count += 1;
      sessionsByDate[dateStr].maxWpm = Math.max(sessionsByDate[dateStr].maxWpm, session.wpm);
    });

    // 2. Generate data for the chart (covering the 30 days plan or at least session range)
    const startDate = new Date(settings.startDate);
    const data = [];
    const baselineWpm = baseline?.wpm || settings.targetWpm;
    
    // We want to show at least from start date to today + some future
    // Or just the 30 days plan
    for (let i = 0; i <= settings.daysDuration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toLocaleDateString();
      
      // Calculate target WPM for this day
      // Linear progression from 5 to baselineWpm
      const progress = i / settings.daysDuration;
      const targetWpm = Math.round(5 + (baselineWpm - 5) * progress);

      const actualStats = sessionsByDate[dateStr];
      
      data.push({
        day: `Day ${i}`,
        date: dateStr,
        targetWpm,
        actualAvgWpm: actualStats ? Math.round(actualStats.totalWpm / actualStats.count) : null,
        actualMaxWpm: actualStats ? actualStats.maxWpm : null,
      });
    }
    
    return data;
  }, [sessions, baseline, settings]);

  const overallStats = useMemo(() => {
    if (sessions.length === 0) return null;
    const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0);
    const avgWpm = Math.round(sessions.reduce((acc, s) => acc + s.wpm, 0) / sessions.length);
    const maxWpm = Math.max(...sessions.map(s => s.wpm));
    const totalSessions = sessions.length;
    
    return {
      totalTime,
      avgWpm,
      maxWpm,
      totalSessions
    };
  }, [sessions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">练习进度统计</h2>
        <p className="mt-2 text-gray-600">
          查看你的每日进步和目标达成情况。
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">总练习时长</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {overallStats ? formatTime(overallStats.totalTime) : '0分'}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">总练习次数</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {overallStats ? overallStats.totalSessions : 0}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">平均速度 (WPM)</dt>
            <dd className="mt-1 text-3xl font-semibold text-emerald-600">
              {overallStats ? overallStats.avgWpm : 0}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">最高速度 (WPM)</dt>
            <dd className="mt-1 text-3xl font-semibold text-emerald-600">
              {overallStats ? overallStats.maxWpm : 0}
            </dd>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">WPM 趋势与目标对比</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={statsData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="targetWpm" 
                name="目标 WPM" 
                stroke="#9CA3AF" 
                strokeDasharray="5 5" 
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="actualAvgWpm" 
                name="平均 WPM" 
                stroke="#059669" 
                activeDot={{ r: 8 }} 
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="actualMaxWpm" 
                name="最高 WPM" 
                stroke="#10B981" 
                strokeOpacity={0.5}
                connectNulls
              />
              {baseline && (
                <ReferenceLine y={baseline.wpm} label="Baseline" stroke="red" strokeDasharray="3 3" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
