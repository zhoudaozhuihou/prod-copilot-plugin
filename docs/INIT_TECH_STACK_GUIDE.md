# `/init` 技术栈驱动初始化指南

## 目标

`@product-dev /init` 必须根据用户输入的技术栈精确生成项目结构，而不是生成所有可能的前端、后端和数据目录。

## 核心规则

1. 用户输入 Java / Spring Boot，只生成 `backend/java-springboot/`。
2. 用户输入 Python / FastAPI，只生成 `backend/python-fastapi/`。
3. 用户输入 PostgreSQL，只生成 `data/sql/postgresql/`。
4. 用户没有明确说明技术栈时，不猜测，不生成多套结构；只生成 `_decision-required` 文件和问题清单。
5. Copilot / opencode 文件必须包含“不要生成未选择技术栈”的规则。

## 示例

```text
@product-dev /init fullstack react springboot postgresql copilot opencode
```

会生成：

```text
frontend/react/
backend/java-springboot/
data/sql/postgresql/
.github/
.opencode/
AGENTS.md
.product-dev/
docs/
```

不会生成：

```text
backend/python-fastapi/
backend/python-flask/
data/sql/oracle/
data/sql/bigquery/
data/sql/maxcompute/
```

## 模糊输入

```text
@product-dev /init backend
```

只生成：

```text
backend/_decision-required/README.md
```

并在 `docs/00-intake/PROJECT_BACKGROUND_QUESTIONNAIRE.md` 中要求用户补充后端技术栈。

## 推荐顺序

```text
@product-dev /init fullstack react springboot postgresql copilot opencode
@product-dev /intake
@product-dev /context <补充背景>
@product-dev /policy-intake
@product-dev /policy-scan
@product-dev /plan
```
