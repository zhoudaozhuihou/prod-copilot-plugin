# GCP 数据平台开发流程适配与迁移方案 (GCP Data Platform Adaptation Plan)

## 1. 传统架构与 GCP 云原生架构的差异分析及选型映射

在向 Google Cloud Platform (GCP) 迁移或进行开发时，必须将传统的组件和思维方式映射到云原生全托管服务：

| 传统数据架构领域 | GCP 云原生组件选型 | 技术选型依据与改造点 |
| :--- | :--- | :--- |
| **数据湖 / 原始存储** | **Cloud Storage (GCS)** | 替代 HDFS。改造点：需规划 GCS Bucket 层级（Raw, Curated），利用 Object Lifecycle 自动归档至 Coldline/Archive 降低成本。 |
| **数据仓库 / 核心计算** | **BigQuery (BQ)** | 替代 Hive/Teradata/Greenplum。改造点：Serverless 架构，无索引概念。必须通过 **Partitioning (分区)** 和 **Clustering (聚簇)** 提升查询性能并控制扫描成本。支持嵌套数组（STRUCT/ARRAY）以减少复杂 JOIN。 |
| **流批一体数据管道** | **Dataflow (Apache Beam)** | 替代传统 Flink/Storm 集群。改造点：采用 Apache Beam 编写 Pipeline，实现流批一体，利用其自动扩缩容（Autoscaling）特性，无需手动管理节点。 |
| **Hadoop/Spark 迁移** | **Dataproc** | 若有历史遗留的 Spark/Hadoop 任务难改写，采用 Dataproc 运行瞬态集群（Job 结束即销毁集群），切忌保留常驻集群。 |
| **任务调度与编排** | **Cloud Composer (Airflow)** | 替代传统调度器（如 Oozie/DolphinScheduler）。改造点：编写 Airflow DAGs，使用 GCP 专有 Operators（如 `BigQueryInsertJobOperator`）。 |
| **消息队列与实时摄入** | **Pub/Sub** | 替代 Kafka。改造点：全托管，自动扩容，直接与 Dataflow 原生集成。 |

---

## 2. 核心调整环节与实施步骤

### 2.1 计算资源与成本控制机制 (Cost Management)
*   **BigQuery 成本控制**: BQ 默认按扫描数据量计费（On-demand）。
    *   **规范**: 所有 BQ 查询前必须通过 `dry-run` 评估数据量。
    *   **改造**: 对于高频大规模跑批，从按需计费切换为 **BigQuery Capacity Pricing (Slots 预留)**。
*   **预算与告警**: 在 GCP Billing 中设置严格的 Budget Alerts，结合 Pub/Sub 触发 Cloud Functions 在超出阈值时阻断查询。

### 2.2 权限与安全策略配置 (IAM & Security)
*   **访问控制**: 抛弃传统数据库的用户/密码模型。
    *   应用级：为每个 Pipeline 分配独立的 **Service Account (SA)**，遵循最小权限原则（Principle of Least Privilege）。
    *   用户级：结合 Google Workspace，通过 Google Groups 赋予 `roles/bigquery.dataViewer` 等 IAM 角色。
*   **敏感数据保护 (PII/合规)**: 
    *   利用 **Data Catalog & Policy Tags** 实现 BigQuery 列级别访问控制 (Column-level security)。
    *   落地数据使用 **Cloud KMS** 提供 CMEK (客户管理的加密密钥) 加密。

### 2.3 CI/CD 流水线改造 (DevOps)
*   **基础设施即代码 (IaC)**: 使用 Terraform 管理 BQ Datasets, GCS Buckets, 和 IAM Bindings。
*   **代码部署**: 
    *   Cloud Composer DAGs 经 GitLab CI / GitHub Actions 自动同步至对应的 GCS DAG 目录。
    *   Dataflow 模板通过 CI 打包上传并更新至 Artifact Registry。
*   **自动化测试**: 引入 `dbt` (Data Build Tool) 进行 BigQuery SQL 的转换、版本控制和自动化数据测试。

---

## 3. 实施计划与里程碑 (Milestones)

| 阶段 | 交付物 | 验收标准 |
| :--- | :--- | :--- |
| **Phase 1: 基础设施与安全基线建设** | Terraform 脚本, IAM 矩阵, 基础网络设置 | 成功通过安全审计，CMEK 与 Policy Tags 配置完毕。 |
| **Phase 2: 核心数据仓库设计** | BQ 逻辑模型, Partition/Cluster 规范文档 | 数据成功入湖(GCS)，核心事实表具备时间分区和业务聚簇。 |
| **Phase 3: 管道迁移与流批处理构建** | Dataflow 代码, Composer DAG 脚本 | Pipeline 能够自动化处理历史全量与每日增量数据。 |
| **Phase 4: 成本与监控大盘接入** | 计费告警阈值配置, Cloud Monitoring 看板 | 系统运行产生第一笔计费后，成本偏差在预测值的 10% 以内。 |

---

## 4. 迁移风险评估与回滚策略

*   **风险 1：BigQuery 查询成本失控**
    *   *应对*: 强制要求所有建表必须设置 `require_partition_filter = true`，禁止全表扫描。
*   **风险 2：云原生调度不兼容**
    *   *应对*: 评估原有 Bash/Python 调度逻辑，重构为 Airflow Python 算子。
*   **回滚策略 (Rollback Strategy)**:
    *   采用 **双轨运行 (Dual-Run)** 策略。新 GCP 平台与旧系统并行跑批 1 个月，通过 `@product-dev /reconcile` 生成每日对账报告。一旦发现数据口径异常，立即将下游 BI / API 消费端切回旧系统。
