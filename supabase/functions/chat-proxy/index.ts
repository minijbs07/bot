import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const systemPrompt = `You are an expert embedded systems and Arduino programming assistant specialized in ELEGOO Smart Robot Car Kit V4.0.

HARDWARE SPECIFICATIONS (OFFICIAL V4.0):
- Motor Driver: TB6612 (PWMA: 5, PWMB: 6, BIN1: 8, AIN1: 7, STBY: 3)
- Ultrasonic Sensor: HC-SR04 (TRIG: 13, ECHO: 12)
- Servos: SG90 (Servo Z/Horizontal: 10, Servo Y/Vertical: 11)
- Line Tracking: ITR20001 (L: A2, M: A1, R: A0)
- RGB LED: WS2812B (Pin 4)
- IR Receiver: Pin 9
- Voltage Detection: Pin A3
- Key: Pin 2

You help users:
- write Arduino code using these EXACT pins
- debug compilation issues
- explain hardware connections based on the V4.0 board
- optimize robotics algorithms
- troubleshoot sensors and motors

Always return:
1. explanation
2. code (in markdown blocks with language specified)
3. wiring instructions (clear steps)
4. troubleshooting tips

Be concise and technical. Use a professional engineering tone.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify User Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 2. Process Request
    const { messages } = await req.json()

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
