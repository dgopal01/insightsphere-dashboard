# PR Templates Guide

## 📋 Available Templates

### Automatic Templates
- **Default**: Applied to all PRs automatically
- **Branch-specific**: Applied based on target branch (when auto-selected)
  - `master/main` → Production release template
  - `integration` → Feature integration template
  - `release` → Release preparation template

### Manual Templates
Available from "Add a template" dropdown:
- `feature.md` → Feature development checklist
- `hotfix.md` → Emergency hotfix process

## 🎯 How Templates Apply

1. **Create PR** → Default template applies automatically
2. **Target auto-selected** → Branch-specific template may apply
3. **Need different template?** → Use "Add a template" dropdown
4. **URL override** → Add `?template=filename.md` to force specific template

## Template Locations
```
.azuredevops/
├── pull_request_template.md              # Default (always applies)
├── pull_request_template/
│   ├── branches/
│   │   ├── master.md                     # Auto-applied for PRs to master
│   │   ├── integration.md                # Auto-applied for PRs to integration
│   │   └── release.md                    # Auto-applied for PRs to release
│   ├── feature.md                        # Manual selection from dropdown
│   └── hotfix.md                         # Manual selection from dropdown
```

## Template Philosophy

All templates are designed to be **clean and focused**:
- ✅ Essential information only
- ✅ Actionable checklist items
- ✅ No overwhelming complexity
- ✅ Quick to fill out

## Examples

**Feature PR to Integration:**
- ✅ Default template applies
- ✅ Integration-specific template adds context
- ✅ `feature.md` available in dropdown for detailed review

**Hotfix PR to Release:**
- ✅ Default template applies
- ✅ `hotfix.md` available in dropdown for emergency process

**Release PR to Master:**
- ✅ Default template applies
- ✅ Master-specific template for production checklist

Created: 2025-12-15T16:26:31.356Z