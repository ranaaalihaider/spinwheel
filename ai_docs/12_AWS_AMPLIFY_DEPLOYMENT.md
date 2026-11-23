# 12 — AWS Amplify Hosting & GitHub Deployment Guide
## AWS Student Builder Group — COMSATS University Islamabad

---

## 1. Deployment Architecture

```text
Local Development (Vite + React + TypeScript)
       │
       ▼  git push origin main
GitHub Repository (https://github.com/ranaaalihaider/spinwheel.git)
       │
       ▼  Webhook Trigger (Automatic CI/CD)
AWS Amplify Hosting (amplify.yml -> npm ci && npm run build -> dist/)
       │
       ▼  Global Edge Distribution
Amazon CloudFront HTTPS URL
       │
       ▼  Read-Only HTTPS Fetch (SELECT B, C)
Google Sheets Participant Source (1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q)
```

---

## 2. Included `amplify.yml` Specification

The repository root includes a verified `amplify.yml` file:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

## 3. Step-by-Step AWS Amplify Hosting Setup

1. **Sign in to the AWS Management Console** and open **AWS Amplify**.
2. Click **Create new app** → select **GitHub** as the repository provider → click **Next**.
3. Authorize AWS Amplify to access your GitHub account and select:
   - **Repository**: `ranaaalihaider/spinwheel`
   - **Branch**: `main`
4. **Build Settings**:
   - Amplify automatically detects `amplify.yml` in the root directory. Verify that `baseDirectory` is set to `dist`.
5. **Environment Variables** (under *Advanced settings* → *Environment variables*):
   | Variable | Value | Description |
   |---|---|---|
   | `VITE_GOOGLE_SHEET_ID` | `1hOghDsBghg1m8VNGH4LR-P5US2uGn6XNNhzQ6E1ga_Q` | Connected event Google Spreadsheet ID |
   | `VITE_SHEET_NAME_COLUMN` | `Name` | Column header containing participant full names |
   | `VITE_SHEET_ID_COLUMN` | `Reg No` | Column header containing student registration numbers |
   | `VITE_PARTICIPANTS_API_URL` | *(Optional)* | Deployed Google Apps Script Web App URL if using private sheet mode |
   | `VITE_ORGANIZER_PIN` | `2026` | PIN code for unlocking destructive Organizer Drawer controls |
6. Click **Save and deploy**.
7. **SPA Routing Rule (Optional for Single-Page Navigation)**:
   - In the Amplify Console left sidebar, navigate to **Hosting** → **Rewrites and redirects**.
   - Ensure the SPA fallback rule exists:
     - **Source address**: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
     - **Target address**: `/index.html`
     - **Type**: `200 (Rewrite)`

---

## 4. Cost Profile

- **AWS Amplify Hosting**: Uses pay-as-you-go pricing with the AWS Free Tier (1,000 build minutes/month, 5 GB stored, 15 GB served/month free for 12 months). For a student community static SPA (~200 KB gzipped), monthly hosting costs after free tier expiration are typically **<$0.05/month** with zero idle EC2 compute charges.
- **Google Sheets / Google Apps Script**: **$0.00** (included in standard Google Workspace / free Google accounts).
