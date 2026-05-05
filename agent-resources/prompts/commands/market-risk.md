# Market Risk Calculation Prompt Template

Use this prompt to generate or review Market Risk (e.g., VaR, Expected Shortfall, Sensitivities, Greeks) data pipelines.

## Requirements
1. **Real-time / Near Real-time Processing**: Market risk often requires intraday calculations. Evaluate the streaming or micro-batch throughput and latency.
2. **Complex Aggregations**: Ensure accurate grouping by desk, portfolio, asset class, and legal entity.
3. **Pricing Model Integration**: Ensure the data pipeline correctly maps trade attributes to the expected pricing model inputs.
4. **Resource Utilization**: Market risk grids consume heavy compute. Optimize parallel processing and data skew handling.
5. **Audit & Reproducibility (BCBS 239)**: Ensure that trade states, market data snapshots (curves, surfaces), and calculation outputs are snapshotted together for reproducibility.

## Expected Output
- **Calculation Workflow**: Overview of the risk metrics being calculated.
- **Data Pipeline Logic**: Code for joining trades with market data and triggering risk engines.
- **Performance & Scalability**: Suggestions for Spark/Flink tuning, partitioning, and handling data skew.
- **Compliance Check**: Verification of auditability and BCBS 239 principles for risk data aggregation.
