'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function VideoDetail({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const [video, setVideo] = useState<any>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('加载视频失败:', error.message);
        return;
      }

      setVideo(data);
    };

    fetchVideo();
  }, [params.id]);

  if (!video) return <p style={{ color: 'white' }}>正在加载视频...</p>;

  return (
    <div style={{ padding: 32, color: 'white' }}>
      <h1>{video.title}</h1>
      <p>{video.description}</p>
      <video src={video.video_url} controls width="600" />
    </div>
  );
}
