import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';

const DEFAULT_CATEGORIES = [
  { name: 'လစာ', type: 'income', color: '#22c55e' },
  { name: 'Freelance', type: 'income', color: '#16a34a' },
  { name: 'စီးပွားရေး', type: 'income', color: '#15803d' },
  { name: 'ရင်းနှီးမြှုပ်နှံမှု', type: 'income', color: '#0d9488' },
  { name: 'စားသောက်', type: 'expense', color: '#ef4444' },
  { name: 'သယ်ယူပို့ဆောင်ရေး', type: 'expense', color: '#f97316' },
  { name: 'စျေးဝယ်', type: 'expense', color: '#eab308' },
  { name: 'ဘေလ်များ', type: 'expense', color: '#6366f1' },
  { name: 'ကျန်းမာရေး', type: 'expense', color: '#ec4899' },
  { name: 'ဖျော်ဖြေရေး', type: 'expense', color: '#8b5cf6' },
  { name: 'ပညာရေး', type: 'expense', color: '#3b82f6' },
  { name: 'အခြား', type: 'expense', color: '#64748b' },
];

let localCatId = 1;
const localCategories = DEFAULT_CATEGORIES.map((c) => ({
  id: String(localCatId++), ...c,
}));

export default function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetched = useRef(false);

  const fetchCategories = useCallback(async () => {
    if (!user || fetched.current) return;
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('categories').select('*').eq('user_id', user.id).order('type').order('name');
      if (err) throw err;
      if (!data || data.length === 0) {
        const rows = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: user.id }));
        const { data: seeds, error: seedErr } = await supabase.from('categories').insert(rows).select();
        if (seedErr) throw seedErr;
        setCategories(seeds || []);
      } else {
        setCategories(data);
      }
      fetched.current = true;
    } catch {
      setCategories([...localCategories]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchCategories();
  }, [user, fetchCategories]);

  const addCategory = useCallback(async (data) => {
    try {
      const { data: inserted, error: err } = await supabase
        .from('categories').insert([{ ...data, user_id: user.id }]).select().single();
      if (err) throw err;
      setCategories((prev) => [...prev, inserted]);
      return inserted;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [user]);

  const updateCategory = useCallback(async (id, data) => {
    try {
      const { data: updated, error: err } = await supabase
        .from('categories').update(data).eq('id', id).eq('user_id', user.id).select().single();
      if (err) throw err;
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [user]);

  const deleteCategory = useCallback(async (id) => {
    try {
      const { error: err } = await supabase.from('categories').delete().eq('id', id).eq('user_id', user.id);
      if (err) throw err;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [user]);

  return { categories, loading, error, addCategory, updateCategory, deleteCategory, fetchCategories };
}
