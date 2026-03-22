import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function resetUserPassword(email: string, newPassword: string) {
    console.log(`Searching for identity associated with ${email}...`)
    
    // First, find the user ID from the profiles table (safest way to get the auth ID)
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    if (profileError || !profile) {
        console.error('Error identifying User ID:', profileError?.message || 'User profile not found.')
        return
    }

    console.log(`Found Identity Node: ${profile.id}. Initiating forceful password reset...`)

    // Update the password in auth schema directly via admin API
    const { data: adminData, error: adminError } = await supabase.auth.admin.updateUserById(
        profile.id,
        { password: newPassword }
    )

    if (adminError) {
        console.error('Administrative Authority Rejected:', adminError.message)
    } else {
        console.log(`--- SUCCESS ---`)
        console.log(`Identity: ${email}`)
        console.log(`Security Protocol Restored: ${newPassword}`)
        console.log('----------------')
    }
}

resetUserPassword('mariacolon054@gmail.com', '12345678')
