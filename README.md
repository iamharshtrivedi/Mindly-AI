# Mindly AI — Your Intelligent Reflection Companion

Mindly AI is a production-grade, AI-powered journaling application designed to transform solitary reflection into an interactive journey of self-discovery. Built on a secure full-stack architecture, it leverages the **Gemini 2.0 Flash** model to provide real-time cognitive coaching, pattern recognition, and deep-dive prompts.

**Live Application**: [https://mindly-ai.ai.studio](https://mindly-ai.ai.studio)

---

## 🌟 Key Features

- **AI-Augmented Journaling**: Beyond simple text entry, Mindly AI acts as a conversational partner, using Gemini to suggest "Go Deeper" questions and reframing perspectives.
- **Thought Pattern Recognition**: Automatically identifies recurring themes, emotional shifts, and cognitive biases across your sessions.
- **Interactive Coaching**: Integrated "Coach Me" and "Summarize" actions to help you turn reflections into actionable growth.
- **Enterprise-Grade Security**: Full-stack isolation ensures AI API keys are never exposed to the browser.
- **Multi-Device Sync**: Real-time persistence using Cloud Firestore with secure, owner-bound data access.

---

## 🛠️ Technical Architecture

Mindly AI utilizes a modern, serverless stack optimized for performance and security:

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS.
- **Backend**: Express.js server acting as a secure proxy for the Gemini API and Firebase Admin SDK.
- **AI Core**: `@google/genai` (Gemini 2.0 Flash) with a resilient model-fallback ladder.
- **Database**: Cloud Firestore (NoSQL) for structured session and message history.
- **Authentication**: Firebase Authentication with Google Sign-In provider.
- **Infrastructure**: Google Cloud Run (Containerized Serverless).

---

## 🚀 Deployment & Configuration

### 1. Environment & Prerequisites

Ensure you have the following services enabled in your Google Cloud Project:
- [Cloud Run](https://console.cloud.google.com/run)
- [Secret Manager](https://console.cloud.google.com/security/secret-manager)
- [Firestore](https://console.cloud.google.com/firestore)
- [Firebase Authentication](https://console.firebase.google.com/project/_/authentication)

### 2. Secret Management

Mindly AI utilizes **Secret Manager** to handle the Gemini API Key. This prevents keys from being hardcoded or leaked in environment variables.

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the Cloud Run service account access
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Database Security Rules

Deploy the following `firestore.rules` to ensure absolute data isolation. This allows users to read and write only their own data.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Cloud Run Deployment

Deploy the containerized application to Cloud Run. The build process automatically bundles the React frontend and the Express backend into a single deployment.

```bash
gcloud run deploy mindly-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --update-labels=dev-tutorial=cloud-run-ai-challenge
```

---

## ⚙️ Environment Variables

The application requires the following variables defined in your Cloud Run environment or AI Studio Secrets panel:

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your Google AI Studio / Gemini API Key. |
| `FIREBASE_PROJECT_ID` | The ID of your Firebase/GCP project. |
| `FIREBASE_DATABASE_ID` | The Firestore database ID (usually `(default)`). |
| `VITE_FIREBASE_API_KEY` | Client-side Firebase API Key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain (e.g., project.firebaseapp.com). |

---

## 🛡️ Security Audit

This project follows the **OWASP Top 10 for LLM Applications** and general secure coding standards:
- **Indirect Prompt Injection Defense**: System instructions are strictly isolated from user input.
- **Broken Access Control Mitigation**: All API endpoints verify JWT identity tokens via Firebase Admin.
- **Zero-Hardcoding**: No API keys or internal IDs are stored in the source code; all configuration is injected at runtime.

---

## 📈 Challenge Verification

To register this service for the **Cloud Run AI Challenge**, ensure the following label is applied:

```bash
gcloud run services update mindly-ai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=<REGION>
```

---

*Designed and Built with ❤️ by Google AI Studio Build.*
