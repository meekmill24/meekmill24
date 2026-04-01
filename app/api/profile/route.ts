import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.warn("API Unauthorized: No user session found in cookies.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log("API Fetching profile for authenticated user:", user.email);

    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 24h Reset Logic
    if (profile) {
      const lastReset = new Date(profile.last_reset_at || profile.created_at || new Date())
      const now = new Date()
      const diffMs = now.getTime() - lastReset.getTime()
      const diffHrs = diffMs / (1000 * 60 * 60)

      if (diffHrs >= 24) {
        profile.yesterday_profit = profile.profit || 0
        profile.profit = 0
        profile.completed_tasks_count = 0
        profile.last_reset_at = now.toISOString()
        
        await supabase.from('profiles').update({
          profit: 0,
          yesterday_profit: profile.yesterday_profit,
          completed_tasks_count: 0,
          last_reset_at: profile.last_reset_at
        }).eq('id', user.id)
      }
    }

    // Fetch referred users count
    const { count: referredUsersCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by', user.id)

    return NextResponse.json({
      profile: {
        ...(profile || {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0],
          display_name: user.user_metadata?.display_name || 'User',
          email: user.email,
          phone_number: user.user_metadata?.phone_number || '',
          level_id: null,
          wallet_balance: 0,
          total_earned: 0,
          completed_tasks_count: 0,
          referral_code: user.id.slice(0, 4).toUpperCase(),
          profit: 0,
          yesterday_profit: 0,
          freeze_balance: 0,
          total_volume: 0,
          completed_count: 0,
          current_set: 1,
          referral_earned: 0,
          salary_days_count: 0,
          last_work_day_at: null,
          pending_bundle: null,
          last_reset_at: new Date().toISOString()
        }),
        referred_users_count: referredUsersCount || 0
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { display_name, username, phone_number, withdrawal_wallet_address, avatar_url } = body

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ 
        display_name, 
        username, 
        phone_number,
        withdrawal_wallet_address,
        avatar_url
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
