import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    const { phone_number, app_user_id } = await req.json()
    
    if (!phone_number) {
      return new Response(
        JSON.stringify({ error: 'Missing phone number' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create web database client with service role key for full access
    const webSupabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const webSupabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    const webSupabase = createClient(webSupabaseUrl, webSupabaseServiceKey)
    
    console.log(`Checking web purchase for phone: ${phone_number}`)
    
    // Check for web purchase using the RPC function
    const { data: purchase, error: rpcError } = await webSupabase.rpc('check_web_purchase_by_phone', {
      p_phone_number: phone_number
    })
    
    if (rpcError) {
      console.error('Error calling check_web_purchase_by_phone:', rpcError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to check web purchase',
          error: rpcError.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    if (purchase?.success && app_user_id) {
      console.log(`Found web purchase for user: ${purchase.user_id}`)
      
      // Create link between accounts
      const { error: linkError } = await webSupabase
        .from('auth_links')
        .insert({
          web_user_id: purchase.user_id,
          supabase_user_id: app_user_id,
          phone_number: phone_number,
          linked_via: 'phone',
          metadata: {
            linked_from: 'mobile_app',
            linked_at: new Date().toISOString()
          }
        })
        .select()
        .single()
      
      if (linkError) {
        // Check if it's a duplicate key error (already linked)
        if (linkError.code === '23505') {
          console.log('Accounts already linked')
        } else {
          console.error('Error linking accounts:', linkError)
        }
      } else {
        console.log('Successfully linked accounts')
      }
    }
    
    // Return the purchase data or not found message
    const response = purchase || { 
      success: false, 
      message: 'No active subscription found for this phone number' 
    }
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in verify-web-purchase function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: 'Internal server error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})