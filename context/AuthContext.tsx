'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    mutate: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
    mutate: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            console.log("Fetching profile for ID:", userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*, level:levels(*)')
                .eq('id', userId)
                .single();

            if (error) {
                console.error(`DB Error (${error.code}):`, error.message, "| Details:", error.details);
                setProfile(null);
            } else {
                console.log("Profile data fetched successfully:", data);
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            setProfile(null);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
            await fetchProfile(currentUser.id);
        }
    }, [fetchProfile]);

    useEffect(() => {
        let mounted = true;
        let initialized = false;

        const initialize = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session?.user) {
                    console.log("Session User:", session.user.email, "| ID:", session.user.id);
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
                initialized = true;
            } catch (err: any) {
                console.error('Auth initialization error:', err);

                if (mounted) {
                    const { data: { user: fallbackUser } } = await supabase.auth.getUser();
                    if (fallbackUser) {
                        setUser(fallbackUser);
                        await fetchProfile(fallbackUser.id);
                    } else {
                        setUser(null);
                        setProfile(null);
                    }
                    initialized = true;
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initialize();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                // LOGIC CALIBRATION: Prevent refreshes on simple background token updates
                if (event === 'TOKEN_REFRESHED' && user?.id === session?.user?.id) {
                    return;
                }

                if (event === 'INITIAL_SESSION' && !initialized) return;

                if (session?.user) {
                    console.log("Logged in as:", session.user.email, "| ID:", session.user.id);
                    // Only trigger full loading state if it is a new user context
                    if (user?.id !== session.user.id) {
                        setLoading(true);
                        setUser(session.user);
                        await fetchProfile(session.user.id);
                    } else {
                        setUser(session.user);
                    }
                } else if (event === 'SIGNED_OUT') {
                    console.log("Auth session signed out");
                    setUser(null);
                    setProfile(null);
                }

                if (mounted) setLoading(false);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        router.push('/login');
    }, [router]);

    useEffect(() => {
        console.log("PROFILE STATE UPDATE:", profile);
        if (!loading && user && profile === null) {
            console.warn("Profile not loaded, but user exists");
        }
    }, [loading, user, profile, signOut]);

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile, mutate: refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
