"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { ApiResponse, YouTubeVideo, SubmitYouTubeRequest } from "@/lib/types";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: "Menunggu", color: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
  processing: { label: "Memproses", color: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500 animate-pulse" },
  completed: { label: "Selesai", color: "bg-green-50 text-green-600 border-green-200", dot: "bg-green-500" },
  failed: { label: "Gagal", color: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-500" },
};

export default function WorkspacePage() {
  const { showToast } = useToast();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = () => {
    setLoading(true);
    api
      .get<ApiResponse<YouTubeVideo[]> | YouTubeVideo[]>("/api/youtube")
      .then((res) => {
        const data = Array.isArray(res) ? res : (res as ApiResponse<YouTubeVideo[]>).data;
        if (data && Array.isArray(data)) {
          setVideos(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post<ApiResponse<YouTubeVideo>>("/api/youtube/submit", {
        youtube_url: url,
      } as SubmitYouTubeRequest);

      if (res.status && res.data) {
        showToast("Video berhasil disubmit!", "success");
        setUrl("");
        setVideos((prev) => [res.data!, ...prev]);
      } else {
        showToast(res.message || "Gagal submit video", "error");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, "error");
      } else {
        showToast("Terjadi kesalahan", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Submit Video YouTube</h2>
        <p className="mb-5 text-sm text-slate-500">Tempel URL video YouTube untuk auto-clip</p>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all duration-300 focus:border-red-500/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="shrink-0 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Video Saya</h2>
          <span className="text-sm text-slate-400">{videos.length} video</span>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 aspect-video animate-pulse rounded-xl bg-slate-100" />
                <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
            <p className="mt-4 text-sm text-slate-400">Belum ada video. Submit URL YouTube untuk memulai.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => {
              const st = statusConfig[video.status] || statusConfig.pending;
              return (
                <Link
                  key={video.id}
                  href={`/workspace/video/${video.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="mb-3 aspect-video overflow-hidden rounded-xl bg-slate-100">
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-500/10 to-red-700/10">
                      <svg className="h-10 w-10 text-red-500/30" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-1.5 truncate text-sm font-semibold text-slate-900 group-hover:text-red-400">
                    {video.title || "Video Tanpa Judul"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${st.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    {video.segments && video.segments.length > 0 && (
                      <span className="text-xs text-slate-400">{video.segments.length} klip</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
