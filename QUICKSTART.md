# Quickstart

本文件用于团队成员第一次使用 `@product-dev` 插件。

## 1. 安装依赖

```bash
npm install
npm run compile
```

## 2. 启动调试

在 VS Code 中打开项目，按 `F5` 启动 Extension Development Host。

## 3. 打开 Copilot Chat

输入：

```text
@product-dev /help
```

确认命令可用。

## 4. 初始化项目

### 全栈项目

```text
@product-dev /init fullstack
```

### 只做前端

```text
@product-dev /init frontend
```

### 只做后端

```text
@product-dev /init backend
```

### 只做银行数据开发

```text
@product-dev /init data
```

## 5. 补充项目背景

```text
@product-dev /intake
```

阅读并填写：

```text
docs/00-intake/PROJECT_BACKGROUND_QUESTIONNAIRE.md
```

然后把答案交给：

```text
@product-dev /context <粘贴你的项目背景答案>
```

## 6. 加载公司/部门/国家规则

```text
@product-dev /policy-init
@product-dev /policy-intake
```

编辑：

```text
.product-dev/policy-packs/
```

再执行：

```text
@product-dev /policy-scan
@product-dev /policy-review
```

## 7. 生成执行计划

```text
@product-dev /plan
```

## 8. 按计划推进

数据开发常用链路：

```text
@product-dev /data
@product-dev /datacontract
@product-dev /sttm
@product-dev /sql
@product-dev /dq
@product-dev /reconcile
@product-dev /lineage
@product-dev /pipeline
@product-dev /scheduler
@product-dev /data-test
@product-dev /privacy
@product-dev /data-review
@product-dev /release
@product-dev /runbook
```

## 9. 长任务循环

```text
@product-dev /loop 为当前项目完成从需求到发布的数据开发交付闭环
@product-dev /loop-status
@product-dev /loop-next
```

## 10. 常用工具命令

```text
@product-dev /prompt <优化一个 prompt>
@product-dev /summarize <总结内容>
@product-dev /compress <压缩上下文>
@product-dev /doc-review <评审文档>
@product-dev /rewrite <改写内容>
@product-dev /checklist <生成检查清单>
```
