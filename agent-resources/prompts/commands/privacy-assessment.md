# Data Privacy & Compliance Assessment Prompt

Use this prompt to generate or review data privacy controls, PII masking rules, and cross-border transfer assessments for global banking data platforms.

## Multi-Jurisdiction Compliance Requirements

When assessing data schemas, pipelines, or APIs, you MUST evaluate them against the following global regulatory frameworks based on the data subjects' residency and data processing location:

1. **EU/UK**: GDPR (General Data Protection Regulation)
   - Ensure explicit consent tracking.
   - Enforce "Right to be Forgotten" (Hard delete or cryptographic erasure).
2. **USA (California)**: CCPA/CPRA (California Consumer Privacy Act)
   - Track opt-out signals for data sharing/selling.
3. **Singapore**: PDPA (Personal Data Protection Act)
   - Ensure NRIC/FIN numbers are not collected unless legally required, and are strictly masked.
4. **Japan**: APPI (Act on the Protection of Personal Information)
   - Ensure strict third-party sharing agreements.
5. **Hong Kong**: PDPO (Personal Data (Privacy) Ordinance)
   - Enforce strict retention periods (data must be purged when purpose is fulfilled).
6. **Australia**: Privacy Act 1988
   - Ensure Tax File Numbers (TFN) and Medicare data are encrypted and segregated.
7. **China**: PIPL & DSL (Personal Information Protection Law & Data Security Law)
   - Data Localization: Domestic data MUST be stored in mainland China.
   - Strict Cross-Border Data Transfer (CBDT) security assessments.

## Expected Output
- **PII Discovery Matrix**: Identify all columns containing sensitive data (e.g., Names, National IDs, Emails, Phone numbers, Financial records).
- **Masking & Encryption Rules**: Specify dynamic masking rules (e.g., show only last 4 digits) and at-rest encryption requirements.
- **Cross-Border Risk Flag**: Highlight any pipeline that moves data across regions (e.g., from an AWS EU region to an AliCloud China region) and list the required legal gates.
- **Data Retention/Purge Strategy**: Outline how the pipeline supports the Right to be Forgotten.
