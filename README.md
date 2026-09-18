# Aura

A production-grade, full-stack personal finance and expense optimization platform powered by **Cloud Firestore** for user-isolated data storage and **Gemini 3.6 Flash** for intelligent, context-aware financial advisory.

> *See your money's energy with Calm Clarity.*

---

## 🛡️ Threat Modeling & Security Architecture

| Threat Zone | Identified Risks | Countermeasure Implemented |
| :--- | :--- | :--- |
| **Input Surfaces** | Malicious injection in expense categories, negative values, malformed request bodies. | Strict client & server-side schema validation, parameterized types, zero-crash `cleanPayload` utility stripping `undefined` values. |
| **Planning & Reasoning** | Indirect prompt injection via transaction notes attempting to override advisor instructions. | System prompt boundary isolation; user financial records formatted strictly as structured JSON context rather than executable instructions. |
| **Tool Execution** | API credential leakage, SSRF, backend crash due to model unavailability. | Server-side Gemini API proxying with an automated 4-tier model fallback ladder (`gemini-3.6-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-flash-latest` ➔ `gemini-3.7-flash`). |
| **Memory & State** | Cross-tenant data leaks, unauthorized reads/writes to other users' financial logs. | Owner-authenticated path-level Firestore Security Rules (`match /users/{userId}/... { allow read, write: if request.auth.uid == userId; }`). |
| **Inter-System Communication** | Client-side exposure of `GEMINI_API_KEY` or service account keys. | Zero-hardcoding hygiene; API keys managed exclusively via Secret Manager / server-side environment variables. |

---

## 🚀 Cloud Run Deployment & Verification Guide

### 1. Prerequisites
Ensure you have the Google Cloud SDK (`gcloud`) and Firebase CLI installed and authenticated:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Enable required Google Cloud APIs:
```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

### 2. Secret Management Setup
Store your Gemini API key securely in Google Cloud Secret Manager and grant access to the Cloud Run service account:
```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant the default compute service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Firestore Security Rules Configuration
Deploy the user-isolated security rules to Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{collection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /chat_sessions/{sessionId}/messages/{messageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Deploy with the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 4. Cloud Run Deployment Command
Build and deploy the application container to Cloud Run with Secret Manager binding:
```bash
gcloud run deploy aura-finance-tracker \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --update-labels=dev-tutorial=cloud-run-ai-challenge
```

### 5. Challenge Verification Label
Verify that the service has the mandatory verification label attached:
```bash
gcloud run services update aura-finance-tracker \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 🧪 Comprehensive Functional Stability & Test Walkthrough

| Module | Step-by-Step Test Action | Expected Outcome |
| :--- | :--- | :--- |
| **User Identity** | 1. Navigate to landing page.<br>2. Click **Continue with Google Sign-In**.<br>3. Complete Google OAuth popup. | User profile is synchronized in Firestore under `/users/{userId}`; user is redirected to the Financial Dashboard. |
| **Income Logging** | 1. Click **+ Log Income** from Dashboard or Income tab.<br>2. Input amount `₹45,000`, select `Salary`, choose date, enable `Recurring`.<br>3. Click **Save Record**. | New income entry is created in Firestore `/users/{userId}/income`; total income and net savings KPI update immediately. |
| **Expense Tracking** | 1. Click **+ Add Expense**.<br>2. Enter `₹1,850`, select `Groceries & Food`, method `UPI / Direct Bank Transfer`.<br>3. Click **Save Record**. | Expense record is saved to `/users/{userId}/expenses`; category spending distribution and progress bar reflect new amount. |
| **Budget Planning** | 1. Navigate to **Budgets** tab.<br>2. Click **+ Set Category Limit**.<br>3. Choose `Groceries & Food`, limit `₹10,000`, current month.<br>4. Click **Save Record**. | Budget document is stored in `/users/{userId}/budgets`; progress bar displays real-time spent percentage (e.g. 18.5%) and remaining buffer (₹8,150). |
| **Aura AI Chatbot** | 1. Click floating **Aura AI** button at the bottom-right corner.<br>2. Click prompt pill: *"How much did I spend on dining out this month?"* or type custom question in rupees.<br>3. Click **Send** / press Enter. | Gemini 3.6 Flash analyzes the user's live Firestore records and responds with accurate numerical summaries in rupees (₹). Chat message pair is persisted to `/users/{userId}/chat_sessions/{sessionId}/messages`. |
| **Financial Analytics** | 1. Open **Reports** tab.<br>2. Toggle between **Visual Charts** (Income vs Expense Bar, Category Donut, Daily Spending Trajectory) and **Historical Timeline**.<br>3. Click **Export CSV Report**. | Responsive SVG charts render accurate data in brand colors; CSV file containing all monthly line items downloads to client with `₹` headers. |
| **Sign Out** | 1. Click the **Sign Out** icon in the navbar. | Firebase Auth session terminates, state is cleared from memory, and user returns to the secure Landing Page. |
