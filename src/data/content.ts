// ============================================================
// KUMAR ASHUTOSH — Single Source of Truth for ALL site content
// Edit ONLY this file to update data. Do not scatter numbers
// across components — every figure must trace back here.
// ============================================================

export const person = {
  name: "Kumar Ashutosh",
  title: "AVP – Data Engineering, AI & Products",
  company: "Easyrewardz",
  location: "Gurugram, India",
  teamSize: 30, // SINGLE SOURCE — 30 engineers + PMs
  yearsExperience: 14,
  clientCount: 100, // "100+ enterprise clients"
  linkedin: "https://www.linkedin.com/in/shutupashu/",
  github: "https://github.com/importashutosh",
  resume: "/resume.pdf",
  calendly: "https://calendly.com/importashutosh/30min",
  award: "Financial Express FuTech Awards 2024 — Best Data Analytics Solution (Atlantis Platform)",
};

export const hero = {
  headline: "Built a real-time CDP serving 100M+ customer profiles.",
  subhead: `AVP of Data Engineering, AI & Products at Easyrewardz. ${person.teamSize}-person cross-functional team. 13B+ events processed annually. ${person.yearsExperience} years shipping data systems at scale.`,
  cta: {
    primary: { label: "View Case Studies", href: "#products" },
    secondary: { label: "Download Resume (PDF)", href: person.resume },
    tertiary: { label: "Book a Call", href: person.calendly },
  },
};

export const stats = [
  {
    value: "100M+",
    label: "Customer profiles",
    detail: "Real-time behavioral data in Zence CDP",
  },
  {
    value: "13B+",
    label: "Events / year",
    detail: "3B SMS + 10B emails via Clix engine",
  },
  {
    value: `${person.teamSize}`,
    label: "Engineers & PMs",
    detail: "Cross-functional squad, reports to CEO",
  },
  {
    value: `${person.clientCount}+`,
    label: "Enterprise clients",
    detail: "OneConsent onboarded in first 3 months",
  },
  {
    value: "60%",
    label: "Faster insights",
    detail: "From enterprise RAG pipeline deployment",
  },
  {
    value: `${person.yearsExperience}`,
    label: "Years experience",
    detail: "Data engineering → product → AI leadership",
  },
];

