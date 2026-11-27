import type { PortfolioProject, ServiceItem, TestimonialItem } from '../types';

export const COMPANY = {
  name: 'DEVNEXUS TECH',
  tagline: 'Engineering Digital Excellence.',
  heroHeadline: "Engineering Tomorrow's Digital World.",
  heroSubtext:
    'We build intelligent software, scalable digital products and AI-powered solutions that help businesses move forward.',
  industry: 'Software Development & AI Solutions',
  foundedStage: 'Newly Launched Engineering Studio • Accepting Founding Clients',
  markets: 'Pakistan & International (UK, USA, Canada, UAE, Australia, Europe)',
  founder: {
    name: 'Shabeer Ahmed',
    role: 'Founder & Principal Software Architect',
    bio: [
      'Shabeer Ahmed founded DEVNEXUS TECH with a straightforward engineering conviction: ambitious businesses in Pakistan and internationally deserve senior-grade architecture, clean maintainable code, and transparent communication without inflated corporate agency overhead.',
      'Combining full-stack systems engineering in TypeScript, React, Next.js, Node.js, and Python with Appwrite backends, relational PostgreSQL modeling, and n8n + LLM automation, DEVNEXUS TECH bridges bespoke product engineering and practical AI execution.',
    ],
    credentials: [
      'Full-Stack Architecture (React, Next.js, TypeScript, Node.js, Python)',
      'Database & Backend Systems (PostgreSQL, Appwrite, SQLite, REST APIs)',
      'AI & Automation Integration (OpenAI, Google Gemini, n8n Webhooks)',
      'Direct Milestone Accountability & 100% Client IP Ownership',
    ],
  },
  contact: {
    email: import.meta.env.VITE_COMPANY_EMAIL || 'wa363969@gmail.com',
    directEmail: 'wa363969@gmail.com',
    whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '923404942126',
    whatsappDisplay: '+92 340 4942126',
    whatsappUrl: `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '923404942126'}?text=${encodeURIComponent(
      'Hello DEVNEXUS TECH, I would like to discuss a software or AI project.'
    )}`,
    github: 'https://github.com/wa363969-sketch',
    linkedin: 'https://linkedin.com/in/shabeer-ahmed-dev',
    googleForm:
      'https://docs.google.com/forms/d/e/1FAIpQLSfePKBNa0Ah7SOB3bCidNwk12Pbc6uwuPYarbwXOGKyj3QG7w/viewform',
    responseSla: 'Under 24 Hours (Business Days)',
    timezones: 'PKT (UTC+5) with UK GMT, US EST/PST, UAE GST & AU AEST overlap',
  },
};

export const TECHNOLOGIES = [
  {
    name: 'HTML, CSS & JavaScript',
    category: 'Web Standards',
    role: 'Semantic markup, modern layout engines, and clean ES6+ browser architecture.',
    details: 'WCAG-conscious accessibility, Core Web Vitals optimization, and responsive foundations.',
  },
  {
    name: 'React & Next.js',
    category: 'Frontend Engineering',
    role: 'High-clarity component systems, TypeScript SPAs, and SEO-ready SSR/hybrid web platforms.',
    details: 'Modular state management, smooth Framer Motion choreography, and edge-ready builds.',
  },
  {
    name: 'Node.js',
    category: 'Backend & APIs',
    role: 'Asynchronous API gateways, webhook processors, and real-time B2B service layers.',
    details: 'Express/Fastify patterns, typed REST endpoints, and secure payment/webhook verification.',
  },
  {
    name: 'Python',
    category: 'Backend & AI Services',
    role: 'Flask/FastAPI microservices, AI orchestration, data processing, and automated QA.',
    details: 'Server-side OpenAI & Gemini pipelines, SQLAlchemy ORM, and robust business logic.',
  },
  {
    name: 'PostgreSQL & Appwrite',
    category: 'Data & Auth Platforms',
    role: 'ACID-compliant relational schemas paired with Appwrite OAuth 2.0, database, and storage.',
    details: 'Zero-trust RBAC permissions, Google OAuth, encrypted document isolation, and migrations.',
  },
  {
    name: 'n8n',
    category: 'AI & Workflow Automation',
    role: 'Event-driven CRM pipelines connecting forms, WhatsApp, email, and AI qualification.',
    details: 'HMAC-signed webhook ingestion, automated reminders, and multi-step orchestration.',
  },
  {
    name: 'Figma',
    category: 'UI/UX Design Systems',
    role: 'Architectural wireframes, design tokens, interactive prototypes, and dark/light component kits.',
    details: 'Structured design-to-engineering handoff before production code begins.',
  },
  {
    name: 'Git & GitHub',
    category: 'Version Control & CI/CD',
    role: 'Branch-protected repositories, pull-request reviews, automated checks, and Vercel deployments.',
    details: 'Full repository ownership transferred cleanly to clients upon milestone completion.',
  },
];

