
import React, { useState, useEffect } from 'react';
import { TabType, Message, UserProfile } from './types';
import TreeHole from './components/TreeHole';
import Profile from './components/Profile';
import TabBar from './components/TabBar';
import VIPModal from './components/VIPModal';
import { db, supabase } from './services/database';

const INITIAL_MESSAGES_SEED: Message[] = [
  { id: 'm1', to: '林晚秋', content: '那天在三号教学楼楼道里闻到的栀子花香，其实是你身上的味道对吧？', timestamp: Date.now() - 3600000, isPinned: true },
  { id: 'm2', to: '张煜恒', content: '祝你在伦敦一切顺利，记得带伞。', timestamp: Date.now() - 7200000, isPinned: false }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hole');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = 'u_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', id);
    }
    return id;
  });

  const [user, setUser] = useState<UserProfile>({
    nickname: '树访客',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + deviceId,
    isVip: false
  });
  
  const [isVIPModalOpen, setIsVIPModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!supabase) {
          console.warn('正在以本地模式运行');
          const saved = localStorage.getItem('messages');
          setMessages(saved ? JSON.parse(saved) : INITIAL_MESSAGES_SEED);
          setLoading(false);
          return;
        }

        // 获取消息
        const cloudMessages = await db.getMessages();
        if (cloudMessages.length === 0) {
          // 仅在完全为空时注入种子
          await db.batchInsertMessages(INITIAL_MESSAGES_SEED);
          const reFetched = await db.getMessages();
          setMessages(reFetched);
        } else {
          setMessages(cloudMessages);
        }

        // 获取个人资料
        const cloudProfile = await db.getProfile(deviceId);
        if (cloudProfile) {
          setUser(cloudProfile);
        } else {
          await db.upsertProfile(deviceId, user);
        }
      } catch (e: any) {
        console.error('初始化失败:', e);
        setError(e.message || '连接服务器失败，请稍后刷新。');
        // 即使出错也尝试加载本地缓存
        const saved = localStorage.getItem('messages');
        if (saved) setMessages(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [deviceId]);

  const handleAddMessage = async (to: string, content: string) => {
    const newMessage = { to, content, timestamp: Date.now(), isPinned: false };
    try {
      if (supabase) {
        await db.addMessage(newMessage);
        const updated = await db.getMessages();
        setMessages(updated);
      } else {
        const localMsg = { ...newMessage, id: Date.now().toString() };
        const next = [localMsg, ...messages];
        setMessages(next);
        localStorage.setItem('messages', JSON.stringify(next));
      }
    } catch (e) {
      alert('发布失败，请检查网络');
    }
  };

  const requestDelete = (id: string) => {
    if (!user.isVip) {
      setIsVIPModalOpen(true);
      return;
    }
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (confirmDeleteId) {
      try {
        if (supabase) {
          await db.deleteMessage(confirmDeleteId);
        }
        setMessages(prev => prev.filter(m => m.id !== confirmDeleteId));
      } catch (e) {
        alert('删除失败');
      }
      setConfirmDeleteId(null);
    }
  };

  const handlePinMessage = async (id: string) => {
    if (!user.isVip) {
      setIsVIPModalOpen(true);
      return;
    }
    const target = messages.find(m => m.id === id);
    if (!target) return;

    try {
      const nextPinState = !target.isPinned;
      if (supabase) {
        await db.togglePin(id, nextPinState);
        const updated = await db.getMessages();
        setMessages(updated);
      } else {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isPinned: nextPinState } : m));
      }
    } catch (e) {
      alert('操作失败');
    }
  };

  const handleUpgradeVip = async () => {
    const upgradedUser = { ...user, isVip: true };
    setUser(upgradedUser);
    setIsVIPModalOpen(false);
    if (supabase) {
      await db.upsertProfile(deviceId, upgradedUser);
    }
  };

  const handleUpdateUser = async (updated: UserProfile) => {
    setUser(updated);
    if (supabase) {
      await db.upsertProfile(deviceId, updated);
    }
  };

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center bg-[#F5F5F7]">
      <header className="w-full max-w-lg px-8 pt-16 pb-8 flex flex-col items-start gap-1">
        <h1 className="text-[34px] font-bold tracking-tight text-[#1D1D1F]">
          {activeTab === 'hole' ? '树' : '我的'}
        </h1>
        <p className="text-[#86868B] text-sm font-medium">
          {activeTab === 'hole' ? '匿名倾听，温柔以待' : '管理您的设置'}
        </p>
      </header>

      <main className="w-full max-w-lg px-5 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-6 h-6 border-2 border-[#0071E3]/20 border-t-[#0071E3] rounded-full animate-spin"></div>
            <p className="text-xs text-[#86868B] font-medium tracking-widest uppercase">正在连接数据库...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">!</div>
            <p className="text-sm text-red-500 px-10">{error}</p>
            <button onClick={() => window.location.reload()} className="text-[#0071E3] text-sm font-bold">点击重试</button>
          </div>
        ) : (
          activeTab === 'hole' ? (
            <TreeHole 
              messages={messages} 
              onAddMessage={handleAddMessage}
              onDeleteMessage={requestDelete}
              onPinMessage={handlePinMessage}
              isVip={user.isVip}
            />
          ) : (
            <Profile 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onShowVIPModal={() => setIsVIPModalOpen(true)}
            />
          )
        )}
      </main>

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <VIPModal isOpen={isVIPModalOpen} onClose={() => setIsVIPModalOpen(false)} onUpgrade={handleUpgradeVip} />

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white/90 backdrop-blur-xl w-full max-w-[270px] rounded-[22px] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold mb-1">确认删除？</h3>
              <p className="text-xs text-[#86868B]">此操作无法撤销。</p>
            </div>
            <div className="flex border-t border-gray-200">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-4 text-[#0071E3] text-sm font-medium border-r border-gray-200">取消</button>
              <button onClick={executeDelete} className="flex-1 py-4 text-[#FF3B30] text-sm font-bold">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
