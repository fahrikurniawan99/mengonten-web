"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { ApiResponse, YouTubeVideo, VideoSegment } from "@/lib/types";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: "Menunggu", color: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
  processing: { label: "Memproses", color: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500 animate-pulse" },
  completed: { label: "Selesai", color: "bg-green-50 text-green-600 border-green-200", dot: "bg-green-500" },
  failed: { label: "Gagal", color: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-500" },
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoDetailPage({ params }: { params: Promise<{ video_id: string }> }) {
  const { video_id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVideo = () => {
    api
      .get<ApiResponse<YouTubeVideo>>(`/api/youtube/${video_id}`)
      .then((res) => {
        if (res.status && res.data) {
          setVideo(res.data);
        } else {
          showToast("Video tidak ditemukan", "error");
          router.push("/workspace");
        }
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          showToast(err.message, "error");
        }
        router.push("/workspace");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideo();
  }, [video_id]);

  useEffect(() => {
    if (!video || video.status !== "processing") return;
    const interval = setInterval(fetchVideo, 5000);
    return () => clearInterval(interval);
  }, [video?.status]);

  const handleDeleteSegment = async (segmentId: string) => {
    try {
      const res = await api.delete<ApiResponse<null>>(`/api/youtube/segments/${segmentId}`);
      if (res.status) {
        showToast("Klip berhasil dihapus", "success");
        setVideo((prev) =>
          prev ? { ...prev, segments: prev.segments?.filter((s) => s.id !== segmentId) } : null
        );
      }
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-8 w-8 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!video) return null;

  const st = statusConfig[video.status] || statusConfig.pending;
  const segments = video.segments || [];

  return (
    <div className="space-y-8">
      <Link href="/workspace" className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Kembali
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="truncate text-xl font-bold text-slate-900">{video.title || "Video Tanpa Judul"}</h1>
              <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            </div>
            <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="text-sm text-red-400 hover:text-red-300 break-all">{video.youtube_url}</a>
            {video.genre && <p className="mt-2 text-xs text-slate-400">Genre: {video.genre}</p>}
          </div>
        </div>

        {video.status === "processing" && (
          <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-400">Sedang diproses</p>
                <p className="text-xs text-blue-400/60">AI sedang menganalisis dan membuat klip. Halaman ini akan update otomatis.</p>
              </div>
            </div>
          </div>
        )}

        {video.status === "failed" && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">Gagal memproses video. Silakan coba submit ulang.</p>
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Generated Clips
            {segments.length > 0 && <span className="ml-2 text-sm font-normal text-slate-400">({segments.length})</span>}
          </h2>
        </div>

        {segments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
            {video.status === "completed" ? (
              <>
                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <p className="mt-4 text-sm text-slate-400">Tidak ada klip yang di-generate</p>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 text-sm text-slate-400">
                  {video.status === "processing" ? "Klip akan muncul setelah selesai diproses..." : "Belum ada klip"}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {segments.map((segment) => (
              <SegmentCard key={segment.id} segment={segment} onDelete={handleDeleteSegment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SegmentCard({ segment, onDelete }: { segment: VideoSegment; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    if (!confirm("Hapus klip ini?")) return;
    setDeleting(true);
    await onDelete(segment.id);
    setDeleting(false);
  };

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300">
      <div className="h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {segment.thumbnail_url ? (
          <img src={segment.thumbnail_url} alt={segment.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-6 w-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
            </svg>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-slate-900">{segment.title}</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          {formatDuration(segment.start_time)} — {formatDuration(segment.end_time)}
          {segment.duration > 0 && ` (${formatDuration(segment.duration)})`}
        </p>
      </div>

      <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        {segment.video_url && (
          <a href={segment.video_url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-green-600" title="Download">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </a>
        )}
        <button onClick={handleDelete} disabled={deleting} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-red-400 disabled:opacity-50" title="Hapus">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
