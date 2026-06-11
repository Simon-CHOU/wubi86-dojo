import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { practiceTexts } from '../data/practice_texts';
import { getWubiCode } from '../data/wubi86_mapping';
import StatsCard from '../components/ui/StatsCard';
import Button from '../components/ui/Button';
import TypingArea from '../components/TypingArea';
import ResultsModal from '../components/ResultsModal';
import {
  RotateCcw,
  Save,
  Keyboard,
  Target,
  Clock,
  Activity,
  CheckCircle2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Select a medium difficulty text for the baseline test
// ---------------------------------------------------------------------------

const BASELINE_TEXT =
  practiceTexts.find((t) => t.difficulty === 'medium')?.content ??
  '白日依山尽黄河入海流欲穷千里目更上一层楼';

// ---------------------------------------------------------------------------
// BaselinePage
// ---------------------------------------------------------------------------

const BaselinePage: React.FC = () => {
  const navigate = useNavigate();
  const { baseline, setBaseline } = useStore();

  const {
    userInput,
    handleInputChange,
    reset: resetEngine,
    stats,
    isRunning,
    isFinished,
  } = useTypingEngine(BASELINE_TEXT);

  // -- Local state ----------------------------------------------------------
  const [baselineSaved, setBaselineSaved] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isRetesting, setIsRetesting] = useState(false);

  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- Show results modal on completion ------------------------------------
  useEffect(() => {
    if (isFinished && userInput.length > 0 && !isRetesting) {
      setShowResults(true);
    }
  }, [isFinished, userInput.length, isRetesting]);

  // -- Auto-save baseline + navigate after 1.5s on completion --------------
  useEffect(() => {
    if (isFinished && userInput.length > 0 && !baselineSaved && !isRetesting) {
      // Auto-save baseline data
      setBaseline({
        wpm: stats.wpm,
        testDate: new Date().toISOString(),
      });
      setBaselineSaved(true);

      // Schedule navigation to /settings after 1.5s
      navTimerRef.current = setTimeout(() => {
        navigate('/settings');
      }, 1500);
    }

    return () => {
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current);
        navTimerRef.current = null;
      }
    };
  }, [isFinished, userInput.length, baselineSaved, isRetesting, stats.wpm, setBaseline, navigate]);

  // -- Handlers -------------------------------------------------------------

  const handleRetry = useCallback(() => {
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    setIsRetesting(true);
    setShowResults(false);
    setBaselineSaved(false);
    resetEngine();
    // Allow retesting state to reset after engine is idle
    setTimeout(() => setIsRetesting(false), 100);
  }, [resetEngine]);

  const handleSave = useCallback(() => {
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    setBaseline({
      wpm: stats.wpm,
      testDate: new Date().toISOString(),
    });
    setBaselineSaved(true);
    setShowResults(false);

    setTimeout(() => {
      navigate('/settings');
    }, 1500);
  }, [stats.wpm, setBaseline, navigate]);

  // -- Derived --------------------------------------------------------------
  const canReset = isRunning || userInput.length > 0;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          基线测试
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          使用你目前最熟练的输入法（双拼或拼音）输入以下文字。
          测试结果将作为未来30天五笔训练的目标基准。
          开始输入后自动计时，输入完成自动停止。
        </p>
      </div>

      {/* Existing baseline notice – CalloutCard style */}
      {baseline && !isFinished && (
        <div
          className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
          role="status"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Activity className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  已有基线数据
                </h3>
                <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-200">
                  {baseline.wpm}
                  <span className="ml-1 text-base font-medium text-blue-600 dark:text-blue-400">
                    WPM
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
                  测试日期: {new Date(baseline.testDate).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              重新测试将覆盖现有基线数据。
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRetry}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              重新测试
            </Button>
          </div>
        </div>
      )}

      {/* Stats dashboard */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          icon={Keyboard}
          label="速度"
          value={stats.wpm}
          suffix="WPM"
          trend={stats.wpm > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          icon={Target}
          label="准确率"
          value={stats.accuracy}
          suffix="%"
          trend={stats.accuracy >= 95 ? 'up' : stats.accuracy > 0 && stats.accuracy < 80 ? 'down' : 'neutral'}
        />
        <StatsCard
          icon={Clock}
          label="用时"
          value={stats.duration}
          suffix="秒"
          trend="neutral"
        />
      </div>

      {/* Typing area (no Wubi hints) */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
        <TypingArea
          text={BASELINE_TEXT}
          userInput={userInput}
          showHints={false}
          getWubiCode={getWubiCode}
        />

        {/* Input */}
        <div className="mt-4">
          <textarea
            value={userInput}
            onChange={handleInputChange}
            className="w-full h-32 resize-none rounded-lg border border-gray-300 bg-white p-4 text-lg text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="在此输入，测试自动开始..."
            disabled={isFinished}
            autoFocus
            aria-label="基线测试输入区域"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="secondary"
          onClick={resetEngine}
          disabled={!canReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          重置
        </Button>

        {isFinished && !baselineSaved && (
          <Button
            variant="primary"
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            保存结果
          </Button>
        )}

        {isFinished && baselineSaved && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>基线已保存，即将跳转至设置页面...</span>
          </div>
        )}
      </div>

      {/* Results Modal */}
      {showResults && (
        <ResultsModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          stats={stats}
          inputMethod="shuangpin"
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default BaselinePage;
