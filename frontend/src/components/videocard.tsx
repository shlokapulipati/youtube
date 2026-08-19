import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function VideoCard({ video }: any) {
  const videoId = video?._id || "";
  const title = video?.videotitle;
  const channelTitle = video?.videochanel;
  const views = video?.views || 0;
  const publishedAt = video?.createdAt;

  return (
    <Link href={`/watch/${videoId}`} className="group">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
          <video 
            src={(video?.filepath?.startsWith("http") || video?.filepath?.startsWith("/video/")) 
              ? `${video.filepath}` 
              : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/${video?.filepath?.replace(/\\/g, '/')}`} 
            className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full pointer-events-none" 
            preload="metadata" crossOrigin="anonymous" 
          />
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
