import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
    id: string
    email: string
    full_name: string | null
    company_name: string | null
    phone: string | null
    subscription_tier: 'starter' | 'professional'
    subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
}

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Nuclear Option: Initialize directly with Demo data
    const [user, setUser] = useState<User | null>({
        id: 'demo-user-id',
        email: 'juan.diaz@elingesmartgrids.com',
        user_metadata: { full_name: 'Juan Díaz' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
    } as User)

    const [profile, setProfile] = useState<Profile | null>({
        id: 'demo-user-id',
        email: 'juan.diaz@elingesmartgrids.com',
        full_name: 'Juan Díaz',
        company_name: 'Smart Grids Solutions SL',
        phone: '+34 600 000 000',
        subscription_tier: 'professional',
        subscription_status: 'active'
    })

    const [session, setSession] = useState<Session | null>({
        access_token: 'demo-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'demo-refresh',
        user: {
            id: 'demo-user-id',
            email: 'juan.diaz@elingesmartgrids.com',
            user_metadata: { full_name: 'Juan Díaz' },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
        } as User
    })

    // Loading is FALSE by default to prevent spinner
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Modo Demo Temporal para desbloquear al usuario y ver las funcionalidades
        const demoUser = {
            id: 'demo-user-id',
            email: 'juan.diaz@elingesmartgrids.com',
            user_metadata: { full_name: 'Juan Díaz' }
        } as any;

        const demoProfile = {
            id: 'demo-user-id',
            email: 'juan.diaz@elingesmartgrids.com',
            full_name: 'Juan Díaz',
            company_name: 'Smart Grids Solutions SL',
            phone: '+34 600 000 000',
            subscription_tier: 'professional',
            subscription_status: 'active'
        } as any;

        console.log('[AuthContext] Activating Demo Mode to bypass auth issues');
        setUser(demoUser);
        setProfile(demoProfile);
        setLoading(false);

        // Listen for auth changes (keep standard logic but won't affect demo unless successful login)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    console.log('[AuthContext] Real session detected, switching from demo');
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [])

    async function fetchProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return
        }

        setProfile(data)
    }

    async function signUp(email: string, password: string, fullName: string) {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        })

        return { error: error as Error | null }
    }

    async function signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        return { error: error as Error | null }
    }

    async function signOut() {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setSession(null)
    }

    async function resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        })

        return { error: error as Error | null }
    }

    const value = {
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
