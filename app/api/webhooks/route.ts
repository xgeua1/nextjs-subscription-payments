import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

// 创建 Supabase 客户端（直接使用 service_role 密钥）
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 处理付款完成事件
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const user_id = session.metadata?.user_id;
    const video_id = session.metadata?.video_id;

    if (user_id && video_id) {
      const { error } = await supabase
        .from('user_unlocked_videos')
        .insert([{ user_id, video_id }]);

      if (error) {
        console.error('写入 Supabase 失败:', error.message);
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
      }

      console.log(`✅ 解锁成功: 用户 ${user_id} 视频 ${video_id}`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
