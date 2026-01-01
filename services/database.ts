import { createClient } from '@supabase/supabase-js';
import { Message, UserProfile } from '../types';

/**
 * 💡 配置信息已填写完毕
 * 这里的 URL 和 Key 是你专属的云端数据库通行证。
 */
const SUPABASE_URL: string = 'https://figlppwzmunsmevxcvzh.supabase.co'; 
const SUPABASE_ANON_KEY: string = 'sb_publishable_Sf1NAudfPiva7SXjILN3Fw_r_cE1xn9';

// 只要这两个值存在且不为空，就初始化客户端
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

export const db = {
  async getMessages(): Promise<Message[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data.map(item => ({
      id: item.id,
      to: item.to,
      content: item.content,
      timestamp: item.timestamp,
      isPinned: item.is_pinned
    }));
  },

  async addMessage(msg: Omit<Message, 'id'>) {
    if (!supabase) return;
    const { error } = await supabase.from('messages').insert([{
      to: msg.to,
      content: msg.content,
      timestamp: msg.timestamp,
      is_pinned: msg.isPinned
    }]);
    if (error) throw error;
  },

  async deleteMessage(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
  },

  async togglePin(id: string, isPinned: boolean) {
    if (!supabase) return;
    const { error } = await supabase.from('messages').update({ is_pinned: isPinned }).eq('id', id);
    if (error) throw error;
  },

  async getProfile(deviceId: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', deviceId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? {
      nickname: data.nickname,
      avatar: data.avatar,
      isVip: data.is_vip
    } : null;
  },

  async upsertProfile(deviceId: string, profile: UserProfile) {
    if (!supabase) return;
    const { error } = await supabase.from('profiles').upsert({
      id: deviceId,
      nickname: profile.nickname,
      avatar: profile.avatar,
      is_vip: profile.isVip
    });
    if (error) throw error;
  },

  async batchInsertMessages(messages: any[]) {
    if (!supabase) return;
    const payload = messages.map(m => ({
      to: m.to,
      content: m.content,
      timestamp: m.timestamp,
      is_pinned: m.isPinned
    }));
    const { error } = await supabase.from('messages').insert(payload);
    if (error) throw error;
  }
};
