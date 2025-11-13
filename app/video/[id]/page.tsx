'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function VideoPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('视频加载失败：', error.message);
      } else {
        setVideo(data);
      }

      setLoading(false);
    };

    loadVideo();
  }, [params.id]);

  if (loading) return <p style={{ color: 'white', padding: 32 }}>正在加载视频...</p>;
  if (!video) return <p style={{ color: 'red', padding: 32 }}>视频未找到</p>;

  return (
    <div style={{ padding: 32, color: 'white' }}>
      <h1>{video.title}</h1>
      <p>{video.description}</p>
      <video
        src={video.video_url}
        controls
        style={{ width: '100%', maxWidth: 800, marginTop: 20 }}
      />
    </div>
  );
}
