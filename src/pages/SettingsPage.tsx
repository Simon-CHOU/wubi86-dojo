import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Save, RefreshCw, Calendar, Flag } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';

const SESSION_LENGTH_OPTIONS = [
  { value: '60', label: '1 分钟' },
  { value: '180', label: '3 分钟' },
  { value: '300', label: '5 分钟' },
  { value: '600', label: '10 分钟' },
];

const SettingsPage: React.FC = () => {
  const { settings, baseline, updateSettings, resetProgress } = useStore();

  const [formData, setFormData] = useState({
    targetWpm: settings.targetWpm,
    daysDuration: settings.daysDuration,
    sessionLength: settings.sessionLength,
    showWubiHints: settings.showWubiHints,
  });
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync form when settings change externally
  useEffect(() => {
    setFormData({
      targetWpm: settings.targetWpm,
      daysDuration: settings.daysDuration,
      sessionLength: settings.sessionLength,
      showWubiHints: settings.showWubiHints,
    });
  }, [settings]);

  const handleChange = (field: string, value: number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    updateSettings({
      targetWpm: formData.targetWpm,
      daysDuration: formData.daysDuration,
      sessionLength: formData.sessionLength,
      showWubiHints: formData.showWubiHints,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
    window.alert('所有练习进度已重置。设置保持不变。');
  };

  const startDate = new Date(settings.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + formData.daysDuration);

  const dailyIncrement =
    formData.daysDuration > 0
      ? (formData.targetWpm / formData.daysDuration).toFixed(1)
      : '0';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          设置与计划
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          制定你的{formData.daysDuration}天五笔特训计划。
        </p>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Baseline Info */}
          <div
            className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
          >
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  当前基线 (双拼)
                </h3>
                <div className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-200">
                  {baseline ? `${baseline.wpm} WPM` : '尚未测试'}
                </div>
                {!baseline && (
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    <a
                      href="/baseline"
                      className="underline hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                    >
                      前往基线测试
                    </a>
                    {' '}以获取准确的目标建议。
                  </p>
                )}
              </div>
              {baseline && (
                <span className="text-sm text-blue-700 dark:text-blue-300 whitespace-nowrap">
                  测试于: {new Date(baseline.testDate).toLocaleDateString('zh-CN')}
                </span>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Target WPM */}
            <div>
              <label
                htmlFor="targetWpm"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                目标速度 (WPM)
              </label>
              <input
                type="number"
                name="targetWpm"
                id="targetWpm"
                min={1}
                max={200}
                value={formData.targetWpm}
                onChange={e => handleChange('targetWpm', Math.max(1, Number(e.target.value)))}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm p-2"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                建议设置为你的双拼基线速度 ({baseline?.wpm ?? '?'} WPM)。
              </p>
            </div>

            {/* Days Duration */}
            <div>
              <label
                htmlFor="daysDuration"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                计划时长 (天)
              </label>
              <input
                type="number"
                name="daysDuration"
                id="daysDuration"
                min={7}
                max={90}
                value={formData.daysDuration}
                onChange={e => handleChange('daysDuration', Math.max(7, Number(e.target.value)))}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm p-2"
              />
            </div>

            {/* Session Length */}
            <div>
              <Select
                label="单次练习时长"
                options={SESSION_LENGTH_OPTIONS}
                value={String(formData.sessionLength)}
                onChange={value => handleChange('sessionLength', Number(value))}
              />
            </div>

            {/* Show Wubi Hints – toggle switch */}
            <div className="flex items-end pb-1">
              <label
                htmlFor="showWubiHints"
                className="flex items-center cursor-pointer"
              >
                {/* Toggle track */}
                <div className="relative">
                  <input
                    id="showWubiHints"
                    name="showWubiHints"
                    type="checkbox"
                    checked={formData.showWubiHints}
                    onChange={e => handleChange('showWubiHints', e.target.checked)}
                    className="sr-only peer"
                    aria-describedby="hints-description"
                  />
                  <div className={`
                    block w-10 h-6 rounded-full transition-colors duration-200
                    ${formData.showWubiHints
                      ? 'bg-emerald-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                    }
                  `} />
                  <div className={`
                    absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full
                    shadow-sm transition-transform duration-200
                    peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500
                    ${formData.showWubiHints ? 'translate-x-4' : 'translate-x-0'}
                  `} />
                </div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    显示五笔编码提示
                  </span>
                  <span id="hints-description" className="block text-xs text-gray-500 dark:text-gray-400">
                    练习时在汉字下方显示五笔编码。
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Plan Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              计划概览
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <dt className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                  开始日期
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {startDate.toLocaleDateString('zh-CN')}
                </dd>
              </div>
              <div>
                <dt className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Flag className="w-3 h-3 mr-1" aria-hidden="true" />
                  预计达成日期
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {endDate.toLocaleDateString('zh-CN')}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  每日进度增量
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  +{dailyIncrement} WPM / 天
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="danger"
              onClick={() => setShowResetConfirm(true)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重置所有进度
            </Button>

            <Button
              variant="primary"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 mr-2" />
              {saved ? '已保存' : '保存设置'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Reset Confirmation Modal (simple inline dialog) */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
          >
            <h3
              id="reset-dialog-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              确认重置
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              确定要重置所有练习进度吗？这将清除所有练习记录和基线测试结果。
              练习设置将保持不变。
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowResetConfirm(false)}
              >
                取消
              </Button>
              <Button
                variant="danger"
                onClick={handleReset}
              >
                确认重置
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
