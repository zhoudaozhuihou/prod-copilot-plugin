# Credit Risk Assessment Prompt Template

Use this prompt to generate or review Credit Risk (e.g., ECL, PD, LGD, EAD) calculation pipelines and models.

## Requirements
1. **Accuracy & Interpretability**: Credit models must be explainable. Ensure all formulas and risk weightings are documented inline.
2. **Data Lineage (BCBS 239)**: Traceability from raw exposure data to final risk weighted assets (RWA) is mandatory.
3. **Data Quality Checks**: Ensure there are hard stops for missing collateral values, invalid ratings, or negative exposures.
4. **Historical Backtesting**: Logic must support backtesting against historical defaults.
5. **Stress Testing Support**: Logic must allow parameterized inputs for macroeconomic stress scenarios.

## Expected Output
- **Model Definition**: Clear explanation of the credit risk components.
- **SQL / Pipeline Logic**: The implementation code for exposure aggregation and risk calculation.
- **Data Quality Gates**: Specific rules to halt processing if input data is corrupt.
- **Compliance Check**: Verification against Basel III/IV and BCBS 239 reporting standards.