// Products — only confirmed public-safe entries
export const products = [
  {
    id: "oliver-ai",
    name: "Oliver AI",
    category: "Agentic Commerce",
    size: "large", // bento sizing: large | medium | small
    problem: "Retailers needed autonomous AI agents to drive product discovery and purchase across voice and mobile — without building custom AI infra.",
    built: "LangGraph-based agentic orchestration layer over Zence APIs (via MCP Gateway). Voice interface using Ozonetel + Sarvam AI + Smallest.ai for sub-second STT/TTS. React Native / Expo for the Zence Pocket mobile surface.",
    outcome: "Deployed to enterprise retail brands; handles product search, loyalty redemption, and purchase flows end-to-end without human handoff.",
    stack: ["LangGraph", "MCP", "FastAPI", "Ozonetel", "Sarvam AI", "Smallest.ai", "React Native", "Expo"],
  },
  {
    id: "segcon",
    name: "Segcon",
    category: "Real-Time Segmentation",
    size: "medium",
    problem: "Marketing teams needed millisecond-level audience segmentation on 100M+ profiles to power real-time campaign triggers.",
    built: "Streaming event evaluator on Kafka/Redpanda. ML propensity scoring (Spark → Polars migration for 3× speed). Profile store on ClickHouse for sub-100ms segment reads.",
    outcome: "Powers ₹250M+ in monthly client marketing revenue across 100+ enterprise brands.",
    stack: ["Kafka", "Redpanda", "ClickHouse", "Polars", "Spark", "FastAPI", "Redis"],
  },
  {
    id: "model-studio",
    name: "Model Studio",
    category: "AI / ML Platform",
    size: "medium",
    problem: "Data scientists needed a governed, low-friction environment to train, version, and deploy churn/propensity models without engineering tickets.",
    built: "Self-serve ML platform with Airflow-managed pipelines, Vertex AI / Gemini for model hosting, and an OPA policy layer for data access governance.",
    outcome: "Cut model-to-production cycle from 3 weeks to 4 days; 12+ models in production across client verticals.",
    stack: ["Airflow", "Vertex AI", "Gemini", "OPA", "FastAPI", "Azure", "MySQL", "MongoDB"],
  },
  {
    id: "zence-360",
    name: "Zence 360",
    category: "Customer Data Platform",
    size: "medium",
    problem: "Enterprise clients managing loyalty across 8+ countries needed a unified, real-time view of each customer — ID-resolved, omnichannel.",
    built: "Cloud-native CDP replacing legacy on-prem stack. Identity resolution pipeline on Spark/Polars. Behavioral event streaming via Kafka. Delta Lake for unified profile storage on Azure.",
    outcome: "35% infra cost reduction post-migration; CDP now manages 100M+ real-time profiles across multi-country deployments (Bata: 8 countries).",
    stack: ["Spark", "Polars", "Kafka", "Delta Lake", "Azure Synapse", "ClickHouse", "Kubernetes"],
  },
  {
    id: "zence-marketing",
    name: "Zence Marketing",
    category: "Campaign Automation",
    size: "small",
    problem: "Brands needed a marketer-facing campaign builder that executed cross-channel journeys at 13B+ message-event scale.",
    built: "Journey orchestration engine with Celery task queues, Redis rate-limiting, and Kafka for async dispatch. Pluggable channel connectors for SMS, email, WhatsApp, push.",
    outcome: "Processes 13B+ annual messaging events. Portfolio ARR grew from $5M to $12M attributable to Zence Marketing and Zence 360 combined.",
    stack: ["Celery", "Redis", "Kafka", "FastAPI", "MySQL", "MongoDB"],
  },
  {
    id: "zence-commerce",
    name: "Zence Commerce",
    category: "Loyalty & Rewards Commerce",
    size: "small",
    problem: "Loyalty programs needed a branded storefront for points redemption, partner offers, and rewards catalogue — integrated with the CDP.",
    built: "API-first commerce layer (FastAPI) with real-time points ledger and catalog management, connected to Segcon for personalised offer targeting.",
    outcome: "Live across 30+ enterprise accounts in Retail, QSR, and BFSI verticals.",
    stack: ["FastAPI", "MySQL", "Redis", "Kubernetes", "Segcon API"],
  },
  {
    id: "one-consent",
    name: "OneConsent",
    category: "Enterprise Consent Management",
    size: "medium",
    problem: "Enterprises needed a unified, regulator-ready consent and preference management platform across all customer touchpoints.",
    built: "Policy engine (OPA) for consent rule evaluation. Audit-trail event store on ClickHouse. REST + webhook API for CRM/CDP integration.",
    outcome: "100+ enterprise clients onboarded within 3 months of GA launch.",
    stack: ["OPA", "ClickHouse", "FastAPI", "Kafka", "Azure", "Kubernetes"],
  },
  {
    id: "lpaas",
    name: "LPaaS",
    category: "Loyalty-Platform-as-a-Service",
    size: "small",
    problem: "Mid-market brands needed loyalty program infrastructure without building from scratch.",
    built: "Multi-tenant loyalty engine with configurable earn/burn rules, tiered membership, and real-time points processing via Kafka event stream.",
    outcome: "Reduced client time-to-loyalty-launch from 6 months to 4 weeks; adopted by Titan, Haldirams, and Thomas Cook.",
    stack: ["Kafka", "MySQL", "Redis", "FastAPI", "Kubernetes"],
  },
  {
    id: "logra",
    name: "Logra",
    category: "Analytics & Reporting Engine",
    size: "small",
    problem: "Clients needed self-serve analytics on loyalty, campaign, and commerce data — without writing SQL or raising BI tickets.",
    built: "Semantic query layer over ClickHouse + Redshift. Natural-language-to-SQL (RAG) pipeline reducing analyst query-to-insight time by 60%. Tableau + custom dashboards for executive reporting.",
    outcome: "60% reduction in query-to-insight time. Used by 100+ client analyst teams daily.",
    stack: ["ClickHouse", "AWS Redshift", "Airflow", "FastAPI", "LangGraph", "Gemini", "Tableau"],
  },
  {
    id: "mcp-gateway",
    name: "MCP Gateway",
    category: "Agentic Infrastructure",
    size: "medium",
    problem: "External AI agents (including Oliver AI) needed a secure, governed way to call Zence APIs as tools without bespoke integrations.",
    built: "Model Context Protocol (MCP) server exposing Zence APIs as structured tool definitions. OPA-enforced auth/authz per tool call. LiteLLM routing for model-agnostic agent support.",
    outcome: "Enabled Oliver AI and 3 other internal agents to self-serve Zence capabilities — zero custom integrations per agent.",
    stack: ["MCP", "LiteLLM", "OPA", "FastAPI", "Kubernetes", "Redis"],
  },
];

