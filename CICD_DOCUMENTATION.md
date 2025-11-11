# CI/CD & Code Review System

## Overview

FRIDAY MCP now includes enterprise-grade CI/CD and code review automation for both this project and user projects.

## For This Project

### GitHub Actions Workflows

#### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

**Lint Job:**
- ESLint check
- TypeScript compilation (`tsc --noEmit`)
- Code style verification

**Test Job:**
- Multi-version testing (Node 18 & 20)
- Full test suite execution
- Playwright browser tests
- Coverage reporting to Codecov

**Build Job:**
- Dependency on lint & test
- Build verification
- Artifact validation

**Security Job:**
- NPM audit (high severity threshold)
- Vulnerability scanning
- Continuous security monitoring

**Publish Job:** (main branch only)
- Auto-detect version changes
- Publish to NPM registry
- Create GitHub releases
- Tag management

#### 2. Code Review Assistant (`code-review.yml`)

**Triggers:**
- Pull request opened/synchronized/reopened

**Features:**
- PR size analysis
- File change warnings (>50 files)
- TODO/FIXME detection
- Code complexity reporting
- Dependency review
- Auto-labeling

### Quality Gates

All PRs must pass:
- ✅ Linting
- ✅ All tests (378+ tests)
- ✅ Build compilation
- ✅ Security audit
- ✅ Code review checks

### Auto-Labeling

**Type Labels:**
- `type: documentation` - Markdown files, docs
- `type: tests` - Test files
- `type: build` - Package.json, configs
- `type: feature` - New tools, browser features
- `type: memory` - Memory system changes
- `type: fix` - Bug fixes

**Size Labels:**
- `size: small` - 1-5 files
- `size: medium` - 6-20 files
- `size: large` - 21+ files

### PR Template

Comprehensive checklist including:
- Type of change classification
- Description and motivation
- Testing verification
- Self-review checklist
- Documentation updates
- Breaking changes documentation

## For User Projects

### Automatic Deployment (Phase 8)

When users run `friday-setup`, Phase 8 automatically:

1. **Creates `.github/workflows/` directory**
2. **Deploys `ci-cd.yml`** - Full CI/CD pipeline
3. **Deploys `code-review.yml`** - Code review automation
4. **Creates PR template** - Structured contributions
5. **Configures auto-labeler** - Organized PRs

### User Benefits

**Quality Assurance:**
- Automated testing on every commit
- Code style enforcement
- Security vulnerability detection
- Build verification

**Developer Experience:**
- Fast feedback (3-5 minutes)
- Clear contribution guidelines
- Automated PR reviews
- Organized workflow

**Deployment Safety:**
- Multi-stage verification
- Version management
- Controlled releases
- Rollback capability

## CI/CD Pipeline Architecture

```
┌─────────────────┐
│   Push/PR       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Lint Check    │
│  ✓ ESLint       │
│  ✓ TypeScript   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Test Suite    │
│  ✓ Node 18      │
│  ✓ Node 20      │
│  ✓ Coverage     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Build         │
│  ✓ Compilation  │
│  ✓ Artifacts    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Security      │
│  ✓ NPM Audit    │
│  ✓ Dependencies │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Publish       │ (main only)
│  ✓ NPM Registry │
│  ✓ GitHub Release│
└─────────────────┘
```

## Code Review Workflow

```
┌─────────────────┐
│   PR Opened     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Auto-Label    │
│  ✓ Type         │
│  ✓ Size         │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Analysis      │
│  ✓ PR Size      │
│  ✓ TODO/FIXME   │
│  ✓ Complexity   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Dependency    │
│   Review        │
│  ✓ Security     │
│  ✓ Licenses     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Summary       │
│   Report        │
└─────────────────┘
```

## Setup for Users

### Automatic (Recommended)

```bash
# Run FRIDAY setup
friday-setup
```

Phase 8 will automatically:
- ✅ Create GitHub Actions workflows
- ✅ Configure CI/CD pipeline
- ✅ Set up code review
- ✅ Deploy PR template
- ✅ Enable auto-labeling

