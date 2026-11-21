import React from "react";
import { User, XCircle, Send } from "lucide-react";

export default function BuyerChatWidget({
  chatOpen,
  chatRecipient,
  setChatOpen,
  setChatRecipient,
  chatMessages,
  user,
  chatEndRef,
  handleSendChat,
  chatInput,
  setChatInput
}) {
  if (!chatOpen || !chatRecipient) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white/95 backdrop-blur-md shadow-[-10px_0_30px_rgba(0,0,0,0.08)] border-l border-slate-100 flex flex-col animate-slide-in">
      <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center shrink-0 text-left border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300">
              <User className="h-5 w-5" />
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] tracking-wider text-indigo-300 uppercase font-black font-mono">
              Secure Chat Session
            </span>
            <span className="text-sm font-bold truncate max-w-[180px]">
              {chatRecipient.name || "Agent"}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setChatOpen(false);
            setChatRecipient(null);
          }}
          className="text-slate-400 hover:text-white cursor-pointer border-0 bg-transparent outline-none transition-colors"
        >
          <XCircle className="h-6 w-6" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 flex flex-col">
        {chatMessages.map((msg, idx) => {
          const isMe = (msg.sender?._id || msg.sender) === (user?.id || user?._id);
          return (
            <div
              key={idx}
              className={`flex ${isMe ? "justify-end" : "justify-start"} items-start gap-2`}
            >
              <div
                className={`p-3.5 px-4 rounded-2xl max-w-[82%] text-xs font-medium hover:scale-[1.01] transition-transform duration-200 ${
                  isMe
                    ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-tr-none text-left shadow-[0_4px_12px_rgba(249,115,22,0.15)]"
                    : "bg-white text-slate-800 border border-slate-100 rounded-tl-none text-left shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                }`}
              >
                <p className="leading-relaxed break-words">{msg.message}</p>
                <span
                  className={`text-[8px] block mt-1.5 text-right font-mono ${isMe ? "text-orange-100" : "text-slate-400"}`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSendChat}
        className="p-4 border-t border-slate-100 bg-white flex gap-2.5 items-center shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type secure message..."
          className="flex-1 px-4 py-2.5 bg-slate-100/70 border border-transparent rounded-full text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder-slate-400"
        />
        <button
          type="submit"
          className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full transition-all shadow-[0_4px_10px_rgba(249,115,22,0.2)] hover:shadow-[0_4px_15px_rgba(249,115,22,0.35)] hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer border-none outline-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
