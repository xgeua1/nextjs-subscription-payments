'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function VideoPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const [video, setVideo] = useState<any>(null);

  useEffect(() => {
    const loadVideo = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('加载失败:', error.message);
      } else {
        console.log('视频数据:', data);
        setVideo(data);
      }
    };

    loadVideo();
  }, [params.id]);

  if (!video) return <p style={{ color: 'white' }}>正在加载视频...</p>;

  return (
    <div style={{ padding: 32, color: 'white' }}>
      <h1>{video.title}</h1>
      <p>{video.description}</p>
      <video
        src={video.video_url}
        controls
        style={{ width: '100%', maxWidth: 800 }}
      />
    </div>
  );
}
