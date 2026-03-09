import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Save, RefreshCw } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { settings, baseline, updateSettings, resetProgress } = useStore();
  
  // Local state for form handling
  const [formData, setFormData] = useState({
    targetWpm: settings.targetWpm,
    daysDuration: settings.daysDuration,
    sessionLength: settings.sessionLength,
    showWubiHints: settings.showWubiHints,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // If baseline exists and targetWpm hasn't been set to it yet (or is default), we might suggest it.
    // But for now, just load current settings.
    if (baseline && settings.targetWpm !== baseline.wpm) {
      // Ideally we might prompt user, but here we just show it as reference
    }
  }, [baseline, settings.targetWpm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : Number(value)
    }));
    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('确定要重置所有进度吗？这将清除所有练习记录和基线测试结果。')) {
      resetProgress();
      alert('进度已重置');
    }
  };

  const startDate = new Date(settings.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + formData.daysDuration);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">设置与计划</h2>
        <p className="mt-2 text-gray-600">
          制定你的30天五笔特训计划。
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Baseline Info */}
        <div className="bg-blue-50 p-4 rounded-md flex items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800">当前基线 (双拼)</h3>
            <div className="mt-1 text-2xl font-bold text-blue-900">
              {baseline ? `${baseline.wpm} WPM` : '尚未测试'}
            </div>
            {!baseline && (
              <p className="mt-1 text-xs text-blue-600">
                请先完成基线测试以获取准确的目标建议。
              </p>
            )}
          </div>
          {baseline && (
             <div className="text-sm text-blue-700">
               测试于: {new Date(baseline.testDate).toLocaleDateString()}
             </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="targetWpm" className="block text-sm font-medium text-gray-700">
              目标速度 (WPM)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="targetWpm"
                id="targetWpm"
                value={formData.targetWpm}
                onChange={handleChange}
                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">建议设置为你的双拼基线速度。</p>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="daysDuration" className="block text-sm font-medium text-gray-700">
              计划时长 (天)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="daysDuration"
                id="daysDuration"
                value={formData.daysDuration}
                onChange={handleChange}
                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="sessionLength" className="block text-sm font-medium text-gray-700">
              单次练习时长 (秒)
            </label>
            <div className="mt-1">
              <select
                id="sessionLength"
                name="sessionLength"
                value={formData.sessionLength}
                onChange={handleChange}
                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              >
                <option value={60}>1 分钟</option>
                <option value={180}>3 分钟</option>
                <option value={300}>5 分钟</option>
                <option value={600}>10 分钟</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-3 flex items-center pt-6">
             <div className="flex items-center h-5">
              <input
                id="showWubiHints"
                name="showWubiHints"
                type="checkbox"
                checked={formData.showWubiHints}
                onChange={handleChange}
                className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="showWubiHints" className="font-medium text-gray-700">
                显示五笔编码提示
              </label>
              <p className="text-gray-500">练习时在汉字下方显示编码。</p>
            </div>
          </div>
        </div>

        {/* Plan Summary */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-900">计划概览</h3>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-gray-500">开始日期</dt>
              <dd className="mt-1 text-sm text-gray-900">{startDate.toLocaleDateString()}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-gray-500">预计达成日期</dt>
              <dd className="mt-1 text-sm text-gray-900">{endDate.toLocaleDateString()}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-gray-500">每日进度增量 (估算)</dt>
              <dd className="mt-1 text-sm text-gray-900">
                +{(formData.targetWpm / formData.daysDuration).toFixed(1)} WPM / 天
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重置所有进度
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              saved ? 'bg-green-600' : 'bg-emerald-600 hover:bg-emerald-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
          >
            <Save className="w-4 h-4 mr-2" />
            {saved ? '已保存' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
