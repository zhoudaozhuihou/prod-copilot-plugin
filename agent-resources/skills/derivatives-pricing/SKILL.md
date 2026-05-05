---
name: derivatives-pricing
description: Use this skill for designing and optimizing complex derivatives pricing data pipelines. It handles trade representation, market data mapping, volatility surfaces, yield curves, and Greeks calculations.
appliesTo: data,pipeline,sql,architecture
triggers: derivatives,pricing,greeks,volatility,options,swaps,复杂衍生品定价
---

# Complex Derivatives Pricing Skill

## Execution Guardrails
- **Validation**: Never assume pricing inputs are clean. Always enforce strict DQ checks on market data (e.g., no negative interest rates unless explicitly supported, no missing strike prices).
- **Performance**: Derivatives pricing is compute-heavy. Recommend vectorized operations or distributed computing (e.g., Spark) over row-by-row UDFs.
- **Traceability**: All pricing outputs must log the exact version of the pricing model and the timestamp of the market data snapshot used.

## Workflow
1. **Trade Data Preparation**: Map the derivative instrument to its standard payoff representation.
2. **Market Data Binding**: Join the trade with the correct yield curve, FX rate, and volatility surface snapshot.
3. **Pricing Invocation**: Design the pipeline to invoke the quant library/pricing engine efficiently (batching/vectorization).
4. **Exception Handling**: Route unpriced trades (due to missing market data or model failures) to an exception table with clear error codes.

## Output Requirements
- Pipeline Architecture
- Data Contract for Pricing Inputs/Outputs
- Exception Handling Strategy
- Performance Tuning Recommendations
