import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useStore } from '../store/useStore';
import { Play, RotateCcw, Save } from 'lucide-react';

const TEST_TEXT = "在这个快速发展的时代打字速度已经成为了一项重要的技能我们需要不断练习才能提高效率双拼输入法是一种非常高效的输入方式掌握它需要一定的时间和耐心";

const BaselinePage: React.FC = () => {
  const navigate = useNavigate();
  const setBaseline = useStore(state => state.setBaseline);
  const { userInput, handleInputChange, reset, stats, isRunning } = useTypingEngine(TEST_TEXT);
  const [hasSaved, setHasSaved] = useState(false);

  const handleSave = () => {
    setBaseline({
      wpm: stats.wpm,
      testDate: new Date().toISOString(),
    });
    setHasSaved(true);
    // Redirect to settings or practice after a short delay
    setTimeout(() => {
      navigate('/settings');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">基线测试</h2>
        <p className="mt-2 text-gray-600">
          请使用你目前的输入法（双拼）输入下方的文字。这将作为你未来30天的目标基准。
          测试开始后计时，输入完成后自动停止。
        </p>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-500">速度 (WPM)</div>
          <div className="text-3xl font-bold text-emerald-600">{stats.wpm}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-500">准确率</div>
          <div className="text-3xl font-bold text-blue-600">{stats.accuracy}%</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-500">时间</div>
          <div className="text-3xl font-bold text-orange-600">{stats.duration}s</div>
        </div>
      </div>

      {/* Text Display */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 text-xl leading-relaxed font-serif tracking-wide select-none">
        {TEST_TEXT.split('').map((char, index) => {
          let colorClass = 'text-gray-400';
          let bgClass = 'bg-transparent';
          
          if (index < userInput.length) {
            if (userInput[index] === char) {
              colorClass = 'text-gray-900';
              bgClass = 'bg-green-100';
            } else {
              colorClass = 'text-red-600';
              bgClass = 'bg-red-100';
            }
          } else if (index === userInput.length) {
            bgClass = 'bg-blue-100 animate-pulse'; // Cursor position
          }

          return (
            <span key={index} className={`${colorClass} ${bgClass} rounded px-0.5 transition-colors`}>
              {char}
            </span>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={userInput}
          onChange={handleInputChange}
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg resize-none"
          placeholder="点击此处开始输入..."
          disabled={stats.isFinished}
          autoFocus
        />
        {!isRunning && userInput.length === 0 && (
           <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
             
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </button>
        
        {stats.isFinished && (
          <button
            onClick={handleSave}
            disabled={hasSaved}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              hasSaved ? 'bg-green-600' : 'bg-emerald-600 hover:bg-emerald-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
          >
            <Save className="w-4 h-4 mr-2" />
            {hasSaved ? '已保存' : '保存结果'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BaselinePage;
