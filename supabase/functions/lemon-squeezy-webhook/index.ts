import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

    const body = await req.text()
    console.log('RAW WEBHOOK BODY:', body) 

    let event
    try { event = JSON.parse(body) } catch (e) { return new Response('Invalid JSON', { status: 400 }) }
    
    if (event?.meta?.event_name === 'order_created') {
      const email = event.data.attributes.user_email
      // Detect Plan from Product Name
      // The product name is usually in event.data.attributes.first_order_item.product_name
      // But Lemon Squeezy structure can vary. Let's look for clues in the whole object or first item.
      
      // Simpler approach: Check total price or variant name if available
      const total = event.data.attributes.total; // in cents
      let plan = 'pro'; // Default fallback
      let planName = 'Pro';

      // Price matching (cents)
      if (total === 1999) {
          plan = 'basic';
          planName = 'Basic';
      } else if (total === 5099) {
          plan = 'pro';
          planName = 'Pro';
      } else if (total === 9999) {
          plan = 'unlimited';
          planName = 'Unlimited';
      }
      
      console.log(`PROCESSING PAYMENT FOR: ${email} | PLAN: ${plan} (${total} cents)`)

      if (!email) return new Response('No email found', { status: 400 })

      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

      // Find Profile
      let userId = null;
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single()
      
      if (profile) {
          userId = profile.id;
      } else {
          const { data: { users } } = await supabase.auth.admin.listUsers()
          const authUser = users?.find(u => u.email === email)
          if (authUser) userId = authUser.id;
      }

      if (!userId) {
          console.error('USER NOT FOUND:', email)
          return new Response('User not found', { status: 404 })
      }

      // Update Profile
      await supabase.from('profiles').update({ plan_tier: plan }).eq('id', userId)
      console.log('SUCCESS! USER UPGRADED:', email)

      // SEND EMAIL NOTIFICATION
      if (RESEND_API_KEY) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Lumina <onboarding@resend.dev>',
                to: email,
                subject: `Welcome to Lumina ${planName}! 🌟`,
                html: `
                  <div style="font-family: sans-serif; text-align: center; color: #333;">
                    <h1 style="color: #E11D48;">Welcome to Lumina ${planName}!</h1>
                    <p>Your payment was successful and your account has been upgraded.</p>
                    <p>You now have access to all ${planName} features.</p>
                    <br/>
                    <a href="https://luminamemories.netlify.app/app" style="background: #E11D48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 99px; font-weight: bold;">Go to Dashboard</a>
                  </div>
                `
            }),
          })
          console.log('EMAIL SENT TO:', email)
      }

      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
    }

    return new Response('Event received but ignored', { status: 200 })

  } catch (err) {
    console.error('CRITICAL ERROR:', err)
    return new Response(`Server Error: ${err.message}`, { status: 500 })
  }
})