import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../types';
import { Calendar, ChevronRight, MessageSquare, Clock, Trash2, AlertCircle } from 'lucide-react';

interface HistoryProps {
  onSelectSession: (sessionId: string) => void;
}

export const History: React.FC<HistoryProps> = ({ onSelectSession }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'sessions'),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Session[];
      setSessions(sessionData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleClearAll = async () => {
    if (!user || isDeleting) return;
    setIsDeleting(true);
    try {
      const sessionsRef = collection(db, 'users', user.uid, 'sessions');
      const snapshot = await getDocs(sessionsRef);
      
      // Delete in batches of 500 (Firestore limit)
      const batch = writeBatch(db);
      
      for (const sessionDoc of snapshot.docs) {
        // Also need to delete subcollections (messages)
        const messagesRef = collection(db, 'users', user.uid, 'sessions', sessionDoc.id, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        messagesSnapshot.forEach((msgDoc) => {
          batch.delete(msgDoc.ref);
        });
        batch.delete(sessionDoc.ref);
      }
      
      await batch.commit();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear history. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl" />
          <div className="h-4 w-32 bg-slate-50 dark:bg-slate-900 rounded" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-2xl mx-auto mt-12 transition-colors duration-500">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-200 dark:text-slate-700 mx-auto mb-6">
          <Calendar size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No past sessions yet</h2>
        <p className="text-slate-500 dark:text-slate-400">Your journey starts with your first journal entry. Use the sidebar to begin a new journal.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 scrollbar-hide pb-52 md:pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Journal History</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review your past insights and personal growth.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full shrink-0">
              {sessions.length} Recorded Sessions
            </span>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors border border-rose-100 dark:border-rose-900/30 shrink-0"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
        </div>

        {showConfirm && (
          <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 flex-shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-rose-900 dark:text-rose-400">Are you absolutely sure?</h3>
              <p className="text-sm text-rose-700 dark:text-rose-500 mt-1">
                This will permanently delete all your journal history and conversations. This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleClearAll}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-3 pb-12">
          {sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-600 transition-colors shrink-0">
                  <MessageSquare size={18} className="sm:size-20" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{session.summary || 'Untitled journal'}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                      <Calendar size={12} />
                      {formatDate(session.createdAt)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                      <Clock size={12} />
                      {formatTime(session.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-200 dark:text-slate-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
