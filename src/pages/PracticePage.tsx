import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { practiceTexts } from '../data/practice_texts';
import { getWubiCode } from '../data/wubi86_mapping';
import StatsCard from '../components/ui/StatsCard';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import TypingArea from '../components/TypingArea';
import ResultsModal from '../components/ResultsModal';
import {
  RotateCcw,
  Keyboard,
  Clock,
  Target,
  TrendingUp,
  Eye,
  EyeOff,
  Info,
  ArrowRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Options mapped from practice texts
// ---------------------------------------------------------------------------

const SELECT_OPTIONS = practiceTexts.map((text) => ({
  value: text.id,
  label: `${text.title} (${text.difficulty === 'easy' ? '简单' : text.difficulty === 'medium' ? '中等' : '困难'})`,
}));

// ---------------------------------------------------------------------------
// PracticePage
// ---------------------------------------------------------------------------

const PracticePage: React.FC = () => {
  const { settings, baseline, addSession } = useStore();
  const [selectedTextId, setSelectedTextId] = useState<string>(practiceTexts[0].id);
  const [sessionSaved, setSessionSaved] = useState(false);

  // -- Per-session Wubi hints toggle (overrides global setting) ------------
  const [sessionHintsEnabled, setSessionHintsEnabled] = useState(settings.showWubiHints);

  const currentText = practiceTexts.find((t) => t.id === selectedTextId) ?? practiceTexts[0];

  const {
    userInput,
    handleInputChange,
    reset,
    stats,
    isRunning,
    isFinished,
    status,
  } = useTypingEngine(currentText.content, settings.sessionLength);

  // Reset when text selection changes
  useEffect(() => {
    reset();
    setSessionSaved(false);
  }, [selectedTextId, reset]);

  // Auto-save session on completion
  useEffect(() => {
    if (isFinished && !sessionSaved && userInput.length > 0) {
      addSession({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        duration: stats.duration,
        inputMethod: 'wubi86',
        mistakes: [],
      });
      setSessionSaved(true);
    }
  }, [isFinished, sessionSaved, userInput.length, stats, addSession]);

  // -- Handlers -------------------------------------------------------------

  const handleRetry = useCallback(() => {
    reset();
    setSessionSaved(false);
  }, [reset]);

  const handleTextChange = useCallback((value: string) => {
    setSelectedTextId(value);
    setSessionSaved(false);
  }, []);

  const toggleHints = useCallback(() => {
    setSessionHintsEnabled((prev) => !prev);
  }, []);

  // -- Keyboard shortcut: Ctrl+Enter to start/reset -------------------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleRetry();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRetry]);

  // -- aria-live status announcement ----------------------------------------
  const statusAnnouncement = useMemo(() => {
    if (isFinished) return '练习已完成';
    if (isRunning) return `正在练习，速度 ${stats.wpm} WPM，准确率 ${stats.accuracy}%`;
    if (status === 'idle') return '点击输入框开始练习，或按 Ctrl+Enter 重置';
    return '';
  }, [isFinished, isRunning, status, stats.wpm, stats.accuracy]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* aria-live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusAnnouncement}
      </div>

      {/* No baseline warning – callout card */}
      {!baseline && (
        <div
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
          role="alert"
        >
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              尚未完成基线测试
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              建议先完成基线测试，了解你当前的双拼速度，以便制定合理的学习目标。
            </p>
            <Link
              to="/baseline"
              className="mt-2 inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            >
              前往基线测试
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            打字练习
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            目标: {settings.targetWpm} WPM · 时长: {Math.round(settings.sessionLength / 60)}分钟
          </p>
        </div>
        <div className="w-full sm:w-56">
          <Select
            label="选择练习文本"
            options={SELECT_OPTIONS}
            value={selectedTextId}
            onChange={handleTextChange}
            disabled={isRunning}
          />
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          icon={TrendingUp}
          label="进度"
          value={stats.progress}
          suffix="%"
          trend={stats.progress === 100 ? 'up' : 'neutral'}
        />
        <StatsCard
          icon={Clock}
          label="用时"
          value={stats.duration}
          suffix="秒"
          trend="neutral"
        />
      </div>

      {/* Wubi hints toggle + reset */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleHints}
          className={`
            inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium
            transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-emerald-500
            ${
              sessionHintsEnabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }
          `}
          aria-pressed={sessionHintsEnabled}
          aria-label={sessionHintsEnabled ? '隐藏五笔编码提示' : '显示五笔编码提示'}
        >
          {sessionHintsEnabled ? (
            <Eye className="h-4 w-4" aria-hidden="true" />
          ) : (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          )}
          <span>五笔提示</span>
        </button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRetry}
          disabled={!isFinished && !isRunning && userInput.length === 0}
          aria-label="重新开始练习"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
          重置
        </Button>
      </div>

      {/* Typing area */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <TypingArea
          text={currentText.content}
          userInput={userInput}
          showHints={sessionHintsEnabled}
          getWubiCode={getWubiCode}
        />

        {/* Input */}
        <div className="mt-4">
          <textarea
            value={userInput}
            onChange={handleInputChange}
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg resize-none"
            placeholder="点击此处开始输入..."
            disabled={isFinished}
            autoFocus
            aria-label="打字输入区域"
          />
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        快捷键: Ctrl + Enter 重新开始
      </p>

      {/* Results Modal */}
      <ResultsModal
        isOpen={isFinished && userInput.length > 0}
        onClose={handleRetry}
        stats={stats}
        inputMethod="wubi86"
        onRetry={handleRetry}
      />
    </div>
  );
};

export default PracticePage;
