
import React from 'react';
import { TabType } from '../types';

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabBar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 apple-blur border-t border-gray-200 safe-bottom z-50">
      <div className="max-w-lg mx-auto flex h-[72px] px-8">
        <button 
          onClick={() => setActiveTab('hole')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'hole' ? 'text-[#0071E3]' : 'text-[#86868B]'}`}
        >
          <svg className="w-[26px] h-[26px]" fill={activeTab === 'hole' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">树</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'profile' ? 'text-[#0071E3]' : 'text-[#86868B]'}`}
        >
          <svg className="w-[26px] h-[26px]" fill={activeTab === 'profile' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">我的</span>
        </button>
      </div>
    </nav>
  );
};

export default TabBar;