export const clients = [
  { name: "Bata", slug: "bata" },
  { name: "Burger King", slug: "burger-king" },
  { name: "Levi's", slug: "levis" },
  { name: "Titan", slug: "titan" },
  { name: "Haldiram's", slug: "haldirams" },
  { name: "Thomas Cook", slug: "thomas-cook" },
  { name: "PVR", slug: "pvr" },
  { name: "SRL", slug: "srl" },
];

export const skills = [
  {
    area: "Data Engineering",
    items: [
      "ClickHouse", "Apache Kafka", "Redpanda", "Apache Spark", "Polars",
      "Airflow", "Delta Lake", "Azure Synapse", "AWS Redshift", "MySQL", "MongoDB",
    ],
  },
  {
    area: "AI & GenAI",
    items: [
      "LangGraph", "LiteLLM", "MCP", "Vertex AI", "Gemini",
      "RAG Pipelines", "Sarvam AI", "Ozonetel", "Smallest.ai",
      "Churn Modelling", "Propensity Scoring",
    ],
  },
  {
    area: "Cloud & Infrastructure",
    items: [
      "Kubernetes", "Docker", "Azure", "AWS", "FastAPI",
      "Redis", "Celery", "OPA", "CI/CD", "Microservices",
    ],
  },
  {
    area: "Product & Leadership",
    items: [
      `${person.teamSize}-person squad leadership`, "P&L ownership", "0-to-1 product",
      "OKRs & roadmap", "Agile / squad model", "Enterprise SaaS GTM",
      "Vendor evaluation", "Executive presentations",
    ],
  },
];

export const experience = [
  {
    period: "Sep 2023 – Present",
    role: "AVP – Data Engineering, AI & Products",
    org: "Easyrewardz",
    location: "Gurugram",
    highlights: [
      `Leads a ${person.teamSize}-person cross-functional squad of data engineers, ML engineers, and product managers — reporting to CEO.`,
      "Owns product roadmap and P&L for the full Zence platform suite (CDP, Marketing, Commerce, Consent, Analytics).",
      "Launched Oliver AI (agentic commerce), MCP Gateway, and OneConsent — three 0-to-1 products in 18 months.",
      "Won Financial Express FuTech 2024 — Best Data Analytics Solution for Atlantis/Logra analytics platform.",
    ],
  },
  {
    period: "Oct 2017 – Aug 2023",
    role: "Senior Data Product Manager & Architect",
    org: "Easyrewardz",
    location: "Gurugram",
    highlights: [
      "Architected Zence CDP, Clix messaging engine (13B+ annual events), and Segcon real-time segmentation.",
      "Led cloud-native CDP migration from legacy on-prem, cutting infra cost by 35%.",
      "Designed Logra analytics layer; RAG pipeline reduced analyst query-to-insight time by 60%.",
      "Scaled Bata CDP to 8-country deployment; portfolio ARR grew from $5M to $12M.",
    ],
  },
  {
    period: "Jul 2015 – Sep 2017",
    role: "Data Analyst",
    org: "Home Credit India (PPF Group)",
    location: "Gurugram",
    highlights: [
      "Managed PII data infrastructure for 5M+ customer base.",
      "Owned 100+ operational analytics reports across 9 departments.",
      "Validated 250+ ETL processes; built credit risk and operations dashboards.",
    ],
  },
  {
    period: "Feb 2015 – Jul 2015",
    role: "Business & Data Analyst",
    org: "Droisys Inc.",
    location: "Gurugram",
    highlights: [
      "Delivered analytics services for major pharmaceutical organisations.",
      "Maintained 100+ Tableau visualisations and 3 large pharma databases.",
    ],
  },
  {
    period: "Jul 2012 – Feb 2015",
    role: "Data & Technology Analyst",
    org: "Allura Online (qurly.in)",
    location: "Gurugram",
    highlights: [
      "Optimised database systems for a 1M+ user base.",
      "Built B2B marketing analytics stack generating ₹5M in client revenue.",
    ],
  },
];

