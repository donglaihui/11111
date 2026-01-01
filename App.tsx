
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
  const [isLocalMode, setIsLocalMode] = useState(false);
  
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
      // 容错机制：如果 8 秒还没加载完，可能网络有问题
      const timeoutId = setTimeout(() => {
        if (loading) {
          setError("连接超时，正在尝试本地模式...");
          switchToLocal();
        }
      }, 8000);

      const switchToLocal = () => {
        setIsLocalMode(true);
        const saved = localStorage.getItem('messages');
        setMessages(saved ? JSON.parse(saved) : INITIAL_MESSAGES_SEED);
        setLoading(false);
      };

      try {
        setLoading(true);
        setError(null);

        if (!supabase) {
          switchToLocal();
          return;
        }

        // 获取消息
        const cloudMessages = await db.getMessages();
        if (cloudMessages.length === 0) {
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
        setError("正在使用本地离线模式 (错误: " + (e.message || 'Unknown') + ")");
        switchToLocal();
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initData();
  }, [deviceId]);

  const handleAddMessage = async (to: string, content: string) => {
    const newMessage = { to, content, timestamp: Date.now(), isPinned: false };
    try {
      if (supabase && !isLocalMode) {
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
        if (supabase && !isLocalMode) {
          await db.deleteMessage(confirmDeleteId);
        }
        const next = messages.filter(m => m.id !== confirmDeleteId);
        setMessages(next);
        if (isLocalMode) localStorage.setItem('messages', JSON.stringify(next));
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
      if (supabase && !isLocalMode) {
        await db.togglePin(id, nextPinState);
        const updated = await db.getMessages();
        setMessages(updated);
      } else {
        const next = messages.map(m => m.id === id ? { ...m, isPinned: nextPinState } : m);
        setMessages(next);
        localStorage.setItem('messages', JSON.stringify(next));
      }
    } catch (e) {
      alert('操作失败');
    }
  };

  const handleUpgradeVip = async () => {
    const upgradedUser = { ...user, isVip: true };
    setUser(upgradedUser);
    setIsVIPModalOpen(false);
    if (supabase && !isLocalMode) {
      await db.upsertProfile(deviceId, upgradedUser);
    }
  };

  const handleUpdateUser = async (updated: UserProfile) => {
    setUser(updated);
    if (supabase && !isLocalMode) {
      await db.upsertProfile(deviceId, updated);
    }
  };

  // 基础 Shell 结构：始终渲染
  return (
    <div className="min-h-screen pb-24 flex flex-col items-center bg-[#F5F5F7] selection:bg-[#0071E3]/20">
      {/* 调试模式标识 */}
      <div className="w-full bg-[#1D1D1F] text-white text-[10px] py-1 px-4 flex justify-between items-center font-mono opacity-80 fixed top-0 z-[100]">
        <span>TreeHole Debug Mode</span>
        <span className={isLocalMode ? "text-yellow-400" : "text-green-400"}>
          {isLocalMode ? "LOCAL_MODE" : "CLOUD_SYNCED"}
        </span>
      </div>

      <header className="w-full max-w-lg px-8 pt-20 pb-8 flex flex-col items-start gap-1">
        <h1 className="text-[34px] font-bold tracking-tight text-[#1D1D1F]">
          {activeTab === 'hole' ? '树' : '我的'}
        </h1>
        <p className="text-[#86868B] text-sm font-medium">
          {activeTab === 'hole' ? '匿名倾听，温柔以待' : '管理您的设置'}
        </p>
      </header>

      {/* 仅内容区域根据状态切换 */}
      <main className="w-full max-w-lg px-5 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-6 h-6 border-2 border-[#0071E3]/20 border-t-[#0071E3] rounded-full animate-spin"></div>
            <p className="text-xs text-[#86868B] font-medium tracking-widest uppercase">正在连接数据库...</p>
          </div>
        ) : (
          <>
            {error && (
               <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-[11px] text-yellow-700 flex items-center gap-2">
                 <span className="flex-shrink-0 w-4 h-4 bg-yellow-200 rounded-full flex items-center justify-center text-[10px]">!</span>
                 {error}
               </div>
            )}
            
            {activeTab === 'hole' ? (
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
            )}
          </>
        )}
      </main>

      {/* 底部导航栏始终可见 */}
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
            <div className="flex border-t border-gray-100">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-4 text-[#0071E3] text-sm font-medium border-r border-gray-100">取消</button>
              <button onClick={executeDelete} className="flex-1 py-4 text-[#FF3B30] text-sm font-bold">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
