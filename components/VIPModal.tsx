
import React from 'react';
import { VIPModalProps } from '../types';

const VIPModal: React.FC<VIPModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">开通会员 开启特权</h2>
          <p className="text-[#86868B] text-sm mb-8">
            置顶与删除留言仅限会员使用。<br/>现在开通，尊享更纯净的树洞体验。
          </p>
          
          <div className="w-full space-y-3 mb-8">
            <div className="flex items-center gap-3 text-left">
              <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">✓</div>
              <span className="text-sm font-medium">置顶留言让更多人看到</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">✓</div>
              <span className="text-sm font-medium">永久删除不必要的回复</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">✓</div>
              <span className="text-sm font-medium">尊享专属金冠标识</span>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={onUpgrade}
              className="w-full py-4 bg-[#1D1D1F] text-white font-bold rounded-2xl hover:bg-black transition-colors"
            >
              ¥9 立即开通
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-[#F5F5F7] text-[#86868B] font-medium rounded-2xl hover:bg-gray-200 transition-colors"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VIPModal;
