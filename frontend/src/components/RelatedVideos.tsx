import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface RelatedVideosProps {
  videos: Array<{
    _id: string;
    videotitle: string;
    videochanel: string;
    views: number;
    createdAt: string;
  }>;
}

export default function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div className="space-y-2">
      {videos.map((video) => {
        const isYouTube = !!(video as any).snippet;
        const videoId = isYouTube ? (typeof (video as any).id === 'string' ? (video as any).id : (video as any).id.videoId) : video._id;
        const title = isYouTube ? (video as any).snippet.title : video.videotitle;
        const channelTitle = isYouTube ? (video as any).snippet.channelTitle : video.videochanel;
        const views = isYouTube ? parseInt((video as any).statistics?.viewCount || "0") : (video.views || 0);
        const publishedAt = isYouTube ? ((video as any).snippet.publishedAt || (video as any).snippet.publishTime) : video.createdAt;
        const thumbnail = isYouTube ? ((video as any).snippet.thumbnails?.medium?.url || "") : "";

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const normalizedPath = (video as any)?.filepath?.replace(/\\/g, '/');
        let videoSrc = (video as any)?.filepath?.startsWith("http") 
          ? (video as any).filepath 
          : ((video as any)?.filepath?.startsWith("/video/") 
              ? (video as any).filepath 
              : `${backendUrl}/${normalizedPath}`);
        if (videoSrc && !videoSrc.includes('#t=')) {
          videoSrc += '#t=0.1';
        }

        return (
          <Link
            key={videoId || Math.random().toString()}
            href={`/watch/${videoId}`}
            className="flex gap-2 group"
          >
            <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden flex-shrink-0 bg-secondary">
              {isYouTube ? (
                <img src={thumbnail} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200" />
              ) : (
                <video
                  src={videoSrc}
                  className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full"
                  preload="metadata" crossOrigin="anonymous"
                />
              )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {title}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{channelTitle}</p>
            <p className="text-xs text-gray-600">
              {views.toLocaleString()} views •{" "}
              {publishedAt ? formatDistanceToNow(new Date(publishedAt)) : "Just now"} ago
            </p>
          </div>
          </Link>
        );
      })}
    </div>
  );
}
