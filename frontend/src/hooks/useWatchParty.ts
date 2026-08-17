import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export function useWatchParty(roomId: string, onVideoSync?: (state: any) => void, syncStateFromVideo?: any) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<{ [id: string]: MediaStream }>({});
  const peerConnections = useRef<{ [id: string]: RTCPeerConnection }>({});
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messages, setMessages] = useState<{from: string, text: string}[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const s = io(backendUrl);
    setSocket(s);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        s.emit("join-room", roomId);
      })
      .catch(err => {
        console.error("Failed to get local stream", err);
        s.emit("join-room", roomId);
      });

    return () => {
      s.disconnect();
      localStream?.getTracks().forEach(t => t.stop());
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, [roomId]);

  useEffect(() => {
    if (!socket || !localStream) return;

    const createPeerConnection = (id: string, isInitiator: boolean) => {
      const pc = new RTCPeerConnection(rtcConfig);
      
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("new-ice-candidate", { to: id, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        setPeers(prev => ({ ...prev, [id]: event.streams[0] }));
      };

      if (isInitiator) {
        pc.createOffer().then(offer => {
          pc.setLocalDescription(offer);
          socket.emit("webrtc-offer", { to: id, offer });
        });
      }

      peerConnections.current[id] = pc;
      return pc;
    };

    socket.on("user-connected", (id: string) => {
      toast?.("A new user joined the party!");
      createPeerConnection(id, true);
    });

    socket.on("webrtc-offer", async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
      const pc = createPeerConnection(from, false);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc-answer", { to: from, answer });
    });

    socket.on("webrtc-answer", async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
      const pc = peerConnections.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("new-ice-candidate", async ({ candidate, from }: { candidate: RTCIceCandidateInit, from: string }) => {
      const pc = peerConnections.current[from];
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      }
    });

    socket.on("user-disconnected", (id: string) => {
      if (peerConnections.current[id]) {
        peerConnections.current[id].close();
        delete peerConnections.current[id];
      }
      setPeers(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast?.("A user left the party.");
    });

    socket.on("chat-message", ({ message, from }: { message: string, from: string }) => {
      setMessages(prev => [...prev, { from, text: message }]);
    });

    socket.on("video-sync", (state: any) => {
      if (onVideoSync) onVideoSync(state);
    });

    return () => {
      socket.off("user-connected");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("new-ice-candidate");
      socket.off("user-disconnected");
      socket.off("chat-message");
      socket.off("video-sync");
    };
  }, [socket, localStream]);

  useEffect(() => {
    if (socket && syncStateFromVideo) {
      socket.emit("video-sync", syncStateFromVideo);
    }
  }, [syncStateFromVideo, socket]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const stopScreenShare = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      setIsScreenSharing(false);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        screenTrack.onended = stopScreenShare;

        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const dStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true});
        const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const audioContext = new AudioContext();
        const dest = audioContext.createMediaStreamDestination();
        audioContext.createMediaStreamSource(dStream).connect(dest);
        audioContext.createMediaStreamSource(aStream).connect(dest);

        const tracks = [...dStream.getVideoTracks(), ...dest.stream.getAudioTracks()];
        const combinedStream = new MediaStream(tracks);
        const recorder = new MediaRecorder(combinedStream);
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        toast?.("Recording started");
      } catch (e) {
        console.error(e);
        toast?.("Failed to start recording.");
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      toast?.("Recording stopped and available to download.");
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = `watch-party-${roomId}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
    setRecordedChunks([]);
  };

  const sendMessage = (text: string) => {
    if (socket) {
      socket.emit("chat-message", text);
      setMessages(prev => [...prev, { from: "Me", text }]);
    }
  };

  const leaveCall = () => {
    window.location.href = window.location.pathname;
  };

  return {
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
  };
}
