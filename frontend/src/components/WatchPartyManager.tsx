"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, MonitorUp, PhoneOff, MessageSquare, CircleDot, Download, Users } from "lucide-react";
import { useWatchParty } from "../hooks/useWatchParty";

interface WatchPartyManagerProps {
  roomId: string;
  onVideoSync?: (state: any) => void;
  syncStateFromVideo?: any;
}

export default function WatchPartyManager({ roomId, onVideoSync, syncStateFromVideo }: WatchPartyManagerProps) {
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    peers,
    isMuted,
    isVideoOff,
    isScreenSharing,
    messages,
    isRecording,
    recordedChunks,
    localVideoRef,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    toggleRecording,
    downloadRecording,
    sendMessage,
    leaveCall
  } = useWatchParty(roomId, onVideoSync, syncStateFromVideo);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput("");
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden flex flex-col border border-gray-800 shadow-2xl h-full pb-4">
      <div className="p-4 bg-gray-950 flex justify-between items-center border-b border-gray-800">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" /> Watch Party
        </h3>
        <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{roomId}</span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row relative">
        <div className="flex-1 p-4 grid grid-cols-2 gap-4 auto-rows-max overflow-y-auto min-h-[300px]">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : ''} ${!isScreenSharing && 'scale-x-[-1]'}`} />
            {isVideoOff && <div className="absolute inset-0 flex items-center justify-center"><VideoOff className="w-8 h-8 text-white/50" /></div>}
            <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">You</span>
            {isMuted && <span className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white"><MicOff className="w-3 h-3" /></span>}
          </div>
          
          {Object.entries(peers).map(([id, stream]) => (
            <div key={id} className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <VideoRenderer stream={stream} />
              <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white truncate max-w-[80%]">Peer {id.substring(0,4)}</span>
            </div>
          ))}
        </div>

        {showChat && (
          <div className="w-full sm:w-64 bg-gray-950 border-l border-gray-800 flex flex-col absolute inset-y-0 right-0 sm:relative z-10">
            <div className="p-3 border-b border-gray-800 flex justify-between items-center text-white">
              <span className="text-sm font-semibold">Live Chat</span>
              <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.from === "Me" ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-gray-500 mb-1">{m.from === "Me" ? "You" : `User ${m.from.substring(0,4)}`}</span>
                  <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${m.from === "Me" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 flex gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type..." className="flex-1 bg-gray-800 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </form>
          </div>
        )}
      </div>

      <div className="px-4 pt-2 flex items-center justify-center gap-4">
        <button onClick={toggleMute} className={`p-3 rounded-full transition ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={toggleVideo} className={`p-3 rounded-full transition ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
        </button>
        <button onClick={toggleScreenShare} className={`p-3 rounded-full transition ${isScreenSharing ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
          <MonitorUp className="w-5 h-5" />
        </button>
        <button onClick={toggleRecording} className={`p-3 rounded-full transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
          <CircleDot className="w-5 h-5" />
        </button>
        {recordedChunks.length > 0 && !isRecording && (
          <button onClick={downloadRecording} className="p-3 rounded-full transition bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">
            <Download className="w-5 h-5" />
          </button>
        )}
        <button onClick={() => setShowChat(!showChat)} className={`p-3 rounded-full transition ${showChat ? 'bg-blue-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
          <MessageSquare className="w-5 h-5" />
        </button>
        <button onClick={leaveCall} className="p-3 rounded-full transition bg-red-600 text-white hover:bg-red-700 ml-4">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function VideoRenderer({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />;
}
