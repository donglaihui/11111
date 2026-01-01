
import React, { useState, useMemo } from 'react';
import { Message } from '../types';

interface Props {
  messages: Message[];
  onAddMessage: (to: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onPinMessage: (id: string) => void;
  isVip: boolean;
}

const TreeHole: React.FC<Props> = ({ messages, onAddMessage, onDeleteMessage, onPinMessage, isVip }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [toName, setToName] = useState('');
  const [content, setContent] = useState('');

  // 搜索过滤逻辑
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return messages; // 默认显示全部
    return messages.filter(m => m.to.toLowerCase().includes(query));
  }, [messages, searchQuery]);

  // 如果没有搜索结果，则显示“推荐”列表（即全局最新留言）
  const showFallback = searchQuery.trim() !== '' && searchResults.length === 0;
  const displayMessages = showFallback ? messages.slice(0, 10) : searchResults;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toName || !content) return;
    onAddMessage(toName, content);
    setToName('');
    setContent('');
    setIsWriting(false);
    setSearchQuery(''); // 发布后回到首页流
  };

  return (
    <div className="space-y-6">
      {/* Action Selector */}
      <div className="flex gap-2 p-1 bg-[#E8E8ED] rounded-xl">
        <button 
          onClick={() => setIsWriting(false)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isWriting ? 'bg-white shadow-sm' : 'text-[#86868B]'}`}
        >
          查留言
        </button>
        <button 
          onClick={() => setIsWriting(true)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isWriting ? 'bg-white shadow-sm' : 'text-[#86868B]'}`}
        >
          写留言
        </button>
      </div>

      {isWriting ? (
        <form onSubmit={handleSubmit} className="apple-card p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1 ml-1">写给谁</label>
            <input 
              type="text" 
              placeholder="TA的名字..."
              value={toName}
              onChange={e => setToName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F5F7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1 ml-1">留言内容</label>
            <textarea 
              rows={4}
              placeholder="在这里输入你想说的话..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F5F7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all resize-none"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-[#0071E3] text-white font-medium rounded-xl hover:bg-[#0077ED] transition-colors shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            发布留言
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="输入名字搜索，不输入查看全部..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="space-y-4">
            {showFallback && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in duration-500">
                <p className="text-sm text-blue-600 font-medium text-center">
                  暂时没有给「{searchQuery}」的留言，来看看其他精彩瞬间：
                </p>
              </div>
            )}
            
            {!searchQuery.trim() && (
              <h3 className="text-xs font-semibold text-[#86868B] uppercase ml-1 mb-2 tracking-wider">最近更新</h3>
            )}

            {displayMessages.map(msg => (
              <div key={msg.id} className="apple-card p-5 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-1">
                {msg.isPinned && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-blue-50 text-[#0071E3] text-[10px] font-bold rounded-bl-xl uppercase">
                    已置顶
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-[#1D1D1F]">To: {msg.to}</h3>
                  <span className="text-[10px] text-[#86868B] font-medium">{new Date(msg.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-[#424245] leading-relaxed mb-4 text-sm md:text-base">{msg.content}</p>
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => onPinMessage(msg.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${msg.isPinned ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-gray-200'}`}
                  >
                    {msg.isPinned ? '取消置顶' : '置顶'}
                  </button>
                  <button 
                    onClick={() => onDeleteMessage(msg.id)}
                    className="px-3 py-1.5 bg-[#F5F5F7] text-[#FF3B30] rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}

            {displayMessages.length === 0 && !showFallback && (
              <div className="text-center py-20 text-[#86868B]">
                <div className="mb-4 opacity-20">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p>暂无留言数据</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeHole;
