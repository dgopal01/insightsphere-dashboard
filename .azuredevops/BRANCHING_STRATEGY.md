# Automatic PR Targeting Guide

## 🎯 File-Based PR Targeting Configuration

This repository is configured with **automatic PR targeting** using the official Azure DevOps file-based configuration method.

## ✅ How It Works

The file `.azuredevops/pull_request_targets.yml` contains:

```yaml
pull_request_targets:
  - integration
  - release/*
  - master
```

Azure DevOps uses this configuration to automatically select the target branch based on your source branch's history and naming patterns.

## Expected Automatic Targeting

| Source Branch Pattern | Expected Target | Algorithm |
|----------------------|----------------|-----------|
| `feature/*` | **→ integration** | First-parent history + branch priority |
| `hotfix/*` | **→ release** | Closest match in release/* branches |
| `release/*` | **→ master** | Default branch (master) |
| `integration` | **→ master** | Default branch (master) |

## Algorithm Explanation

Azure DevOps uses a heuristic based on:
1. **First-parent history intersection** - which target branch shares the most commit history
2. **Branch priority order** - earlier branches in the pull_request_targets list win ties
3. **Pattern matching** - release/* pattern matches any release branch

Repository: Swbc.Ethos.Ai
Created: 2025-12-15T16:26:31.355Z