import { useEffect, useMemo, useState } from "react";
import { HiChatAlt2, HiPaperAirplane } from "react-icons/hi";
import { chatsAPI } from "../../services/api/chats.api.js";
import { setChatLastSeen } from "../../utils/chatReadState.js";

const ChatPanel = ({ open, onClose, user, initialThreadId }) => {
  const userId = user?.id;
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(initialThreadId || "");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    const loadThreads = async () => {
      setLoadingThreads(true);
      try {
        const res = await chatsAPI.listThreads();
        const data = res.data?.data?.threads || res.data?.threads || [];
        const list = Array.isArray(data) ? data : [];
        setThreads(list);
        if (initialThreadId && list.some((item) => item.id === initialThreadId)) {
          setActiveId(initialThreadId);
        } else if (list.length) {
          setActiveId((current) => current || list[0].id);
        } else {
          setActiveId("");
        }
      } catch {
        setThreads([]);
      } finally {
        setLoadingThreads(false);
      }
    };
    loadThreads();
  }, [open, userId, initialThreadId]);

  useEffect(() => {
    if (!open || !userId || !threads.length) return;
    const latest = threads.reduce((max, thread) => {
      const ts = new Date(thread.lastMessage?.createdAt || 0).getTime();
      return ts > max ? ts : max;
    }, 0);
    if (latest > 0) {
      setChatLastSeen(userId, latest);
    }
  }, [open, userId, threads]);

  useEffect(() => {
    if (!open || !activeId) {
      setMessages([]);
      return;
    }
    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await chatsAPI.listMessages(activeId, { limit: 200 });
        const data = res.data?.data?.messages || res.data?.messages || [];
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [open, activeId]);

  const activeThread = useMemo(() => threads.find((item) => item.id === activeId) || null, [threads, activeId]);
  const counterpart = useMemo(() => {
    if (!activeThread || !userId) return null;
    return String(activeThread.user?.id) === String(userId) ? activeThread.guide : activeThread.user;
  }, [activeThread, userId]);

  const handleSend = async (eventObj) => {
    eventObj.preventDefault();
    if (!draft.trim() || !activeThread || !userId) return;
    try {
      const res = await chatsAPI.sendMessage(activeThread.id, { text: draft.trim() });
      const message = res.data?.data || res.data;
      if (message) {
        setMessages((prev) => [...prev, message]);
        setChatLastSeen(userId, message.createdAt);
        setThreads((prev) =>
          prev
            .map((thread) =>
              thread.id === activeThread.id
                ? {
                    ...thread,
                    lastMessage: {
                      text: message.text,
                      createdAt: message.createdAt,
                      senderId: message.senderId,
                      senderRole: message.senderRole,
                    },
                  }
                : thread
            )
            .sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0))
        );
      }
      setDraft("");
    } catch {
      // ignore
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Event chat</p>
            <h3 className="text-xl font-bold text-slate-900">Messages</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            Close
          </button>
        </div>
        {loadingThreads ? (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 text-sm text-slate-600">
            Loading chats...
          </div>
        ) : threads.length ? (
          <div className="mt-4 flex flex-col gap-4 md:flex-row">
            <aside className="md:w-1/3">
              <div className="space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
                {threads.map((thread) => {
                  const isActive = thread.id === activeId;
                  const isSelf = String(thread.user?.id) === String(userId);
                  const other = isSelf ? thread.guide : thread.user;
                  const last = thread.lastMessage;
                  return (
                    <button
                      key={thread.id}
                      onClick={() => setActiveId(thread.id)}
                      className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition ${
                        isActive ? "border-emerald-300 bg-white shadow-sm" : "border-transparent hover:bg-white"
                      }`}
                    >
                      <div className="text-xs font-semibold text-emerald-700">{thread.event?.title || "Event"}</div>
                      <div className="text-sm font-semibold text-slate-900">{other?.name || "Guest"}</div>
                      <div className="text-xs text-slate-500">{last?.text || "No messages yet"}</div>
                    </button>
                  );
                })}
              </div>
            </aside>
            <section className="flex min-h-[320px] flex-1 flex-col rounded-2xl border border-emerald-100 bg-white">
              <div className="flex items-center gap-2 border-b border-emerald-100 px-4 py-3">
                <HiChatAlt2 className="h-5 w-5 text-emerald-700" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{counterpart?.name || "Conversation"}</div>
                  <div className="text-xs text-slate-500">{activeThread?.event?.title}</div>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                {loadingMessages ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-xs text-slate-600">
                    Loading messages...
                  </div>
                ) : messages.length ? (
                  messages.map((msg) => {
                    const mine = String(msg.senderId) === String(userId);
                    return (
                      <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                            mine ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <div className="whitespace-pre-line">{msg.text}</div>
                          <div className={`mt-1 text-[10px] ${mine ? "text-emerald-100" : "text-slate-400"}`}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-xs text-slate-600">
                    No messages yet. Start the conversation.
                  </div>
                )}
              </div>
              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-emerald-100 px-4 py-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-emerald-100 px-4 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || !activeThread}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  <HiPaperAirplane className="h-4 w-4" />
                  Send
                </button>
              </form>
            </section>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 text-sm text-slate-600">
            No chats yet. Register for an event to start messaging your guide.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