### Manual

If you want to customize:

1. Copy workflows from `.github/workflows/`
2. Modify for your project needs
3. Commit and push
4. Check Actions tab

## Configuration

### CI/CD Features

Users can customize in `cicd-deployer.ts`:

```typescript
features: {
  lint: true,          // ESLint/Prettier
  test: true,          // Test execution
  build: true,         // Build verification
  deploy: false,       // Auto-deployment
  security: true,      // Security audits
  codeReview: true,    // PR automation
}
```

### Workflow Customization

Edit `.github/workflows/ci-cd.yml`:

```yaml
# Change Node versions
node-version: ['16', '18', '20']

# Adjust test command
run: npm test -- --coverage

# Modify security threshold
npm audit --audit-level=critical
```

## Best Practices

### For Contributors

**Before PR:**
- ✅ Run `npm test` locally
- ✅ Run `npm run lint` locally
- ✅ Review your own changes
- ✅ Update documentation

**PR Guidelines:**
- Keep PRs small (<20 files when possible)
- Write clear descriptions
- Add tests for new features
- Update docs for changes

**After PR:**
- ✅ Watch CI/CD pipeline
- ✅ Address review comments
- ✅ Keep PR up-to-date with main

### For Maintainers

**Review Process:**
- Check automated review summary
- Verify tests pass
- Review code changes
- Check security audit
- Approve and merge

**Release Process:**
- Version bump (`npm version minor/major/patch`)
- Push to main
- CI/CD auto-publishes
- GitHub release created automatically

## Monitoring

### GitHub Actions Tab

View all workflows:
```
https://github.com/mnhidayatgani/mcp-friday/actions
```

### Status Badges

Add to README:
```markdown
![CI/CD](https://github.com/mnhidayatgani/mcp-friday/workflows/CI%2FCD%20Pipeline/badge.svg)
![Tests](https://github.com/mnhidayatgani/mcp-friday/workflows/Tests/badge.svg)
```

### NPM Status

Check package:
```
https://www.npmjs.com/package/@mnhidayatgani/friday-mcp
```

## Troubleshooting

### CI/CD Fails

**Lint Errors:**
```bash
npm run lint --fix
```

**Test Failures:**
```bash
npm test -- --verbose
```

**Build Issues:**
```bash
npm run build
# Check TypeScript errors
```

### Security Audit Fails

```bash
# Check vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Manual review
npm audit --json
```

### Workflow Not Triggering

1. Check `.github/workflows/` exists
2. Verify YAML syntax
3. Check branch names match
4. Review GitHub Actions tab

## Advanced Features

### Custom Workflows

Add `.github/workflows/custom.yml`:

```yaml
name: Custom Workflow
on: [push]
jobs:
  custom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Custom workflow"
```

### Secrets Management

Add secrets in GitHub:
- Settings → Secrets and variables → Actions
- Add `NPM_TOKEN` for publishing
- Add other API keys as needed

### Branch Protection

Recommended settings:
- ✅ Require PR reviews
- ✅ Require status checks
- ✅ Require branches up-to-date
- ✅ Enforce for administrators

## Metrics

### This Project

- **Workflows:** 2 active
- **Test Coverage:** 378 tests
- **Build Time:** ~2-3 minutes
- **Security Audit:** Automated
- **Auto-Publish:** Enabled

### For Users

After `friday-setup`:
- **Workflows Created:** 2
- **PR Template:** 1
- **Auto-Labeler:** Configured
- **Quality Gates:** 4 minimum

## Future Enhancements

- [ ] Deployment to cloud platforms
- [ ] Performance benchmarking
- [ ] Visual regression testing
- [ ] Automated changelog generation
- [ ] Release notes automation
- [ ] Slack/Discord notifications

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [NPM Publishing](https://docs.npmjs.com/cli/publish)

---

✅ **CI/CD and code review are now fully automated for FRIDAY and all user projects!**
