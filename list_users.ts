import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function listUsers() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
        console.error('Error fetching users:', error)
        return
    }

    console.log('--- AUTH USERS ---')
    users.forEach(user => {
        console.log(`Email: ${user.email} | ID: ${user.id}`)
    })
    console.log('------------------')
}

listUsers()
