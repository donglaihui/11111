
import React, { useState, useEffect } from 'react';
import { TabType, Message, UserProfile } from './types';
import TreeHole from './components/TreeHole';
import Profile from './components/Profile';
import TabBar from './components/TabBar';
import VIPModal from './components/VIPModal';
import { db, supabase } from './services/database';

const INITIAL_MESSAGES_SEED: Message[] = [
  { id: 'm1', to: '林晚秋', content: '那天在三号教学楼楼道里闻到的栀子花香，其实是你身上的味道对吧？我一直没敢问，怕你觉得我奇怪。', timestamp: Date.now() - 3600000, isPinned: true },
  { id: 'm2', to: '张煜恒', content: '听说你下周就要出国了，以后大概率不会再见。那张电影票根我一直夹在日记本里，祝你在伦敦一切顺利，记得带伞。', timestamp: Date.now() - 7200000, isPinned: false },
  { id: 'm3', to: '陈嘉一', content: '我们一起打过那么多次排位，你却从来不知道那个 ID 是我的小号。其实我只是想找个借口陪陪你，哪怕只是在游戏里。', timestamp: Date.now() - 14400000, isPinned: false },
  { id: 'm4', to: '苏小小', content: '你笑起来的时候，眼睛像月牙，我看了整整三年都没看够。今天在走廊擦肩而过，你还是那么好看。', timestamp: Date.now() - 86400000, isPinned: false },
  { id: 'm5', to: '王浩然', content: '今天在地铁站看到一个背影很像你的人，我下意识地追了两个车厢。停下来的时候才发现，我们已经断联整备整整一年了。', timestamp: Date.now() - 172800000, isPinned: false },
  { id: 'm6', to: '赵梓涵', content: '还记得那次在图书馆停电吗？你偷偷拉了我的手，我心跳快得要跳出嗓子眼了。可惜，那只是停电时的勇敢。', timestamp: Date.now() - 259200000, isPinned: false },
  { id: 'm7', to: '沈若冰', content: '我其实不太喜欢喝冰美式，但因为你总是点，我也就开始习惯了那个苦涩的味道。就像习惯想念你。', timestamp: Date.now() - 345600000, isPinned: false },
  { id: 'm8', to: '周宇轩', content: '祝你和她幸福。我是认真的，虽然写下这段话的时候，我眼眶是湿的。希望她能比我更懂你的小情绪。', timestamp: Date.now() - 432000000, isPinned: false },
  { id: 'm9', to: '许佳莹', content: '在这个快节奏的时代，我竟然还在想念那个用mp3听歌、和你分一半耳机的午后。那时候的时间好慢。', timestamp: Date.now() - 518400000, isPinned: false },
  { id: 'm10', to: '陆沉', content: '你是我的光，即使现在我依然处于黑暗，只要想到你曾经存在过，我就有了继续生活的勇气。谢谢你，陆沉。', timestamp: Date.now() - 604800000, isPinned: false }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hole');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = 'u_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', id);
    }
    return id;
  });

  const [user, setUser] = useState<UserProfile>({
    nickname: '树洞访客',
    avatar: 'https://picsum.photos/200',
    isVip: false
  });
  const [isVIPModalOpen, setIsVIPModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // 初始化并从 Supabase 加载数据
  useEffect(() => {
    const initData = async () => {
      try {
        if (!supabase) {
          console.warn('Supabase URL/Key 缺失，当前处于模拟模式（数据仅保存在本地）');
          const saved = localStorage.getItem('messages');
          setMessages(saved ? JSON.parse(saved) : INITIAL_MESSAGES_SEED);
          setLoading(false);
          return;
        }

        // 1. 获取消息
        let cloudMessages = await db.getMessages();
        
        // 2. 如果云端完全没数据，进行首次种子注入
        if (cloudMessages.length === 0) {
          await db.batchInsertMessages(INITIAL_MESSAGES_SEED);
          cloudMessages = await db.getMessages();
        }
        setMessages(cloudMessages);

        // 3. 获取个人资料
        const cloudProfile = await db.getProfile(deviceId);
        if (cloudProfile) {
          setUser(cloudProfile);
        } else {
          await db.upsertProfile(deviceId, user);
        }
      } catch (e) {
        console.error('Database connection failed:', e);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [deviceId]);

  const handleAddMessage = async (to: string, content: string) => {
    const newMessage = {
      to,
      content,
      timestamp: Date.now(),
      isPinned: false
    };

    try {
      if (supabase) {
        await db.addMessage(newMessage);
        const updated = await db.getMessages();
        setMessages(updated);
      } else {
        // Fallback to local
        const localMsg = { ...newMessage, id: Date.now().toString() };
        setMessages(prev => [localMsg, ...prev]);
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
          setMessages(prev => prev.filter(m => m.id !== confirmDeleteId));
        } else {
          setMessages(prev => prev.filter(m => m.id !== confirmDeleteId));
        }
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
    <div className="min-h-screen pb-24 flex flex-col items-center">
      <header className="w-full max-w-lg px-6 py-10 flex flex-col items-start gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {activeTab === 'hole' ? '树洞留言' : '个人中心'}
        </h1>
        <p className="text-[#86868B] text-sm">
          {activeTab === 'hole' ? '匿名倾听，温柔以待' : '管理您的个性化设置'}
        </p>
      </header>

      <main className="w-full max-w-lg px-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-[#0071E3]/20 border-t-[#0071E3] rounded-full animate-spin"></div>
            <p className="text-sm text-[#86868B]">正在连接树洞中...</p>
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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white/90 backdrop-blur-xl w-full max-w-[280px] rounded-[20px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">确认删除？</h3>
              <p className="text-sm text-[#1D1D1F]">此留言将被永久从云端移除。</p>
            </div>
            <div className="flex border-t border-gray-200">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 text-[#0071E3] font-medium border-r border-gray-200 active:bg-gray-100">取消</button>
              <button onClick={executeDelete} className="flex-1 py-3 text-[#FF3B30] font-semibold active:bg-gray-100">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
