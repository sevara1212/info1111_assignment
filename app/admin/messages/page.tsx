'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  fromName?: string;
  fromEmail?: string;
  userEmail?: string;
  userName?: string;
  to: string;
  message: string;
  read: boolean;
  sentAt?: any;
  recipient?: string;
}

export default function AdminMessagesPage() {
  const { userData } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [toEmail, setToEmail] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!userData) return;
    console.log('Admin userData:', userData);
    console.log('Admin role:', userData.role);
    console.log('Admin email:', userData.email);
    
    const q = query(collection(db, 'contact_messages'));
    const unsub = onSnapshot(q, (snap) => {
      console.log('All messages from Firestore:', snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      setMessages(
        snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Message))
          .filter(m => {
            console.log('Checking message:', m);
            console.log('Message to:', m.to, 'Message recipient:', m.recipient);
            
            // Show messages sent to admin's email
            if (m.to === userData.email) {
              console.log('Match: message to admin email');
              return true;
            }
            
            // Show messages sent to admin's role (exact match, case-insensitive)
            if (userData.role) {
              const roleLower = userData.role.toLowerCase();
              const toLower = m.to?.toLowerCase() || '';
              const recipientLower = m.recipient?.toLowerCase() || '';
              
              console.log('Comparing:', roleLower, 'with to:', toLower, 'and recipient:', recipientLower);
              
              if (toLower === roleLower || recipientLower === roleLower) {
                console.log('Match: message for admin role');
                return true;
              }
            }
            
            // Fallback: if email contains 'security' and message recipient is 'Security'
            if (userData.email.includes('security') && m.recipient?.toLowerCase() === 'security') {
              console.log('Match: security email fallback');
              return true;
            }
            
            console.log('No match for this message');
            return false;
          })
      );
      setLoading(false);
    });
    return () => unsub();
  }, [userData]);

  const unreadCount = messages.filter(m => !m.read).length;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail || !messageText) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        to: toEmail,
        fromEmail: userData.email,
        fromName: userData.name,
        message: messageText,
        read: false,
        sentAt: new Date(),
      });
      setMessageText('');
      setToEmail('');
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'contact_messages', messageId), {
        read: true
      });
    } catch (err) {
      console.error('Error marking message as read:', err);
      alert('Failed to mark message as read');
    }
  };

  const handleReply = async (originalMessage: Message) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      // Send reply to the user's email (userEmail field from original message)
      const recipientEmail = originalMessage.userEmail || originalMessage.fromEmail;
      await addDoc(collection(db, 'contact_messages'), {
        to: recipientEmail,
        fromEmail: userData.email,
        fromName: userData.name,
        message: replyText,
        read: false,
        sentAt: new Date(),
        replyTo: originalMessage.id,
        isAdminReply: true,
      });
      
      // Mark original message as read when replying
      await updateDoc(doc(db, 'contact_messages', originalMessage.id), {
        read: true
      });
      
      setReplyText('');
      setReplyingTo(null);
      alert('Reply sent successfully!');
    } catch (err) {
      console.error('Reply error:', err);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-[#18181b] min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-400">Messages</h1>
      <div className="mb-6 text-lg font-semibold text-green-300">{unreadCount} unread messages</div>
      
      {/* Send New Message Form */}
      <div className="bg-[#23272f] rounded-xl shadow-lg p-6 mb-8 border border-green-700">
        <h2 className="text-xl font-bold mb-4 text-green-300">Send New Message</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-200 mb-2">Recipient Email</label>
            <input
              type="email"
              placeholder="Enter recipient's email"
              className="w-full px-4 py-3 bg-[#1a1d23] border border-green-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={toEmail}
              onChange={e => setToEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-200 mb-2">Message</label>
            <textarea
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-[#1a1d23] border border-green-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-green-300 text-lg">Loading messages...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="bg-[#23272f] rounded-xl shadow-lg border border-green-700 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(m.userName || m.fromName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-green-200">
                          {m.userName || m.fromName || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-400">{m.userEmail || m.fromEmail}</div>
                      </div>
                    </div>
                    <div className="bg-[#1a1d23] rounded-lg p-4 mb-3">
                      <div className="text-white leading-relaxed">{m.message}</div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>To: {m.to}</span>
                      {m.sentAt && (
                        <span>Sent: {new Date(m.sentAt.seconds * 1000).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setReplyingTo(m.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Reply
                    </button>
                    <button 
                      onClick={() => handleMarkAsRead(m.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Mark as Read
                    </button>
                  </div>
                </div>
                
                {replyingTo === m.id && (
                  <div className="mt-6 p-4 bg-[#1a1d23] rounded-lg border border-green-600">
                    <div className="mb-3 font-medium text-green-300">
                      Reply to {m.userName || m.fromName || m.userEmail || m.fromEmail}:
                    </div>
                    <textarea
                      placeholder="Type your reply..."
                      className="w-full px-4 py-3 bg-[#23272f] border border-green-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
                      rows={3}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReply(m)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors font-medium"
                        disabled={sending || !replyText.trim()}
                      >
                        {sending ? 'Sending...' : 'Send Reply'}
                      </button>
                      <button
                        onClick={() => {setReplyingTo(null); setReplyText('');}}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No messages found</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 