
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onShowVIPModal: () => void;
}

const Profile: React.FC<Props> = ({ user, onUpdateUser, onShowVIPModal }) => {
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState(user.nickname);
  const [dyLink, setDyLink] = useState('');
  const [showDyClaim, setShowDyClaim] = useState(false);
  const [showPay, setShowPay] = useState(false);

  const saveNickname = () => {
    onUpdateUser({ ...user, nickname: tempNickname });
    setIsEditingNickname(false);
  };

  const handleClaimFreeVip = () => {
    if (dyLink.toLowerCase().includes('douyin')) {
      onUpdateUser({ ...user, isVip: true });
      alert('验证成功！已赠送您 7 天会员。');
      setDyLink('');
      setShowDyClaim(false);
    } else {
      alert('无效链接，请确保包含抖音分享链接。');
    }
  };

  return (
    <div className="space-y-6">
      {/* User Info Header */}
      <div className="apple-card p-6 flex items-center gap-5">
        <div className="relative">
          <img src={user.avatar} className="w-20 h-20 rounded-full border-4 border-white shadow-sm object-cover" alt="avatar" />
          {user.isVip && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-1 rounded-full border-2 border-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1">
          {isEditingNickname ? (
            <div className="flex gap-2">
              <input 
                value={tempNickname} 
                onChange={e => setTempNickname(e.target.value)}
                className="bg-[#F5F5F7] px-2 py-1 rounded w-32 focus:outline-none focus:ring-1 focus:ring-blue-400"
                autoFocus
              />
              <button onClick={saveNickname} className="text-blue-500 text-sm font-medium">保存</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{user.nickname}</h2>
              <button onClick={() => setIsEditingNickname(true)}>
                <svg className="w-4 h-4 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
          <p className={`text-xs mt-1 ${user.isVip ? 'text-yellow-600 font-medium' : 'text-[#86868B]'}`}>
            {user.isVip ? '✨ 尊贵会员' : '普通用户'}
          </p>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-[#86868B] uppercase ml-1">会员特权</h3>
        
        {/* Free Claim */}
        <div className="apple-card p-4 overflow-hidden">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">免费领取会员</p>
              <p className="text-xs text-[#86868B] mt-1">发布抖音并复制链接即可领取</p>
            </div>
            <button 
              onClick={() => setShowDyClaim(!showDyClaim)}
              className="px-4 py-2 bg-[#F5F5F7] text-[#0071E3] text-sm font-medium rounded-full hover:bg-blue-50 transition-colors"
            >
              去领 🎁
            </button>
          </div>
          {showDyClaim && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs text-[#424245]">请在下方粘贴您发布的包含「树洞App」内容的抖音分享链接：</p>
              <input 
                type="text"
                placeholder="在此粘贴链接..."
                value={dyLink}
                onChange={e => setDyLink(e.target.value)}
                className="w-full px-4 py-2 bg-[#F5F5F7] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button 
                onClick={handleClaimFreeVip}
                className="w-full py-2 bg-[#1D1D1F] text-white rounded-lg text-sm font-medium"
              >
                立即验证并领取
              </button>
            </div>
          )}
        </div>

        {/* Paid Plan */}
        <div className="apple-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">开通会员</p>
              <p className="text-xs text-[#86868B] mt-1">解锁置顶与删除功能</p>
            </div>
            <button 
              onClick={() => setShowPay(!showPay)}
              className="px-4 py-2 bg-[#0071E3] text-white text-sm font-medium rounded-full hover:bg-[#0077ED] transition-colors shadow-sm"
            >
              开通
            </button>
          </div>
          {showPay && (
            <div className="mt-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={onShowVIPModal}
                className="p-4 border-2 border-[#0071E3] rounded-2xl flex flex-col items-center gap-1 bg-blue-50"
              >
                <span className="text-xs font-bold text-[#0071E3]">月度会员</span>
                <span className="text-xl font-bold">¥9</span>
                <span className="text-[10px] text-[#86868B]">/月</span>
              </button>
              <button 
                onClick={onShowVIPModal}
                className="p-4 border border-gray-200 rounded-2xl flex flex-col items-center gap-1"
              >
                <span className="text-xs font-bold text-gray-500">年度会员</span>
                <span className="text-xl font-bold">¥49</span>
                <span className="text-[10px] text-[#86868B]">/年</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="apple-card p-4 mt-8 opacity-60">
        <p className="text-xs text-center text-[#86868B]">版本 v1.0.4 • 简约而不简单</p>
      </div>
    </div>
  );
};

export default Profile;
