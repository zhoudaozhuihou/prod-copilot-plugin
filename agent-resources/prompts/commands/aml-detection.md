# AML Detection Prompt Template

Use this prompt to generate or review Anti-Money Laundering (AML) detection rules, SQL logic, or pipeline code.

## Requirements
1. **Rule Logic Validation**: Ensure the detection logic aligns with standard AML typologies (e.g., Structuring, Smurfing, Rapid Movement of Funds, High-Risk Jurisdictions).
2. **False Positive Reduction**: Implement secondary checks or thresholds to minimize false positive alerts.
3. **Data Privacy (GDPR/Local Regs)**: Ensure sensitive PII (e.g., customer names, exact addresses) is masked or tokenized during the analysis phase unless explicitly required for reporting.
4. **Audit Trail (BCBS 239)**: Ensure all score calculations and flag triggers are logged with exact timestamps and data lineage for regulatory audit.
5. **Performance**: AML queries often run against massive transaction tables. Ensure partitioning, indexing, and window function efficiency.

## Expected Output
- **Business Rule Description**: Clear explanation of the AML typology.
- **SQL / Pipeline Logic**: The implementation code.
- **Performance Tuning**: Explain indexing and execution plan considerations.
- **Compliance Check**: Verification against GDPR and BCBS 239.
