---
name: realtime-risk
description: Use this skill for designing real-time or near real-time risk calculation streaming pipelines (e.g., intraday VaR, limit monitoring, real-time fraud).
appliesTo: data,pipeline,architecture
triggers: real-time,streaming,flink,kafka,intraday,实时风险计算
---

# Real-time Risk Calculation Skill

## Execution Guardrails
- **Latency & Throughput**: Always define explicit SLA requirements for processing latency (e.g., sub-second) and throughput (messages per second).
- **State Management**: Clearly define how state is managed (e.g., windowing, state TTL) and how late-arriving data is handled.
- **Resilience**: Ensure exactly-once processing semantics where critical (e.g., limit consumption), and design a robust replay/backfill mechanism.

## Workflow
1. **Topology Design**: Map the streaming topology (Source -> Parse -> Enrich -> Calculate -> Sink).
2. **State & Windowing**: Define the window strategies (Tumbling, Sliding, Session) and watermarking rules.
3. **Resource Configuration**: Recommend memory, CPU, and parallelism settings for the streaming engine (e.g., Flink, Spark Streaming).
4. **Monitoring**: Define specific metrics for Kafka lag, processing latency, and backpressure.

## Output Requirements
- Streaming Architecture Topology
- Event Schema & Data Contract
- Windowing & State TTL Configuration
- Performance & Resource Tuning Parameters
- Alerting & Monitoring Metrics
