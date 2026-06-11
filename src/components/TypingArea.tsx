import React, { useRef, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';

interface TypingAreaProps {
  text: string;
  userInput: string;
  showHints: boolean;
  getWubiCode: (char: string) => string;
}

const TypingArea: React.FC<TypingAreaProps> = ({
  text,
  userInput,
  showHints,
  getWubiCode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll to keep the current character visible
  useEffect(() => {
    if (cursorRef.current && containerRef.current) {
      const container = containerRef.current;
      const cursor = cursorRef.current;
      const containerRect = container.getBoundingClientRect();
      const cursorRect = cursor.getBoundingClientRect();

      if (
        cursorRect.bottom > containerRect.bottom - 20 ||
        cursorRect.top < containerRect.top + 20
      ) {
        cursor.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [userInput]);

  // Break text into segments by character, with memoization
  const chars = useMemo(() => text.split(''), [text]);
  const cursorIndex = userInput.length;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-auto max-h-[60vh] p-4 rounded-lg',
        'bg-white dark:bg-gray-900',
        'border border-gray-200 dark:border-gray-700',
      )}
      aria-label="练习文本显示区域"
      role="region"
    >
      <div
        className={cn(
          'text-xl sm:text-2xl leading-[2.5] sm:leading-[2.8]',
          'font-["Noto_Serif_CJK_SC","Source_Han_Serif_SC","Noto_Serif_SC",serif]',
          'tracking-wide flex flex-wrap',
        )}
      >
        {chars.map((char, index) => {
          const isTyped = index < userInput.length;
          const isCurrent = index === cursorIndex;
          const isCorrect = isTyped && userInput[index] === char;
          const isIncorrect = isTyped && userInput[index] !== char;

          let charClass = '';
          let bgClass = '';

          if (isCorrect) {
            charClass = 'text-green-700 dark:text-green-400';
            bgClass = 'bg-green-100 dark:bg-green-900/30';
          } else if (isIncorrect) {
            charClass = 'text-red-600 dark:text-red-400';
            bgClass = 'bg-red-100 dark:bg-red-900/30';
          } else if (isCurrent) {
            charClass = 'text-gray-900 dark:text-gray-100';
            bgClass = 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400 dark:ring-blue-500';
          } else {
            // Untyped and not current
            charClass = 'text-gray-400 dark:text-gray-500';
          }

          const wubiCode = showHints ? getWubiCode(char) : '';

          return (
            <span
              key={index}
              ref={isCurrent ? cursorRef : undefined}
              className={cn(
                'relative inline-flex flex-col items-center mx-0.5 px-0.5 py-0.5 rounded transition-colors duration-150',
                bgClass,
                charClass,
              )}
              aria-label={`字符 ${char}${isCurrent ? ' (当前输入位置)' : ''}${isCorrect ? ' (正确)' : ''}${isIncorrect ? ' (错误)' : ''}`}
            >
              <span className="leading-none">{char}</span>
              {showHints && wubiCode && (
                <span className="block text-[0.55rem] sm:text-[0.6rem] leading-none mt-0.5 text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap">
                  {wubiCode}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TypingArea;
