"use clinet";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

const videos = "/video/vdo.mp4";
export default function VideoCard({ video }: any) {
  const isYouTube = !!video?.snippet;
  
  const videoId = isYouTube ? (typeof video.id === 'string' ? video.id : video.id.videoId) : (video?._id || "");
  const title = isYouTube ? video.snippet?.title : video?.videotitle;
  const channelTitle = isYouTube ? video.snippet?.channelTitle : video?.videochanel;
  const views = isYouTube ? (video.statistics?.viewCount || 0) : video?.views;
  const publishedAt = isYouTube ? video.snippet?.publishedAt || video.snippet?.publishTime : video?.createdAt;
  const thumbnail = isYouTube 
    ? (video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url) 
    : "";

  return (
    <Link href={`/watch/${videoId}`} className="group">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
          {isYouTube ? (
            <img src={thumbnail} alt={title} className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full" />
          ) : (
            <video 
              src={(video?.filepath?.startsWith("http") || video?.filepath?.startsWith("/video/")) 
                ? `${video.filepath}` 
                : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/${video?.filepath?.replace(/\\/g, '/')}`} 
              className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full pointer-events-none" 
              preload="metadata" crossOrigin="anonymous" 
            />
          )}
          {isYouTube && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
              API Result
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback>{channelTitle?.[0] || 'Y'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{channelTitle}</p>
            <p className="text-sm text-gray-600">
              {Number(views).toLocaleString()} views •{" "}
              {publishedAt ? formatDistanceToNow(new Date(publishedAt)) : "Just now"} ago
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
