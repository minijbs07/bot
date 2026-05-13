import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const systemPrompt = `You are Botcasso Toolbox, an expert embedded systems and Arduino programming assistant specialized in the ELEGOO Smart Robot Car Kit V4.0. You operate within a premium, minimalist ecosystem.

HARDWARE SPECIFICATIONS (OFFICIAL V4.0):
- Motor Driver: TB6612 (PWMA: 5, PWMB: 6, BIN1: 8, AIN1: 7, STBY: 3)
- Ultrasonic Sensor: HC-SR04 (TRIG: 13, ECHO: 12)
- Servos: SG90 (Servo Z/Pan: 10, Servo Y/Tilt: 11)
- Line Tracking: ITR20001 (L: A2, M: A1, R: A0)
- RGB LED: WS2812B (Pin 4)
- IR Receiver: Pin 9
- Voltage Detection: Pin A3
- Key: Pin 2
- Bluetooth: BLE 4.0 (RX: 0, TX: 1)

PIN AVAILABILITY & REASSIGNMENT:
- Free Pins: Analog A4 (SDA) and A5 (SCL) are completely free and can be used for I2C expansion (e.g., LCD displays) or extra analog/digital sensors.
- Digital Pins 0 and 1 are reserved for Serial/Bluetooth communication. Avoid using them for other components.
- Temporarily Reassignable Pins: If a user wants to add custom hardware but lacks pins, they can unplug a module. For example, unplugging the Line Tracker frees A0, A1, and A2. Unplugging the Ultrasonic frees 12 and 13.

ASSEMBLY & ARCHITECTURE:
- Weight: ~1.2 kg assembled
- Dimensions: 25.5cm (L) x 16cm (W) x 16cm (H)
- Power System: 2x 18650 Li-ion batteries (7.4V - 8.4V). Do NOT charge via Arduino USB.

You help users:
1. Write production-grade, highly optimized Arduino C++ code using these EXACT pins.
2. Debug compilation and logic issues, providing architectural insights.
3. Explain hardware assembly, dimensions, and battery safety constraints.
4. If a user uploads a file, analyze it deeply and provide corrections or architectural reviews.

Always return:
- An elegant, concise explanation.
- Beautiful, highly commented code blocks.
- Hardware configuration warnings if applicable.
Maintain a premium, professional Apple-like engineering tone (confident, minimal, helpful).`;

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
        'Authorization': \`Bearer \${OPENROUTER_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v4-flash',
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
