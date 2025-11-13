'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VideoDetail({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [video, setVideo] = useState<any>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const videoId = params.id;

  useEffect(() => {
    const fetchVideo = async () => {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();
      setVideo(data);
    };
    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    const checkUnlock = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      setUserId(uid);
      if (!uid) return;

      const { data } = await supabase
        .from('user_unlocked_videos')
        .select('*')
        .eq('video_id', videoId)
        .eq('user_id', uid)
        .maybeSingle();

      setUnlocked(!!data);
    };
    checkUnlock();
  }, [videoId]);

  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ videoId }),
    });

    const { url } = await res.json();
    if (url) {
      window.location.href = url;
    }
  };

  if (!video) return <p>加载中...</p>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24 }}>{video.title}</h1>
      <p style={{ marginBottom: 20 }}>{video.description}</p>

      {unlocked || video.is_free ? (
        <video src={video.video_url} controls style={{ width: '100%', maxWidth: 800 }} />
      ) : (
        <div>
          <p style={{ fontStyle: 'italic' }}>
            试看 30 秒，完整视频需支付 ¥{video.price}
          </p>
          <video src={video.video_url} controls style={{ width: '100%', maxWidth: 800 }} />
          <button
            onClick={handleCheckout}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              fontSize: 16,
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: 4,
            }}
          >
            立即解锁
          </button>
        </div>
      )}
    </div>
  );
}
