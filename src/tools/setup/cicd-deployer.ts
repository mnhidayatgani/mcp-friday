/**
 * CI/CD Deployer
 * Automatically sets up CI/CD pipeline for user projects
 */

import * as fs from "fs/promises";
import * as path from "path";

interface CICDConfig {
  platform: "github" | "gitlab" | "bitbucket";
  features: {
    lint: boolean;
    test: boolean;
    build: boolean;
    deploy: boolean;
    security: boolean;
    codeReview: boolean;
  };
  projectType: string;
}

interface DeploymentResult {
  created: string[];
  configured: string[];
  instructions: string[];
}

export class CICDDeployer {
  private projectRoot: string;
  private config: CICDConfig;

  constructor(projectRoot: string, projectType: string) {
    this.projectRoot = projectRoot;
    this.config = {
      platform: "github",
      features: {
        lint: true,
        test: true,
        build: true,
        deploy: false,
        security: true,
        codeReview: true,
      },
      projectType,
    };
  }

  /**
   * Deploy CI/CD configuration
   */
  async deploy(): Promise<DeploymentResult> {
    const result: DeploymentResult = {
      created: [],
      configured: [],
      instructions: [],
    };

    try {
      // Create .github/workflows directory
      const workflowsDir = path.join(this.projectRoot, ".github/workflows");
      await fs.mkdir(workflowsDir, { recursive: true });

      // Deploy CI/CD pipeline
      if (this.config.features.test || this.config.features.build) {
        await this.deployCIPipeline(workflowsDir, result);
      }

      // Deploy code review workflow
      if (this.config.features.codeReview) {
        await this.deployCodeReview(workflowsDir, result);
      }

      // Deploy PR template
      await this.deployPRTemplate(result);

      // Deploy auto-labeler
      await this.deployLabeler(result);

      // Generate instructions
      this.generateInstructions(result);

    } catch {
      // CI/CD deployment is optional
    }

    return result;
  }

  /**
   * Deploy CI/CD pipeline
   */
  private async deployCIPipeline(workflowsDir: string, result: DeploymentResult): Promise<void> {
    const pipelineContent = this.generateCIPipeline();
    const pipelinePath = path.join(workflowsDir, "ci-cd.yml");

    await fs.writeFile(pipelinePath, pipelineContent, "utf-8");
    result.created.push(".github/workflows/ci-cd.yml");
  }

  /**
   * Deploy code review workflow
   */
  private async deployCodeReview(workflowsDir: string, result: DeploymentResult): Promise<void> {
    const reviewContent = this.generateCodeReviewWorkflow();
    const reviewPath = path.join(workflowsDir, "code-review.yml");

    await fs.writeFile(reviewPath, reviewContent, "utf-8");
    result.created.push(".github/workflows/code-review.yml");
  }

  /**
   * Deploy PR template
   */
  private async deployPRTemplate(result: DeploymentResult): Promise<void> {
    const templateContent = this.generatePRTemplate();
    const templatePath = path.join(this.projectRoot, ".github/pull_request_template.md");

    await fs.writeFile(templatePath, templateContent, "utf-8");
    result.created.push(".github/pull_request_template.md");
  }

  /**
   * Deploy auto-labeler
   */
  private async deployLabeler(result: DeploymentResult): Promise<void> {
    const labelerContent = this.generateLabelerConfig();
    const labelerPath = path.join(this.projectRoot, ".github/labeler.yml");

    await fs.writeFile(labelerPath, labelerContent, "utf-8");
    result.created.push(".github/labeler.yml");
  }

  /**
   * Generate CI/CD pipeline configuration
   */
  private generateCIPipeline(): string {
  // Project types 'node', 'web', 'api' are supported by default

    return `name: CI/CD Pipeline

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master, develop ]

jobs:
  lint:
    name: Lint Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run lint
        run: npm run lint --if-present || echo "No lint script"

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test --if-present
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
        continue-on-error: true

  build:
    name: Build Project
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build --if-present

  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
`;
  }

