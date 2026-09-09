import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface MetaConfig {
  title: string;
  description?: string;
  canonical?: string;
}

const ROUTE_META_MAP: Record<string, MetaConfig> = {
  '/': {
    title: 'SkillSetu – Sovereign National Skill Harmonization & Cryptographic Attestation Platform',
    description: "India's sovereign AI-driven skill harmonization, NCrF-aligned cryptographic attestation, and zero-knowledge competency ledger platform connecting students, academicians, and recruiters.",
  },
  '/login': {
    title: 'Sign In | SkillSetu Sovereign Portal',
    description: 'Secure, zero-trust authentication portal for Students, Recruiter Organizations, and Academic Institutions.',
  },
  '/register': {
    title: 'Register Institutional Account | SkillSetu',
    description: 'Create an institutional or student account on SkillSetu aligned with NCrF standards and DPDP Act compliance.',
  },
  '/student': {
    title: 'Student Harmonization Hub | SkillSetu',
    description: 'Unified student dashboard featuring NCrF verified credits, competency radar, and cryptographic credentials.',
  },
  '/student/skills': {
    title: 'Verified Competencies & Skills | SkillSetu',
    description: 'Granular view of your cryptographic skill ledger, verified proficiency, and AI-recommended learning paths.',
  },
  '/student/recommendations': {
    title: 'AI Career & Skill Recommendations | SkillSetu',
    description: 'Predictive intelligence matching your verified capability matrix against national high-growth industry demands.',
  },
  '/student/opportunities': {
    title: 'Verified Opportunities & Internships | SkillSetu',
    description: 'Direct corporate internships and apprenticeships with verified credit transfer and zero-bias matching.',
  },
  '/student/applications': {
    title: 'Application Tracking | SkillSetu',
    description: 'Real-time status tracking for corporate apprenticeship and internship applications.',
  },
  '/student/learning': {
    title: 'Curated Learning & Gap Remediation | SkillSetu',
    description: 'AI-curated micro-credentials, SWAYAM/NPTEL modules, and verified assessment paths.',
  },
  '/student/assessment': {
    title: 'Proctored Skill Assessment Suite | SkillSetu',
    description: 'Timed skill assessment quizzes with automated attestation and digital credential verification.',
  },
  '/student/portfolio': {
    title: 'Cryptographic Skill Portfolio | SkillSetu',
    description: 'Publicly verifiable digital identity portfolio with SHA-256 verifiable credentials and QR verification.',
  },
  '/student/mentorship': {
    title: 'Industry & Academic Mentorship | SkillSetu',
    description: 'Connect with verified industry veterans and academic guides for tailored career acceleration.',
  },
  '/student/analytics': {
    title: 'Student Skill Analytics | SkillSetu',
    description: 'Deep-dive metrics into your skill growth trajectory, peer percentile benchmarks, and learning velocity.',
  },
  '/student/onboarding': {
    title: 'Student Onboarding & DPDP Consent | SkillSetu',
    description: 'Automated resume synthesis, skill extraction, and sovereign DPDP Act compliance consent flow.',
  },
  '/student/notifications': {
    title: 'Student Alerts & Verification Notices | SkillSetu',
    description: 'Real-time ledger audit notifications, application updates, and credential issuance alerts.',
  },
  '/recruiter': {
    title: 'Enterprise Recruiter Terminal | SkillSetu',
    description: 'Zero-bias talent discovery, cryptographic credential validation, and direct candidate hiring pipeline.',
  },
  '/recruiter/applications': {
    title: 'Candidate Applications & Verification | SkillSetu',
    description: 'Review candidate dossiers with verified ledger proofs, test credentials, and automated shortlisting.',
  },
  '/recruiter/post': {
    title: 'Post Verified Role or Apprenticeship | SkillSetu',
    description: 'Publish industry roles with granular skill requirements mapped to NCrF standard competencies.',
  },
  '/recruiter/interviews': {
    title: 'Interview & Evaluation Scheduler | SkillSetu',
    description: 'Coordinate evaluation slots, technical interviews, and automated candidate communications.',
  },
  '/recruiter/analytics': {
    title: 'Talent Pipeline Analytics | SkillSetu',
    description: 'Enterprise skill demand velocity, candidate yield rates, and hiring funnel benchmarks.',
  },
  '/recruiter/notifications': {
    title: 'Recruiter Communications & Dispatch | SkillSetu',
    description: 'Instant notification feed for new candidate submissions and interview confirmations.',
  },
  '/academician': {
    title: 'Academic Leadership Terminal | SkillSetu',
    description: 'Institutional dashboard for student skill distribution, syllabus-industry parity, and NEP 2020 compliance.',
  },
  '/academician/consultancies': {
    title: 'Corporate Consultancies & Industry Exchange | SkillSetu',
    description: 'Bridge faculty expertise with enterprise R&D challenges and industry consultancies.',
  },
  '/academician/students': {
    title: 'Enrolled Students & Attestation Roster | SkillSetu',
    description: 'Review departmental cohorts, attestation status, and institutional credit endorsements.',
  },
  '/academician/training': {
    title: 'Faculty Development & Training Programs | SkillSetu',
    description: 'Advanced pedagogical workshops, emerging tech certifications, and corporate sabbaticals.',
  },
  '/academician/mentorship': {
    title: 'Student Mentorship Directory | SkillSetu',
    description: 'Monitor mentee progress, approve capstone deliverables, and guide academic careers.',
  },
  '/academician/analytics': {
    title: 'Institutional Competency Analytics | SkillSetu',
    description: 'Macro-level academic attainment charts, placement readiness, and curriculum parity metrics.',
  },
  '/academician/notifications': {
    title: 'Institutional Notices & Attestation Requests | SkillSetu',
    description: 'Faculty advisories, departmental requests, and credential verification queues.',
  },
  '/admin': {
    title: 'National Governance & Audit Console | SkillSetu',
    description: 'Super-admin monitoring for system health, ledger integrity, institutional onboarding, and compliance.',
  },
  '/admin/users': {
    title: 'User & Organization Registry | SkillSetu',
    description: 'Manage verified student accounts, corporate recruiter entities, and accredited higher education institutions.',
  },
  '/admin/opportunities': {
    title: 'National Opportunity Registry | SkillSetu',
    description: 'Audit active corporate vacancies, apprenticeships, and credit-bearing internships.',
  },
  '/admin/applications': {
    title: 'National Application Audits | SkillSetu',
    description: 'System-wide application flows, affirmative action auditing, and placement telemetry.',
  },
  '/admin/training': {
    title: 'Accredited Training Frameworks | SkillSetu',
    description: 'National faculty enablement frameworks and institutional development programs.',
  },
  '/admin/skills': {
    title: 'National Skill Taxonomy Registry | SkillSetu',
    description: 'Standardized skill ontology aligned with NCrF, NSQF, and international standard classifications.',
  },
  '/admin/notifications': {
    title: 'System-Wide Governance Dispatch | SkillSetu',
    description: 'Platform broadcast dispatches, cryptographic audit alerts, and security telemetry.',
  },
  '/404': {
    title: '404 - Resource Not Found | SkillSetu Sovereign Platform',
    description: 'The requested resource could not be located on the sovereign SkillSetu network.',
  }
};

/**
 * Hook to automatically synchronize document title, meta description, and canonical link
 * based on current route or custom overrides.
 */
export function usePageMeta(customConfig?: Partial<MetaConfig>) {
  const location = useLocation();

  useEffect(() => {
    const matched = ROUTE_META_MAP[location.pathname] || {
      title: 'SkillSetu – National Skill Harmonization Platform',
      description: "India's sovereign AI-driven skill harmonization, NCrF-aligned cryptographic attestation, and competency ledger platform.",
    };

    const title = customConfig?.title || matched.title;
    const description = customConfig?.description || matched.description;
    const canonical = customConfig?.canonical || `https://skillsetu.gov.in${location.pathname}`;

    // Set page title
    document.title = title;

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    if (description) {
      metaDesc.setAttribute('content', description);
    }

    // Set canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // Set OpenGraph title and url
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonical);

  }, [location.pathname, customConfig?.title, customConfig?.description, customConfig?.canonical]);
}

/**
 * Global component that binds route changes to head metadata
 */
export function PageMetaTracker() {
  usePageMeta();
  return null;
}
