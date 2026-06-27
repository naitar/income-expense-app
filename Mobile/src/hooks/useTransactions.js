import { useCallback, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';

let localId = 1;
const localStore = [];

function isSchemaError(err) {
  const msg = (err?.message || err?.hint || '').toLowerCase();
  return msg.includes('schema cache') || (msg.includes('relation') && msg.includes('does not exist'));
}

export default function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const schemaBroken = useRef(false);

  const handleError = useCallback((err) => {
    if (isSchemaError(err)) {
      schemaBroken.current = true;
      setError(null);
      return true;
    }
    setError(err.message);
    return false;
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (schemaBroken.current) {
        setTransactions(localStore.filter((t) => t.user_id === user.id));
        return;
      }
      const { data, error: err } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (err) throw err;
      setTransactions(data || []);
      setError(null);
    } catch (err) {
      if (handleError(err)) {
        setTransactions(localStore.filter((t) => t.user_id === user.id));
      }
    } finally {
      setLoading(false);
    }
  }, [user, handleError]);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user, fetchTransactions]);

  const addTransaction = useCallback(async (data) => {
    if (!user) return null;
    try {
      if (schemaBroken.current) {
        const tx = { id: String(localId++), user_id: user.id, ...data, created_at: new Date().toISOString() };
        localStore.unshift(tx);
        setTransactions((prev) => [tx, ...prev]);
        return tx;
      }
      const { data: inserted, error: err } = await supabase
        .from('transactions').insert([{ ...data, user_id: user.id }]).select().single();
      if (err) throw err;
      setTransactions((prev) => [inserted, ...prev]);
      return inserted;
    } catch (err) {
      if (handleError(err)) {
        const tx = { id: String(localId++), user_id: user.id, ...data, created_at: new Date().toISOString() };
        localStore.unshift(tx);
        setTransactions((prev) => [tx, ...prev]);
        return tx;
      }
      return null;
    }
  }, [user, handleError]);

  const updateTransaction = useCallback(async (id, data) => {
    if (!user) return null;
    try {
      if (schemaBroken.current) {
        const idx = localStore.findIndex((t) => t.id === id);
        if (idx !== -1) localStore[idx] = { ...localStore[idx], ...data };
        setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
        return localStore[idx];
      }
      const { data: updated, error: err } = await supabase
        .from('transactions').update(data).eq('id', id).eq('user_id', user.id).select().single();
      if (err) throw err;
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [user, handleError]);

  const deleteTransaction = useCallback(async (id) => {
    if (!user) return false;
    try {
      if (schemaBroken.current) {
        const idx = localStore.findIndex((t) => t.id === id);
        if (idx !== -1) localStore.splice(idx, 1);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        return true;
      }
      const { error: err } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
      if (err) throw err;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }, [user, handleError]);

  return {
    transactions, loading, error, schemaMissing: schemaBroken.current,
    fetchTransactions, addTransaction, updateTransaction, deleteTransaction,
  };
}
