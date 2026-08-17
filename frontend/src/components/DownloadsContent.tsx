import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Download, MoreVertical, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function DownloadsContent() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadDownloads();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDownloads = async () => {
    try {
      const res = await axiosInstance.get(`/download/${user?._id}`);
      const validVideos = (res.data || []).filter((item: any) => item.videoid != null);
      setDownloads(validVideos);
    } catch (error) {
      console.error("Error loading downloads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDownload = async (downloadId: string) => {
    try {
      await axiosInstance.delete(`/download/remove/${downloadId}`);
      setDownloads(downloads.filter((item) => item._id !== downloadId));
    } catch (error) {
      console.error("Error removing download:", error);
    }
  };

  if (loading) {
    return <div>Loading downloads...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Download className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Saved Downloads</h2>
        <p className="text-gray-600">
          Sign in to access your downloaded videos.
        </p>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="text-center py-12">
        <Download className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No videos downloaded</h2>
        <p className="text-gray-600">
          Videos you download will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{downloads.length} downloaded videos</p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-blue-600">Plan: {user.plan || "Free"}</p>
          {user.plan !== "Gold" && (
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="text-xs h-7">
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {downloads.map((item) => {
          if (!item.videoid) return null;
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
          const normalizedPath = item.videoid.filepath?.replace(/\\/g, '/');
          let videoSrc = item.videoid.filepath?.startsWith("http") 
            ? item.videoid.filepath 
            : (item.videoid.filepath?.startsWith("/video/") 
                ? item.videoid.filepath 
                : `${backendUrl}/${normalizedPath}`);
          if (videoSrc && !videoSrc.includes('#t=')) {
            videoSrc += '#t=0.1';
          }
          return (
          <div key={item._id} className="flex gap-4 group">
            <Link href={`/watch/${item.videoid._id}`} className="flex-shrink-0">
              <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                <video
                  src={videoSrc}
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  preload="metadata"
                />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/watch/${item.videoid._id}`}>
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
                  {item.videoid.videotitle}
                </h3>
              </Link>
              <p className="text-sm text-gray-600">
                {item.videoid.videochanel}
              </p>
              <p className="text-sm text-gray-600">
                {item.videoid.views?.toLocaleString()} views •{" "}
                {item.videoid.createdAt && formatDistanceToNow(new Date(item.videoid.createdAt))} ago
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Download className="w-3 h-3" /> Downloaded {item.downloadedAt && formatDistanceToNow(new Date(item.downloadedAt))} ago
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleRemoveDownload(item._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from downloads
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )})}
      </div>
    </div>
  );
}
