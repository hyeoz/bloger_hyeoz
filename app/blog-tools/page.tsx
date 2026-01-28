'use client';

import { useState } from 'react';
import WatermarkEditor from '@/components/WatermarkEditor';
import CharacterCounter from '@/components/CharacterCounter';
import BlogTopicRecommendation from '@/components/BlogTopicRecommendation';
import TrendingKeywords from '@/components/TrendingKeywords';

type TabType = 'trends' | 'topics' | 'counter' | 'watermark';

export default function BlogToolsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('trends');

  const tabs = [
    { id: 'trends' as TabType, label: '트렌드 키워드', icon: '📈' },
    { id: 'topics' as TabType, label: 'AI 주제 추천', icon: '🤖' },
    { id: 'counter' as TabType, label: '글자수 계산기', icon: '📝' },
    { id: 'watermark' as TabType, label: '워터마크', icon: '🖼️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            블로그 작성 도구
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            블로그 글 작성에 필요한 모든 도구를 한 곳에서
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md hover:scale-102'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="transition-all duration-300">
          {activeTab === 'trends' && <TrendingKeywords />}
          {activeTab === 'topics' && <BlogTopicRecommendation />}
          {activeTab === 'counter' && <CharacterCounter />}
          {activeTab === 'watermark' && <WatermarkEditor />}
        </div>
      </div>
    </div>
  );
}
