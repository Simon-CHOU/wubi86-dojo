import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useStore } from '../store/useStore';
import { formatTime } from '../lib/utils';
import type { TypingStats } from '../types';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TypingStats;
  inputMethod: 'wubi86' | 'shuangpin';
  onRetry: () => void;
}

/**
 * Animated counter: counts from 0 to `target` over `duration` ms.
 */
function useAnimatedValue(target: number, duration: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for a nice feel
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  stats,
  inputMethod,
  onRetry,
}) => {
  const navigate = useNavigate();
  const addSession = useStore((s) => s.addSession);
  const [saved, setSaved] = useState(false);

  // Auto-save session on mount
  useEffect(() => {
    if (isOpen && !saved && stats.duration > 0) {
      addSession({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        duration: stats.duration,
        inputMethod,
        mistakes: [],
      });
      setSaved(true);
    }
  }, [isOpen, saved, stats, inputMethod, addSession]);

  // Reset saved flag when modal reopens
  useEffect(() => {
    if (!isOpen) {
      // Delay reset so the effect above doesn't re-fire on close
      const timer = setTimeout(() => setSaved(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const animatedCpm = useAnimatedValue(stats.cpm, 800);
  const animatedWpm = useAnimatedValue(stats.wpm, 800);
  const animatedAccuracy = useAnimatedValue(stats.accuracy, 800);

  const handleRetry = useCallback(() => {
    onClose();
    onRetry();
  }, [onClose, onRetry]);

  const handleViewStats = useCallback(() => {
    onClose();
    navigate('/stats');
  }, [onClose, navigate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="练习完成!"
      footer={
        <>
          <Button variant="secondary" onClick={handleRetry}>
            再练一次
          </Button>
          <Button variant="primary" onClick={handleViewStats}>
            查看统计
          </Button>
        </>
      }
    >
      {/* Confetti / celebration bar */}
      <div className="relative overflow-hidden h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 animate-pulse rounded-full" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">速度</div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {animatedWpm}
            <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">WPM</span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {animatedCpm} CPM
          </div>
        </div>

        <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">准确率</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {animatedAccuracy}
            <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">%</span>
          </div>
        </div>

        <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">用时</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatTime(stats.duration)}
          </div>
        </div>

        <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">进度</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.progress}
            <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">%</span>
          </div>
        </div>
      </div>

      {stats.wpm >= 80 && (
        <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
          太棒了！继续保持！
        </p>
      )}
    </Modal>
  );
};

export default ResultsModal;
