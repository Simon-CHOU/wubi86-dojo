import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { practiceTexts, PracticeText } from '../data/practice_texts';
import { getWubiCode } from '../data/wubi86_mapping';
import { RotateCcw, Play, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const PracticePage: React.FC = () => {
  const { settings, addSession } = useStore();
  const [selectedTextId, setSelectedTextId] = useState<string>(practiceTexts[0].id);
  const [currentText, setCurrentText] = useState<PracticeText>(practiceTexts[0]);
  const [sessionSaved, setSessionSaved] = useState(false);

  const { 
    userInput, 
    handleInputChange, 
    reset, 
    stats, 
    isRunning,
    start 
  } = useTypingEngine(currentText.content, settings.sessionLength);

  useEffect(() => {
    const text = practiceTexts.find(t => t.id === selectedTextId);
    if (text) {
      setCurrentText(text);
      reset();
      setSessionSaved(false);
    }
  }, [selectedTextId, reset]);

  // Save session when finished
  useEffect(() => {
    if (stats.isFinished && !sessionSaved && userInput.length > 0) {
      addSession({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        duration: stats.duration,
        inputMethod: 'wubi86',
        mistakes: [], // TODO: Track actual mistakes
      });
      setSessionSaved(true);
    }
  }, [stats.isFinished, sessionSaved, userInput, stats, addSession]);

  const handleTextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTextId(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">打字练习</h2>
          <p className="mt-1 text-gray-600">
            目标: {settings.targetWpm} WPM
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTextId}
            onChange={handleTextChange}
            disabled={isRunning}
            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
          >
            {practiceTexts.map(text => (
              <option key={text.id} value={text.id}>
                {text.title} ({text.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">速度</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.wpm} <span className="text-sm text-gray-400">WPM</span></div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">准确率</div>
          <div className="text-2xl font-bold text-blue-600">{stats.accuracy}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">进度</div>
          <div className="text-2xl font-bold text-indigo-600">{stats.progress}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">时间</div>
          <div className="text-2xl font-bold text-orange-600">{stats.duration}s</div>
        </div>
      </div>

      {/* Typing Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Text Display with Hints */}
        <div className="mb-6 text-xl leading-relaxed font-serif tracking-wide select-none flex flex-wrap gap-y-4">
          {currentText.content.split('').map((char, index) => {
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
              bgClass = 'bg-blue-100 ring-2 ring-blue-400 ring-opacity-50'; // Cursor
            }

            const wubiCode = getWubiCode(char);

            return (
              <div key={index} className={`flex flex-col items-center mx-0.5 p-1 rounded ${bgClass}`}>
                <span className={`${colorClass} transition-colors`}>{char}</span>
                {settings.showWubiHints && (
                  <span className="text-xs text-gray-400 font-mono mt-1">{wubiCode}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Field */}
        <div className="relative">
           <textarea
            value={userInput}
            onChange={handleInputChange}
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg resize-none"
            placeholder="点击此处开始练习..."
            disabled={stats.isFinished}
            autoFocus
          />
        </div>
      </div>

      {/* Results Overlay / Footer */}
      <div className="flex justify-center items-center space-x-4">
         <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          重置 / 下一篇
        </button>
      </div>

      {stats.isFinished && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">练习完成!</h3>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-emerald-600">{stats.wpm} <span className="text-lg text-gray-500">WPM</span></p>
              <p className="text-gray-500">准确率: {stats.accuracy}%</p>
            </div>
            <div className="pt-4 flex justify-center space-x-3">
              <button
                onClick={reset}
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none"
              >
                再练一次
              </button>
              <Link
                to="/stats"
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none"
              >
                查看统计
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticePage;
