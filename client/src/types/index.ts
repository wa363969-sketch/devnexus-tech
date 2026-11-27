export type ThemeMode = 'dark' | 'light';

export type UserRole = 'client' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  authProvider: string;
  role: UserRole;
  isAdmin: boolean;
  labels?: string[];
  createdAt?: string;
}

export interface ServiceItem {
  id?: number;
  slug: string;
  title: string;
  badge: string;
  short_desc: string;
  full_desc: string;
  features: string[];
  benefits: string[];
  technologies: string[];
  starting_price_usd?: number | null;
  delivery_window?: string | null;
  is_active?: boolean;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface PortfolioProject {
  id?: number;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  badge: string;
  description: string;
  architecture: string;
  features: string[];
  technologies: string[];
  metrics: ProjectMetric[];
  sample_code?: string;
  accent_color: string;
  demo_url?: string;
  github_url?: string;
  is_featured?: boolean;
  is_concept?: boolean;
}

export interface TestimonialItem {
  id?: number;
  author_name: string;
  author_role: string;
  company: string;
  region: string;
  quote: string;
  rating: number;
  project_type?: string | null;
  is_demo: boolean;
  is_published?: boolean;
}

export interface InquiryRecord {
  id: number;
  user_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  company_name?: string | null;
  country: string;
  project_type: string;
  budget: string;
  timeline?: string | null;
  message: string;
  requirements?: Record<string, unknown>;
  status: string;
  lead_score?: number | null;
  ai_summary?: string | null;
  internal_notes?: string | null;
  source?: string | null;
  created_at?: string | null;
}

export interface ClientProject {
  id: number;
  client_id?: number | null;
  client_email: string;
  title: string;
  service_type: string;
  stage: string;
  progress_pct: number;
  budget_usd?: number | null;
  deadline?: string | null;
  description?: string | null;
  internal_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface InvoiceRecord {
  id: number;
  invoice_number: string;
  client_email: string;
  client_name: string;
  project_id?: number | null;
  description: string;
  currency: string;
  amount: number;
  status: string;
  provider?: string | null;
  payment_url?: string | null;
  created_at?: string | null;
  paid_at?: string | null;
}

export interface IntegrationStatusItem {
  name: string;
  category: string;
  configured: boolean;
  mode: string;
  missing_vars: string[];
  notes: string;
  active_provider?: string | null;
  business_number?: string;
  model?: string;
}

export interface PaymentProviderStatus {
  id: string;
  name: string;
  region: string;
  currencies: string[];
  configured: boolean;
  mode: string;
  supports_refunds: boolean;
  missing_vars: string[];
}

export interface PublicBootstrapData {
  services: ServiceItem[];
  portfolio: PortfolioProject[];
  testimonials: TestimonialItem[];
  announcement: {
    enabled?: boolean;
    badge?: string;
    text?: string;
    cta_label?: string;
    cta_href?: string;
  };
  contact: {
    whatsapp_number: string;
    email: string;
    company_email: string;
    location: string;
  };
  analytics: {
    ga4_measurement_id: string | null;
    gtm_container_id: string | null;
    meta_pixel_id: string | null;
    gsc_verification: string | null;
  };
}
