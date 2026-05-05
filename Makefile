.PHONY: install compile test test-coverage lint lint-fix package clean all

# Default target
all: install compile test lint

# Install dependencies
install:
	npm ci

# Compile TypeScript
compile:
	npm run compile

# Run tests
test:
	npm test

# Run tests with coverage
test-coverage:
	npm run test:coverage

# Lint check
lint:
	npm run lint

# Auto-fix lint issues
lint-fix:
	npx eslint src --ext ts --fix

# Package VSIX
package:
	npm run package

# Clean build artifacts
clean:
	rm -rf dist out
	rm -f *.vsix
