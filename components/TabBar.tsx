
import React from 'react';
import { TabType } from '../types';

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabBar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 apple-blur border-t border-gray-200 safe-bottom">
      <div className="max-w-lg mx-auto flex h-16 px-6">
        <button 
          onClick={() => setActiveTab('hole')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'hole' ? 'text-[#0071E3]' : 'text-[#86868B]'}`}
        >
          <svg className="w-6 h-6" fill={activeTab === 'hole' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[10px] font-medium">树洞</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'profile' ? 'text-[#0071E3]' : 'text-[#86868B]'}`}
        >
          <svg className="w-6 h-6" fill={activeTab === 'profile' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">我的</span>
        </button>
      </div>
    </nav>
  );
};

export default TabBar;
