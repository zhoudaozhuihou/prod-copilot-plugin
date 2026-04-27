# Policy Pack Guide

Policy Pack 用于承载每个公司、部门、国家、项目和环境不同的规则。

## 1. 为什么需要 Policy Pack

DQ 规则、质量门禁、隐私规则、命名规范、发布审批、国家监管要求在不同组织中差异很大。插件不应把这些规则写死，而应该从 repo 的本地规则目录读取。

## 2. 目录结构

```text
.product-dev/policy-packs/
  global/
  company/
  department/
  country/
  project/
  environment/
    dev/
    uat/
    prod/
```

## 3. 优先级

```text
global < company < department < country < project < environment
```

后面的层覆盖前面的层。

## 4. 推荐文件

| 文件 | 用途 |
|---|---|
| `dq-rules.yaml` | 数据质量规则、阈值、失败等级 |
| `quality-gates.yaml` | 代码/API/数据/发布门禁 |
| `security-standard.yaml` | 权限、鉴权、日志、安全要求 |
| `privacy-standard.yaml` | PII/SPI、脱敏、保留期 |
| `sql-standard.yaml` | SQL 风格、Join、性能规则 |
| `data-contract-standard.yaml` | 数据契约规范 |
| `sttm-standard.md` | Source-to-Target Mapping 模板 |
| `reconciliation-standard.yaml` | 对账规则 |
| `lineage-standard.yaml` | 血缘要求 |
| `scheduler-standard.yaml` | 调度、SLA、告警规则 |
| `release-gates.yaml` | 上线门禁 |
| `runbook-standard.md` | 生产运维手册规范 |
| `review-checklist.md` | Review 清单 |
| `business-glossary.md` | 业务术语表 |

## 5. 示例 DQ 规则

```yaml
rules:
  completeness:
    requiredFields:
      - customer_id
      - business_date
      - transaction_amount
    defaultThreshold: 0.999
  uniqueness:
    keys:
      - transaction_id
  freshness:
    maxDelayMinutes: 60
  reconciliation:
    amountTolerance: 0.01
    countTolerance: 0
severity:
  blocker:
    - primary key duplicate
    - amount reconciliation failed
  high:
    - freshness SLA breached
```

## 6. 示例发布门禁

```yaml
gates:
  prod:
    requireDataContract: true
    requireDQSql: true
    requireReconciliation: true
    requireLineage: true
    requirePrivacyAssessment: true
    requireRollbackPlan: true
    requireRunbook: true
    requireOwnerApproval: true
```

## 7. 检查流程

```text
@product-dev /policy-init
@product-dev /policy-intake
@product-dev /policy-scan
@product-dev /policy-review
```

## 8. 版本控制建议

建议提交规则模板和非敏感规则：

```text
.product-dev/policy-packs/**
```

不建议提交：

```text
*.local.json
.env
*.key
*.pem
真实客户样本数据
```
