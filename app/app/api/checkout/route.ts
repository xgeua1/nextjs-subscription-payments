import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { videoId } = await req.json();

  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .single();

  if (!user || !video) {
    return NextResponse.json({ error: 'Missing user or video' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price: video.stripe_price_id,
        quantity: 1
      }
    ],
    metadata: {
      user_id: user.id,
      video_id: videoId
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/video/${videoId}?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/video/${videoId}?canceled=1`
  });

  return NextResponse.json({ url: session.url });
}
