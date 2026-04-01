export interface Profile {
    id: string;
    username: string;
    display_name: string | null;
    phone: string;
    phone_number: string | null;
    role: 'user' | 'admin';
    level_id: number | null;
    referral_code: string;
    referred_by: string | null;
    wallet_balance: number;
    profit: number;
    total_earned: number;
    freeze_balance: number;
    referral_earned: number;
    referred_users_count: number;
    avatar_url: string | null;
    total_earnings?: number;
    email: string;
    completed_count: number;
    current_set: number;
    last_reset_at: string;
    wallet_address?: string | null;
    security_pin?: string | null;
    language: string;
    currency: string;
    pending_bundle: any | null;
    notifications_enabled: boolean;
    wallet_network?: string | null;
    withdrawal_wallet_address?: string | null;
    is_verified: boolean;
    verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
    verification_doc_type?: 'id' | 'passport' | 'license' | null;
    verification_front_url?: string | null;
    verification_back_url?: string | null;
    withdrawal_password?: string | null;
    tasks_per_set_override?: number | null;
    sets_per_day_override?: number | null;
    level?: Level;
    created_at: string;
}

export interface Level {
    id: number;
    name: string;
    price: number;
    commission_rate: number;
    tasks_per_set: number;
    sets_per_day: number;
    description: string;
    badge_color: string;
}

export interface TaskItem {
    id: number;
    title: string;
    image_url: string;
    description: string;
    category: string;
    level_id?: number | null;
    is_active: boolean;
    created_at: string;
}

export interface UserTask {
    id: number;
    user_id: string;
    task_item_id: number;
    status: 'pending' | 'completed' | 'cancelled';
    earned_amount: number;
    cost_amount?: number;
    is_bundle?: boolean;
    completed_at: string | null;
    created_at: string;
    task_item?: TaskItem;
}

export interface ReferralCode {
    id: number;
    code: string;
    owner_id: string;
    uses_count: number;
    is_active: boolean;
    created_at: string;
    owner?: Profile;
}

export interface Transaction {
    id: number;
    user_id: string;
    type: 'deposit' | 'withdrawal' | 'commission' | 'freeze' | 'unfreeze';
    amount: number;
    description: string;
    status?: 'pending' | 'approved' | 'rejected';
    proof_url?: string | null;
    created_at: string;
}