  /**
   * Generate code review workflow
   */
  private generateCodeReviewWorkflow(): string {
    return `name: Code Review Assistant

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    name: Automated Review
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: PR Size Check
        run: |
          FILES=\$(git diff --name-only origin/\${{ github.base_ref }}...HEAD | wc -l)
          echo "## PR Statistics" >> $GITHUB_STEP_SUMMARY
          echo "Files changed: $FILES" >> $GITHUB_STEP_SUMMARY
          
          if [ $FILES -gt 50 ]; then
            echo "⚠️ Large PR - consider splitting" >> $GITHUB_STEP_SUMMARY
          fi
      
      - name: Check for TODO/FIXME
        run: |
          TODOS=\$(git diff origin/\${{ github.base_ref }}...HEAD | grep -i "TODO\\|FIXME" || true)
          if [ -n "$TODOS" ]; then
            echo "## ⚠️ TODOs Found" >> $GITHUB_STEP_SUMMARY
            echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
            echo "$TODOS" >> $GITHUB_STEP_SUMMARY
            echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
          fi

  dependency-review:
    name: Dependency Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Dependency Review
        uses: actions/dependency-review-action@v3
        continue-on-error: true
`;
  }

  /**
   * Generate PR template
   */
  private generatePRTemplate(): string {
    return `## Description
<!-- Describe your changes -->

## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change
- [ ] 📝 Documentation
- [ ] ♻️ Refactor

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings

## Testing
<!-- Describe how you tested -->

## Screenshots (if applicable)
`;
  }

  /**
   * Generate labeler configuration
   */
  private generateLabelerConfig(): string {
    return `'type: documentation':
  - '**/*.md'
  - 'docs/**/*'

'type: tests':
  - 'tests/**/*'
  - '**/*.test.*'
  - '**/*.spec.*'

'type: build':
  - 'package.json'
  - 'package-lock.json'
  - '*config.*'

'type: ci':
  - '.github/workflows/**/*'

'size: small':
  - any: ['**/*']
    count: 1..10

'size: large':
  - any: ['**/*']
    count: 21..100
`;
  }

  /**
   * Generate setup instructions
   */
  private generateInstructions(result: DeploymentResult): void {
    result.instructions.push("");
    result.instructions.push("📋 CI/CD SETUP COMPLETE");
    result.instructions.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    result.instructions.push("");
    result.instructions.push("✅ Created:");
    result.created.forEach(file => {
      result.instructions.push(`   - ${file}`);
    });
    result.instructions.push("");
    result.instructions.push("🔧 Next Steps:");
    result.instructions.push("   1. Commit these files to your repository");
    result.instructions.push("   2. Push to GitHub to trigger first workflow");
    result.instructions.push("   3. Check Actions tab for pipeline status");
    result.instructions.push("");
    result.instructions.push("📊 Features Enabled:");
    if (this.config.features.lint) result.instructions.push("   ✅ Linting");
    if (this.config.features.test) result.instructions.push("   ✅ Testing");
    if (this.config.features.build) result.instructions.push("   ✅ Build verification");
    if (this.config.features.security) result.instructions.push("   ✅ Security audit");
    if (this.config.features.codeReview) result.instructions.push("   ✅ Automated code review");
    result.instructions.push("");
  }

  /**
   * Generate deployment report
   */
  generateReport(result: DeploymentResult): string[] {
    const report: string[] = [];

    report.push("");
    report.push("🚀 CI/CD DEPLOYMENT");
    report.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    report.push("");

    if (result.created.length > 0) {
      report.push(`📁 Created ${result.created.length} file(s):`);
      result.created.forEach(file => {
        report.push(`   ✅ ${file}`);
      });
      report.push("");
    }

    report.push(...result.instructions);

    return report;
  }
}
