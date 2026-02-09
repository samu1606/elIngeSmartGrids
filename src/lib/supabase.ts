import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface Profile {
    id: string
    email: string | null
    full_name: string | null
    avatar_url: string | null
    company_name: string | null
    phone: string | null
    subscription_tier: 'starter' | 'professional'
    subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
    subscription_ends_at: string | null
    created_at: string
    updated_at: string
}

export interface Client {
    id: string
    user_id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    rut_nit: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface Project {
    id: string
    user_id: string
    client_id: string | null
    name: string
    description: string | null
    address: string | null
    project_type: 'residential' | 'commercial' | 'industrial' | 'solar' | 'lighting' | null
    status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
    start_date: string | null
    end_date: string | null
    budget_estimated: number | null
    budget_actual: number | null
    created_at: string
    updated_at: string
}

export interface Calculation {
    id: string
    project_id: string
    user_id: string
    calculation_type: 'conductor_sizing' | 'protection' | 'voltage_drop' | 'load_analysis' | 'lighting' | 'transformer'
    name: string
    input_data: Record<string, unknown>
    result_data: Record<string, unknown>
    notes: string | null
    created_at: string
    updated_at: string
}

export interface Budget {
    id: string
    project_id: string
    user_id: string
    client_id: string | null
    budget_number: string
    title: string
    description: string | null
    status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    valid_until: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface BudgetItem {
    id: string
    budget_id: string
    description: string
    quantity: number
    unit: string
    unit_price: number
    total_price: number
    category: string | null
    sort_order: number
    created_at: string
}

export interface Expense {
    id: string
    project_id: string
    user_id: string
    category: 'materials' | 'labor' | 'equipment' | 'transport' | 'permits' | 'other'
    description: string
    amount: number
    expense_date: string
    receipt_url: string | null
    notes: string | null
    created_at: string
}

export interface AgendaEvent {
    id: string
    user_id: string
    project_id: string | null
    client_id: string | null
    title: string
    description: string | null
    event_type: 'meeting' | 'site_visit' | 'deadline' | 'reminder' | 'other'
    start_time: string
    end_time: string | null
    location: string | null
    all_day: boolean
    reminder_minutes: number
    created_at: string
    updated_at: string
}

export interface Report {
    id: string
    user_id: string
    project_id: string | null
    report_type: 'project_summary' | 'financial' | 'calculations' | 'client_history' | 'monthly'
    title: string
    data: Record<string, unknown>
    file_url: string | null
    generated_at: string
}

export interface Subscription {
    id: string
    user_id: string
    tier: 'starter' | 'professional'
    status: 'active' | 'cancelled' | 'past_due' | 'trialing'
    amount: number
    currency: string
    payment_provider: string | null
    external_subscription_id: string | null
    current_period_start: string | null
    current_period_end: string | null
    created_at: string
    updated_at: string
}
