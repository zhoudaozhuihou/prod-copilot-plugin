# 使用规则

本文档定义 `@product-dev` 插件在公司内部使用时的基本规则。

## 1. 总原则

1. 先初始化，再生成方案。
2. 先补充背景，再让 AI 生成正式交付物。
3. 先加载本地 Policy Pack，再执行 DQ、门禁、隐私、发布等强规则命令。
4. 所有重要输出必须落地为文件，方便 Git Review。
5. 所有 AI 输出必须经过人工确认后才能用于正式交付。

## 2. 推荐顺序

### 全流程

```text
/init → /policy-init → /policy-intake → /policy-scan → /intake → /context → /plan → 业务命令 → /quality → /review → /release → /runbook
```

### 数据开发

```text
/init data → /policy-scan → /intake → /context → /plan → /data → /datacontract → /sttm → /dbschema → /sql → /dq → /reconcile → /lineage → /pipeline → /scheduler → /data-test → /privacy → /data-review → /release → /runbook
```

### 前端开发

```text
/init frontend → /brainstorm → /feature → /prd → /journey → /frontend → /test → /quality → /review → /release
```

### 后端开发

```text
/init backend → /prd → /api → /backend → /springboot 或 /python → /test → /quality → /review → /release
```

## 3. 输入规则

用户在命令中应尽量提供：

- 业务目标
- 用户角色
- 技术栈
- 当前系统边界
- 数据库类型
- 数据源和目标表
- SLA / DQ / 对账 / 血缘 / 隐私要求
- 公司或部门已有规范文件位置
- 当前风险和未决问题

## 4. Policy Pack 规则

如果涉及以下内容，不建议让 AI 自行猜测：

- DQ 阈值
- 上线门禁
- 发布审批要求
- 隐私等级
- 脱敏策略
- 命名规范
- 数据保留期
- 审计要求
- 国家或地区监管要求

这些内容应写入：

```text
.product-dev/policy-packs/
```

## 5. 数据开发强制规则

1. SQL 必须明确主表和 Join 粒度。
2. 金额、交易、余额类数据必须考虑对账。
3. Pipeline 必须说明幂等、回补、重跑、失败处理。
4. 数据契约必须说明字段含义、类型、nullable、敏感等级、SLA。
5. DQ 必须尽量提供可执行 SQL。
6. 数据上线必须有 Runbook。

## 6. 禁止事项

- 不要提交真实密钥、token、证书。
- 不要提交客户真实明文数据样本。
- 不要让 AI 在没有 Policy Pack 的情况下决定监管或合规阈值。
- 不要把 AI 生成内容直接用于生产上线，必须人工 Review。
- 不要在没有版本控制的目录里沉淀重要交付文档。

## 7. 交付物版本化

建议提交以下内容：

```text
docs/
.product-dev/config.yaml
.product-dev/policy-packs/**
```

建议不提交：

```text
.product-dev/*.local.json
.env
*.key
*.pem
node_modules/
dist/
```
