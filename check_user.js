const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserBalances() {
    const { data, error } = await supabase
        .from('profiles')
        .select('username, wallet_balance, profit, referral_earned, total_earned, yesterday_profit, completed_count')
        .or('username.ilike.%meek%,username.eq.Agent')
    
    if (error) {
        console.error('Error fetching user:', error)
        return
    }

    if (!data || data.length === 0) {
        console.log('No users found matching the criteria.')
        return
    }

    console.log('--- USER BALANCES ---')
    data.forEach(user => {
        console.log(`User: ${user.username}`)
        console.log(`  Wallet Balance:  $${user.wallet_balance}`)
        console.log(`  Today Profit:    $${user.profit}`)
        console.log(`  Referral Earned: $${user.referral_earned}`)
        console.log(`  Total Earned:    $${user.total_earned}`)
        console.log(`  Past Profit:     $${user.yesterday_profit}`)
        console.log(`  Tasks Completed: ${user.completed_count}`)
        console.log('---------------------')
    })
}

checkUserBalances()
