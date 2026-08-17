"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipForward,
  Loader2
} from "lucide-react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  onNext?: () => void;
  externalSyncState?: { isPlaying: boolean; time: number; timestamp: number } | null;
  onPlayPauseSync?: (isPlaying: boolean, time: number) => void;
}

const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds)) return "00:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default function VideoPlayer({ video, onNext, externalSyncState, onPlayPauseSync }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<"left" | "right" | null>(null);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (onPlayPauseSync) onPlayPauseSync(false, videoRef.current.currentTime);
    } else {
      videoRef.current.play();
      if (onPlayPauseSync) onPlayPauseSync(true, videoRef.current.currentTime);
    }
  }, [isPlaying, onPlayPauseSync]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRef.current.muted = newMutedState;
    if (!newMutedState && volume === 0) {
      setVolume(1);
      videoRef.current.volume = 1;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (onPlayPauseSync) onPlayPauseSync(isPlaying, time);
    }
  };

  useEffect(() => {
    if (externalSyncState && videoRef.current) {
      const timeDiff = Math.abs(videoRef.current.currentTime - externalSyncState.time);
      if (timeDiff > 2) {
        videoRef.current.currentTime = externalSyncState.time;
      }
      if (externalSyncState.isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(e => console.log(e));
      } else if (!externalSyncState.isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [externalSyncState]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowLeft", " ", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }
      
      switch(e.key) {
        case " ":
          togglePlay();
          break;
        case "ArrowRight":
          if (videoRef.current) videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
          break;
        case "ArrowLeft":
          if (videoRef.current) videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
          break;
        case "ArrowUp":
          setVolume(prev => {
            const next = Math.min(prev + 0.1, 1);
            if(videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case "ArrowDown":
          setVolume(prev => {
            const next = Math.max(prev - 0.1, 0);
            if(videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "m":
        case "M":
          toggleMute();
          break;
      }
    };
    
  }, [togglePlay, duration]);

  const [lastTapLeft, setLastTapLeft] = useState(0);
  const [lastTapRight, setLastTapRight] = useState(0);

  const handleTapLeft = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapLeft < 300) {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
      }
      setDoubleTapFeedback("left");
      setTimeout(() => setDoubleTapFeedback(null), 500);
      setLastTapLeft(0);
      togglePlay();
    } else {
      setLastTapLeft(now);
      togglePlay();
    }
  };

  const handleTapRight = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRight < 300) {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
      }
      setDoubleTapFeedback("right");
      setTimeout(() => setDoubleTapFeedback(null), 500);
      setLastTapRight(0);
      togglePlay();
    } else {
      setLastTapRight(now);
      togglePlay();
    }
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const normalizedPath = video?.filepath?.replace(/\\/g, '/');
  
  let videoSrc = video?.filepath?.startsWith("http") 
    ? video.filepath 
    : (video?.filepath?.startsWith("/video/") 
        ? video.filepath 
        : `${backendUrl}/${normalizedPath}`);

  if (videoSrc && !videoSrc.includes('#t=')) {
    videoSrc += '#t=0.1'; // Force browser to fetch the first frame as the cover page
  }

  return (
    <div 
      ref={containerRef}
      className={`relative group bg-black overflow-hidden flex justify-center items-center ${isFullscreen ? "w-screen h-screen" : "w-full aspect-video rounded-lg"}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setShowControls(true)}
      onClick={togglePlay}
    >
      <video
        key={video?._id}
        ref={videoRef}
        className="w-full h-full object-contain focus:outline-none"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Loader2 className="w-12 h-12 text-white animate-spin opacity-75" />
        </div>
      )}

      {doubleTapFeedback === "left" && (
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/20 flex flex-col items-center justify-center animate-pulse z-10 pointer-events-none">
          <span className="text-white font-bold text-lg">-10s</span>
        </div>
      )}
      {doubleTapFeedback === "right" && (
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/20 flex flex-col items-center justify-center animate-pulse z-10 pointer-events-none">
          <span className="text-white font-bold text-lg">+10s</span>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 bottom-16 flex z-10">
        <div className="flex-1" onClick={handleTapLeft} />
        <div className="flex-1" onClick={handleTapRight} />
      </div>

      <div 
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300 z-20 flex flex-col gap-2 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 group/progress w-full">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 cursor-pointer appearance-none rounded-full bg-white/30 hover:h-2 transition-all accent-red-600 focus:outline-none z-20"
            style={{
              background: `linear-gradient(to right, #dc2626 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)`
            }}
          />
        </div>

        <div className="flex items-center justify-between text-white mt-1">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className="hover:scale-110 transition hover:text-red-500 focus:outline-none"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            
            {onNext && (
              <button 
                onClick={onNext}
                className="hover:scale-110 transition hover:text-red-500 focus:outline-none group relative"
                title="Next Video"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>
            )}

            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="hover:text-red-500 transition focus:outline-none">
                {(isMuted || volume === 0) ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 h-1.5 cursor-pointer appearance-none rounded-full bg-white/30 accent-white focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #ffffff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)`
                }}
              />
            </div>

            <span className="text-sm font-medium tracking-wide font-mono hidden sm:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium tracking-wide font-mono sm:hidden block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button 
              onClick={toggleFullscreen}
              className="hover:scale-110 transition hover:text-red-500 focus:outline-none"
            >
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
