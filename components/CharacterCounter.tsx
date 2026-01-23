'use client';

import { useState, useEffect } from 'react';

interface Stats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
}

export default function CharacterCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<Stats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
  });

  useEffect(() => {
    calculateStats(text);
  }, [text]);

  const calculateStats = (content: string) => {
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;

    const words = content.trim() === ''
      ? 0
      : content.trim().split(/\s+/).length;

    const sentences = content.trim() === ''
      ? 0
      : content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    const paragraphs = content.trim() === ''
      ? 0
      : content.split(/\n\n+/).filter(p => p.trim().length > 0).length;

    const readingTime = Math.ceil(words / 200);

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
    });
  };

  const handleClear = () => {
    setText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        글자수 계산기
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            텍스트 입력
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="텍스트를 입력하세요..."
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     resize-y min-h-[200px]"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">총 글자수</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.characters.toLocaleString()}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">공백 제외</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.charactersNoSpaces.toLocaleString()}
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">단어 수</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.words.toLocaleString()}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">문장 수</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.sentences.toLocaleString()}
            </div>
          </div>

          <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">문단 수</div>
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {stats.paragraphs.toLocaleString()}
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">읽기 시간</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.readingTime}분
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400
                     text-white font-semibold rounded-lg transition-colors duration-200
                     shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            텍스트 복사
          </button>
          <button
            onClick={handleClear}
            disabled={!text}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400
                     text-white font-semibold rounded-lg transition-colors duration-200
                     shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            초기화
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            💡 팁
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• 읽기 시간은 분당 200단어 기준으로 계산됩니다.</li>
            <li>• 문단은 빈 줄로 구분됩니다.</li>
            <li>• 실시간으로 통계가 업데이트됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