export const FALLBACK_SERVICES: ServiceItem[] = [
  {
    slug: 'website-development',
    title: 'Website Development',
    badge: 'Core Practice',
    short_desc:
      'High-performance, accessible corporate and conversion-focused websites engineered for international and Pakistani brands.',
    full_desc:
      'DEVNEXUS TECH builds fast, search-optimized websites engineered around clean semantics, Core Web Vitals speed, and multi-channel lead capture.',
    features: [
      'Custom responsive UI across mobile, tablet, and desktop',
      'Technical SEO, Open Graph metadata, JSON-LD & sitemap.xml',
      'Dark & Light architectural theme support',
      'Validated inquiry pipelines & CRM webhook connectivity',
    ],
    benefits: [
      'Immediate international credibility for newly scaling ventures',
      'Fast page loads and clean accessibility compliance',
      '100% source repository and IP ownership',
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'HTML5/CSS3'],
    starting_price_usd: 900,
    delivery_window: '2 – 4 Weeks',
  },
  {
    slug: 'web-application-development',
    title: 'Web Application Development',
    badge: 'Full-Stack',
    short_desc:
      'Scalable SaaS platforms, client portals, and multi-tenant web applications backed by PostgreSQL and Appwrite.',
    full_desc:
      'End-to-end engineering for web applications requiring authenticated workspaces, Google OAuth, role-based access, and real-time workflows.',
    features: [
      'Appwrite / OAuth 2.0 authentication & RBAC security',
      'PostgreSQL / Appwrite schema design & API validation',
      'Client & internal workflow portals with live status tracking',
      'Vercel & cloud production deployment with CI/CD',
    ],
    benefits: [
      'Built to grow cleanly from MVP to enterprise throughput',
      'Zero template lock-in or bloated third-party wrappers',
      'Iterative staging previews every sprint',
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Appwrite'],
    starting_price_usd: 2400,
    delivery_window: '4 – 8 Weeks',
  },
  {
    slug: 'ecommerce-development',
    title: 'E-commerce Development',
    badge: 'Global & PK Commerce',
    short_desc:
      'Multi-currency storefronts supporting Stripe, PayPal, Payoneer, JazzCash, and Easypaisa checkout orchestration.',
    full_desc:
      'Sell to international buyers and Pakistani customers with unified inventory control, secure payment verification, and automated receipts.',
    features: [
      'Dynamic product catalogs & facet filtering',
      'Stripe, PayPal, JazzCash & Easypaisa gateway adapters',
      'Atomic inventory locks & order status workflows',
      'Automated email & WhatsApp order notifications',
    ],
    benefits: [
      'Supports both international cards (USD/GBP/EUR) and PKR wallets',
      'Frictionless mobile-first checkout experience',
      'Real-time admin order & refund tracking',
    ],
    technologies: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Stripe', 'PayPal'],
    starting_price_usd: 1800,
    delivery_window: '3 – 6 Weeks',
  },
  {
    slug: 'custom-software-development',
    title: 'Custom Software Development',
    badge: 'Bespoke Systems',
    short_desc:
      'Tailor-made operational systems, internal ERPs, and domain-specific software built around your exact business logic.',
    full_desc:
      'Replace fragmented spreadsheets with custom-architected web software featuring strict validation, audit trails, and tailored automation.',
    features: [
      'Normalized relational database modeling & migrations',
      'Custom business rule engines & report exports',
      'Granular multi-role permissions & security auditing',
      'Data import/export & legacy modernization',
    ],
    benefits: [
      'Eliminates manual data reconciliation errors',
      'Zero recurring per-seat SaaS licensing fees',
      'Full technical documentation and handover',
    ],
    technologies: ['Python', 'Node.js', 'PostgreSQL', 'Appwrite', 'TypeScript'],
    starting_price_usd: 2800,
    delivery_window: '5 – 10 Weeks',
  },
  {
    slug: 'ai-chatbots',
    title: 'AI Chatbots',
    badge: 'OpenAI & Gemini',
    short_desc:
      'Server-side OpenAI and Google Gemini assistants for 24/7 customer inquiry guidance, qualification, and escalation.',
    full_desc:
      'Intelligent conversational agents engineered with strict API key isolation, domain grounding, and seamless CRM handoff.',
    features: [
      'Server-side OpenAI & Google Gemini inference endpoints',
      'Company knowledge grounding & structured responses',
      'Lead capture & requirement intake automation',
      'Rate limiting & transparent human handoff triggers',
    ],
    benefits: [
      'Immediate engagement across UK, US, PK, and AU time zones',
      'Higher quality project briefs before discovery calls',
      'Private credentials kept strictly server-side',
    ],
    technologies: ['Python', 'Node.js', 'OpenAI API', 'Gemini API', 'React'],
    starting_price_usd: 1200,
    delivery_window: '2 – 4 Weeks',
  },
  {
    slug: 'ai-automation',
    title: 'AI Automation',
    badge: 'n8n Workflows',
    short_desc:
      'n8n workflow orchestration connecting inquiries, AI lead scoring, transactional email, WhatsApp Cloud, and CRM updates.',
    full_desc:
      'Connect your operational stack through HMAC-signed webhooks and automated AI pipelines so leads and tasks never fall through the cracks.',
    features: [
      'n8n workflow design & HMAC-SHA256 webhook verification',
      'AI-assisted lead qualification & reply drafting',
      'Automated email & WhatsApp Cloud notifications',
      'Scheduled follow-up reminders & CRM stage sync',
    ],
    benefits: [
      'Sub-minute lead acknowledgment and routing',
      'Eliminates repetitive manual copy-paste workflows',
      'Auditable execution logs and error alerts',
    ],
    technologies: ['n8n', 'Python', 'Node.js', 'OpenAI', 'Gemini'],
    starting_price_usd: 1000,
    delivery_window: '1 – 3 Weeks',
  },
  {
    slug: 'admin-dashboard-development',
    title: 'Admin Dashboard Development',
    badge: 'Command Centers',
    short_desc:
      'Executive CRM, project management, invoicing, and analytics dashboards gated by server-verified authorization.',
    full_desc:
      'Monitor leads, active client projects, tasks, revenue invoices, and API integration readiness inside one cohesive control plane.',
    features: [
      'KPI analytics & lead conversion pipelines',
      'Client, project, task, quotation & invoice management',
      'CMS tools for portfolio, services, and announcements',
      'Role-based access control & security audit logs',
    ],
    benefits: [
      'Complete operational visibility in real time',
      'Streamlined client invoicing and milestone approvals',
      'Strict admin route & API authorization',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Appwrite', 'PostgreSQL'],
    starting_price_usd: 1900,
    delivery_window: '3 – 6 Weeks',
  },
  {
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    badge: 'Figma Systems',
    short_desc:
      'Original interface architecture, interactive prototypes, and dark/light design token systems crafted in Figma.',
    full_desc:
      'We design distinctive, uncluttered corporate interfaces grounded in typography hierarchy, thoughtful whitespace, and purposeful motion.',
    features: [
      'Information architecture & user flow mapping',
      'Figma component libraries & reusable design tokens',
      'Responsive desktop, tablet & mobile artboards',
      'Accessible color contrast & motion guidelines',
    ],
    benefits: [
      'Validates UX flows before engineering starts',
      'Avoids generic SaaS template sameness',
      'Clean developer-ready Figma specifications',
    ],
    technologies: ['Figma', 'Design Tokens', 'Framer Motion', 'Tailwind CSS'],
    starting_price_usd: 800,
    delivery_window: '1 – 3 Weeks',
  },
  {
    slug: 'api-integration',
    title: 'API Integration',
    badge: 'Connectivity',
    short_desc:
      'Production-hardened integrations for Appwrite, Google OAuth, Stripe, PayPal, JazzCash, Easypaisa, Resend, WhatsApp & n8n.',
    full_desc:
      'We connect external APIs cleanly with environment-isolated secrets, HMAC signature checks, rate limiting, and thorough error documentation.',
    features: [
      'Appwrite Auth, Google OAuth 2.0, Databases & Storage',
      'Stripe, PayPal, Payoneer, JazzCash & Easypaisa flows',
      'Resend/SendGrid email & WhatsApp Business Cloud API',
      'HMAC webhook signing & OpenAPI/Markdown docs',
    ],
    benefits: [
      'Eliminates fragile client-side key exposure',
      'Verified sandbox testing and setup documentation',
      'Resilient retry & error telemetry',
    ],
    technologies: ['Node.js', 'Python', 'Appwrite', 'REST APIs', 'n8n'],
    starting_price_usd: 750,
    delivery_window: '1 – 3 Weeks',
  },
];

export const FALLBACK_PORTFOLIO: PortfolioProject[] = [
  {
    slug: 'enterprise-logistics-portal',
    title: 'Enterprise Logistics Management Portal',
    tagline: 'Mission-Critical Freight Dispatch & Real-Time Route Telemetry',
    category: 'Custom Software',
    badge: 'Concept Architecture',
    description:
      'Architectural concept for a commercial freight command center featuring live dispatch scheduling, GPS corridor telemetry, driver compliance tracking, and automated manifest auditing.',
    architecture:
      'Python REST backend with PostgreSQL relational models, coordinate interpolation engine, and React TypeScript operations console.',
    features: [
      'Real-time dispatch scheduling with corridor waypoints',
      'Interactive GPS route telemetry with speed & ETA tracking',
      'Driver compliance & duty status controls',
      'Fleet fuel, payload & maintenance alerting',
      'Immutable audit log & manifest export',
    ],
    technologies: ['Python', 'PostgreSQL', 'React', 'TypeScript', 'Tailwind CSS'],
    metrics: [
      { label: 'Telemetry Target', value: '< 50ms' },
      { label: 'Data Model', value: 'ACID SQL' },
      { label: 'Classification', value: 'Concept Demo' },
    ],
    accent_color: '#00d2ff',
    github_url: 'https://github.com/wa363969-sketch/enterprise-logistics-portal',
    is_concept: true,
  },
  {
    slug: 'omniflow-saas-analytics',
    title: 'OmniFlow SaaS Analytics & Billing',
    tagline: 'Multi-Tenant Metrics Engine, Usage Metering & Subscription Webhooks',
    category: 'Web Applications',
    badge: 'Concept Architecture',
    description:
      'Concept platform demonstrating multi-tenant SaaS isolation, MRR/ARR cohort reporting, API usage metering, and HMAC-verified Stripe subscription billing.',
    architecture:
      'Tenant-scoped PostgreSQL schemas paired with event ingestion APIs and a React + TypeScript analytics suite.',
    features: [
      'Multi-tenant isolation and role permissions',
      'Live MRR, ARR, retention & cohort metrics',
      'Signature-verified Stripe webhook billing',
      'Real-time API metering & quota alerts',
    ],
    technologies: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe'],
    metrics: [
      { label: 'Tenant Isolation', value: 'Row-Scoped' },
      { label: 'Billing Sync', value: 'HMAC Verified' },
      { label: 'Classification', value: 'Concept Demo' },
    ],
    accent_color: '#38bdf8',
    github_url: 'https://github.com/wa363969-sketch/omniflow-saas-analytics',
    is_concept: true,
  },
  {
    slug: 'nexus-ai-automation-desk',
    title: 'NexusAI Support & n8n Lead Engine',
    tagline: 'Gemini/OpenAI Qualification Assistant & Automated WhatsApp CRM Pipelines',
    category: 'AI & Automation',
    badge: 'Concept Architecture',
    description:
      'Blueprint for an enterprise AI customer intake and lead qualification platform combining server-side OpenAI/Gemini inference with n8n, Resend, and WhatsApp Cloud triggers.',
    architecture:
      'Server-side LLM gateway backed by Appwrite Auth, PostgreSQL CRM tables, and signed n8n webhooks.',
    features: [
      'Server-side OpenAI & Gemini inquiry triage',
      'Structured lead scoring & scope summarization',
      'n8n webhooks for WhatsApp & Email follow-ups',
      'Rate-limited public chat widget with escalation',
    ],
    technologies: ['Python', 'OpenAI API', 'Gemini API', 'n8n', 'Appwrite', 'React'],
    metrics: [
      { label: 'Key Exposure', value: 'Zero Client' },
      { label: 'Orchestration', value: 'n8n Webhooks' },
      { label: 'Classification', value: 'Concept Demo' },
    ],
    accent_color: '#22d3ee',
    is_concept: true,
  },
  {
    slug: 'apex-health-telemedicine',
    title: 'Apex Health Telemedicine Suite',
    tagline: 'Encrypted Consultation Scheduling & Role-Gated Health Records',
    category: 'Web Applications',
    badge: 'Concept Architecture',
    description:
      'Concept healthcare portal built for appointment booking, encrypted WebRTC video consultations, intake forms, and strict clinician-patient isolation.',
    architecture:
      'Role-based JWT authorization layer, PostgreSQL audit records, and peer-to-peer consultation signaling.',
    features: [
      'Patient booking & clinician calendar sync',
      'Encrypted WebRTC consultation rooms',
      'Structured EHR timeline & notes',
      'Clinician access audit trails',
    ],
    technologies: ['Python', 'React', 'PostgreSQL', 'WebRTC', 'TypeScript'],
    metrics: [
      { label: 'Access Control', value: 'Strict RBAC' },
      { label: 'Audit Trail', value: 'Every Read' },
      { label: 'Classification', value: 'Concept Demo' },
    ],
    accent_color: '#34d399',
    github_url: 'https://github.com/wa363969-sketch/apex-health-telemedicine',
    is_concept: true,
  },
  {
    slug: 'shopcore-global-commerce',
    title: 'ShopCore Multi-Currency Storefront',
    tagline: 'Global & Pakistani Checkout with Stripe, PayPal, JazzCash & Easypaisa',
    category: 'E-commerce',
    badge: 'Concept Architecture',
    description:
      'Concept commerce architecture supporting international USD/GBP/EUR buyers alongside Pakistani PKR checkouts, atomic inventory locking, and merchant fulfillment.',
    architecture:
      'Decoupled React TypeScript storefront backed by Node/Python checkout services and signature-verified payment callbacks.',
    features: [
      'Multi-currency catalog & facet search',
      'Stripe, PayPal, JazzCash & Easypaisa adapters',
      'Atomic stock reservations',
      'Merchant fulfillment & refund dashboard',
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe', 'PayPal'],
    metrics: [
      { label: 'Gateways', value: 'Global + PK' },
      { label: 'Inventory Lock', value: 'Atomic TX' },
      { label: 'Classification', value: 'Concept Demo' },
    ],
    accent_color: '#60a5fa',
    github_url: 'https://github.com/wa363969-sketch/shopcore-ecommerce',
    is_concept: true,
  },
];

export const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    author_name: 'Sample Format — International SaaS Founder',
    author_role: 'Demo Testimonial Slot (UK / Europe)',
    company: 'Illustrative B2B Concept',
    region: 'United Kingdom (Demo)',
    quote:
      'This card illustrates how verified client reviews will appear once DEVNEXUS TECH completes founding engagements. We publish only authentic, verifiable feedback—never fabricated client claims.',
    rating: 5,
    project_type: 'Web Application Development',
    is_demo: true,
  },
  {
    author_name: 'Sample Format — Operations Director',
    author_role: 'Demo Testimonial Slot (Pakistan Enterprise)',
    company: 'Illustrative Commerce Concept',
    region: 'Pakistan (Demo)',
    quote:
      'Clearly labelled demo testimonial: demonstrates how Pakistani commerce teams evaluate unified JazzCash/Easypaisa checkout adapters, clean admin consoles, and n8n inquiry automation.',
    rating: 5,
    project_type: 'E-commerce & AI Automation',
    is_demo: true,
  },
  {
    author_name: 'Sample Format — Product Lead',
    author_role: 'Demo Testimonial Slot (North America)',
    company: 'Illustrative HealthTech Concept',
    region: 'United States / Canada (Demo)',
    quote:
      'Clearly labelled demo testimonial: reflects DEVNEXUS TECH engineering standards—direct architect collaboration, Appwrite OAuth security, and milestone-verified source handoffs.',
    rating: 5,
    project_type: 'AI Chatbots & Custom Software',
    is_demo: true,
  },
];

export const DEVELOPMENT_PROCESS = [
  {
    step: '01',
    title: 'Discovery & Scope Alignment',
    window: 'Days 1 – 3',
    description:
      'We map your business goals, target users in Pakistan or international markets, technical constraints, and integration dependencies before estimating.',
    deliverables: ['Requirements specification', 'Integration & API audit', 'Milestone & budget plan'],
  },
  {
    step: '02',
    title: 'System & Data Architecture',
    window: 'Days 4 – 7',
    description:
      'Designing normalized PostgreSQL / Appwrite schemas, authentication boundaries, API contracts, and webhook security architecture.',
    deliverables: ['Entity & database schema', 'API route blueprint', 'Security & RBAC matrix'],
  },
  {
    step: '03',
    title: 'Figma UI/UX & Prototyping',
    window: 'Week 2',
    description:
      'Crafting clean, responsive layouts and dark/light design tokens in Figma so visual hierarchy and user journeys are approved early.',
    deliverables: ['Responsive wireframes', 'Design tokens & kit', 'Interactive flow review'],
  },
  {
    step: '04',
    title: 'Iterative Full-Stack Engineering',
    window: 'Weeks 3 – 5',
    description:
      'Clean TypeScript, React/Next.js, Node.js, Python, and n8n implementation committed to GitHub with live staging previews at every milestone.',
    deliverables: ['Modular typed codebase', 'GitHub PR milestones', 'Staging preview URL'],
  },
  {
    step: '05',
    title: 'Security, QA & Performance Audit',
    window: 'Week 6',
    description:
      'Cross-device testing across mobile, tablet, and desktop alongside input validation checks, webhook signature verification, and Core Web Vitals tuning.',
    deliverables: ['Responsive & browser QA', 'API & auth security pass', 'Lighthouse optimization'],
  },
  {
    step: '06',
    title: 'Deployment, Handover & Support',
    window: 'Launch',
    description:
      'Production deployment on Vercel/cloud, custom domain & SSL configuration, environment runbooks, full repository transfer, and 30-day warranty.',
    deliverables: ['Production cutover & SSL', 'Setup & API docs', '100% IP transfer & warranty'],
  },
];

export const WHY_CHOOSE_US = [
  {
    title: 'Newly Launched Hunger, Senior Standards',
    tag: 'Transparent Partnership',
    description:
      'As a newly launched engineering studio, every founding partner receives principal-level attention, direct architect communication, and uncompromising code quality.',
  },
  {
    title: 'Pakistan Cost Advantage, Global Execution',
    tag: 'PK & International',
    description:
      'Seamless overlap with UK (GMT), US/Canada (EST/PST), UAE (GST), and Australia (AEST), paired with localized Pakistani gateways (JazzCash/Easypaisa) and global Stripe/PayPal/Payoneer.',
  },
  {
    title: 'Real Security & Zero-Shortcut APIs',
    tag: 'Zero Client Secrets',
    description:
      'We strictly keep LLM keys, payment secrets, and Appwrite admin keys on server runtimes, enforce RBAC, and verify webhooks with HMAC signatures.',
  },
  {
    title: 'AI & n8n Automation Built In',
    tag: 'Modern Stack',
    description:
      'Beyond static pages—we connect OpenAI, Google Gemini, n8n workflows, WhatsApp Cloud, and transactional email into cohesive revenue systems.',
  },
  {
    title: 'Milestone-Based Transparency',
    tag: 'Zero Ambiguity',
    description:
      'Staged deliverables on live preview environments ensure you review real working software at each step before releasing milestone payments.',
  },
  {
    title: '100% Intellectual Property Ownership',
    tag: 'Clean Git Handover',
    description:
      'Upon completion, full source code, database schemas, Figma assets, and deployment documentation belong 100% to your company.',
  },
];

export const FAQ_ITEMS = [
  {
    q: 'Is DEVNEXUS TECH a newly launched company, and why work with a new studio?',
    a: 'Yes—DEVNEXUS TECH is transparently newly launched, founded by Principal Software Architect Shabeer Ahmed. Working with a newly launched specialist studio means your project is engineered directly by senior leadership rather than outsourced to junior tiers, with high-touch accountability and transparent pricing.',
  },
  {
    q: 'Are the projects in your portfolio live client contracts or architectural concepts?',
    a: 'All showcase projects currently displayed in our portfolio are clearly labelled as functional architectural concepts engineered to demonstrate code quality, database modeling, AI workflows, and UI craftsmanship without fabricating commercial client claims.',
  },
  {
    q: 'Which countries and payment methods do you support?',
    a: 'We serve both Pakistani businesses and international clients across the UK, USA, Canada, UAE, Australia, and Europe. Payment integration architectures support Stripe, PayPal, Payoneer, direct wire, JazzCash, and Easypaisa (each provider activates once merchant credentials are configured in environment settings).',
  },
  {
    q: 'How does Google Sign-In & Client Dashboard security work?',
    a: 'Authentication is powered by Appwrite Auth and official Google OAuth 2.0. OAuth tokens and passwords are never stored in application tables, Google users default strictly to client permissions, and admin console access requires server-verified administrator roles.',
  },
  {
    q: 'Do we receive 100% ownership of our code and designs?',
    a: 'Yes. Upon final milestone completion, full copyright, GitHub repositories, Figma design files, and documentation transfer completely to your organization with zero licensing lock-in.',
  },
];
