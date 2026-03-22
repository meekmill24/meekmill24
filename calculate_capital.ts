import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function calculateCapital() {
    const email = 'mariacolon054@gmail.com'
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === email)
    
    if (!user) {
        console.log("User not found")
        return
    }

    const { data: tasks, error } = await supabase
        .from('user_tasks')
        .select('cost_amount, status')
        .eq('user_id', user.id)

    if (error) {
        console.error("Error fetching tasks:", error)
        return
    }

    const totalAll = tasks.reduce((acc, t) => acc + Number(t.cost_amount || 0), 0)
    const totalCompleted = tasks.filter(t => t.status === 'completed').reduce((acc, t) => acc + Number(t.cost_amount || 0), 0)
    const totalPending = tasks.filter(t => t.status === 'pending').reduce((acc, t) => acc + Number(t.cost_amount || 0), 0)

    console.log(`User: ${email}`)
    console.log(`Total Number of Tasks: ${tasks.length}`)
    console.log(`Total Node Capital (All): $${totalAll.toFixed(2)}`)
    console.log(`Total Node Capital (Completed): $${totalCompleted.toFixed(2)}`)
    console.log(`Total Node Capital (Pending): $${totalPending.toFixed(2)}`)
}

calculateCapital()
