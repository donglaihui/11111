
import { createClient } from '@supabase/supabase-js';
import { Message, UserProfile } from '../types';

const SUPABASE_URL: string = 'https://figlppwzmunsmevxcvzh.supabase.co'; 
const SUPABASE_ANON_KEY: string = 'sb_publishable_Sf1NAudfPiva7SXjILN3Fw_r_cE1xn9';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

export const db = {
  async getMessages(): Promise<Message[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(item => ({
        id: String(item.id),
        to: item.to || '未知',
        content: item.content || '',
        timestamp: Number(item.timestamp),
        isPinned: !!item.is_pinned
      }));
    } catch (e) {
      console.error('Database getMessages error:', e);
      throw e; // 抛出让 App.tsx 捕获并切入本地模式
    }
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
    // 自动兼容 UUID 或数字
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
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', deviceId).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // 正常情况：查无此人
        throw error;
      }
      return data ? {
        nickname: data.nickname,
        avatar: data.avatar,
        isVip: !!data.is_vip
      } : null;
    } catch (e) {
      console.warn('Database getProfile error:', e);
      return null; // 个人资料失败不应阻塞整个应用
    }
  },

  async upsertProfile(deviceId: string, profile: UserProfile) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: deviceId,
        nickname: profile.nickname,
        avatar: profile.avatar,
        is_vip: profile.isVip
      }, { onConflict: 'id' });
      if (error) throw error;
    } catch (e) {
      console.error('Upsert profile failed:', e);
    }
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
    if (error) console.error('Batch insert failed:', error);
  }
};