export const education = [
  {
    degree: "Post Graduate Diploma in Data Science",
    institution: "IMT Ghaziabad",
    period: "2019 – 2021",
    detail: "Machine Learning, Statistical Computing, Predictive Analytics, Data Visualisation.",
  },
  {
    degree: "B.Tech — Computer Science & Engineering",
    institution: "College of Engineering & Technology (CET)",
    period: "2008 – 2012",
    detail: "Database Systems, Algorithms, Distributed Computing, Software Engineering.",
  },
];

export const faq = [
  {
    q: "What does Kumar Ashutosh do?",
    a: `Kumar Ashutosh is AVP of Data Engineering, AI & Products at Easyrewardz. He leads a ${person.teamSize}-person cross-functional team — data engineers, ML engineers, and product managers — reporting directly to the CEO. He owns the product roadmap and P&L for the Zence platform suite.`,
  },
  {
    q: "What products has Kumar Ashutosh built?",
    a: "He has built and shipped 10 enterprise data and AI products: Oliver AI (agentic commerce, voice), Segcon (real-time customer segmentation), Model Studio (ML platform), Zence 360 (CDP), Zence Marketing (campaign automation), Zence Commerce (loyalty commerce), OneConsent (consent management), LPaaS (loyalty-as-a-service), Logra (analytics/RAG), and MCP Gateway (agentic infrastructure).",
  },
  {
    q: "What is Kumar Ashutosh's tech stack?",
    a: "Data: ClickHouse, Kafka, Redpanda, Spark, Polars, Airflow, Delta Lake, Azure Synapse, Redshift. AI/GenAI: LangGraph, LiteLLM, MCP, Vertex AI, Gemini, RAG pipelines, Sarvam AI, Ozonetel. Infra: Kubernetes, Docker, FastAPI, Redis, Celery, OPA. Product: 0-to-1 SaaS, OKRs, P&L ownership, squad model.",
  },
  {
    q: "How large is the team Kumar Ashutosh leads?",
    a: `Kumar Ashutosh leads a ${person.teamSize}-person cross-functional team of data engineers, ML engineers, and product managers at Easyrewardz.`,
  },
  {
    q: "What awards has Kumar Ashutosh won?",
    a: "Kumar Ashutosh won the Financial Express FuTech Awards 2024 — Best Data Analytics Solution — for the Atlantis/Logra analytics platform.",
  },
  {
    q: "What is the scale of data systems Kumar Ashutosh has built?",
    a: "He has built systems that serve 100M+ real-time customer profiles, process 13B+ events annually (3B SMS + 10B emails), and power ₹250M+ monthly marketing revenue for 100+ enterprise clients.",
  },
  {
    q: "What brands has Kumar Ashutosh's work served?",
    a: "His platforms serve Bata (8-country CDP), Burger King, Levi's, Titan, Haldiram's, Thomas Cook, PVR, SRL, and 100+ other enterprise retail, BFSI, and QSR brands.",
  },
  {
    q: "How can I contact or hire Kumar Ashutosh?",
    a: "The quickest way is to book a 30-minute call on Calendly or send a message through the contact page. Kumar is also on LinkedIn and GitHub.",
  },
  {
    q: "What does Kumar Ashutosh know about system design?",
    a: "Kumar Ashutosh designs event-driven and streaming systems at enterprise scale. His work includes a Kafka/Redpanda event evaluator with a ClickHouse profile store for sub-100ms segment reads (Segcon), Redis rate-limiting and Celery task queues in a journey orchestration engine (Zence Marketing), and a multi-tenant loyalty engine on Kafka event streams (LPaaS).",
  },
  {
    q: "What real-time data architecture has Kumar Ashutosh built?",
    a: "He built a streaming segmentation system that evaluates events on Kafka/Redpanda against 100M+ profiles and powers ₹250M+ in monthly client marketing revenue. His messaging platforms process 13B+ events annually, and Zence 360 uses Kafka for behavioral event streaming with Delta Lake for unified profile storage.",
  },
  {
    q: "What is Kumar Ashutosh's experience with customer data platforms (CDP)?",
    a: "He architected Zence 360, a cloud-native CDP that replaced a legacy on-prem stack, with identity resolution on Spark/Polars, Kafka event streaming and Delta Lake on Azure. It cut infrastructure cost by 35% and now manages 100M+ real-time customer profiles, including an 8-country deployment for Bata.",
  },
];
