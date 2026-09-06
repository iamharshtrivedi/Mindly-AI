# Mindly AI
A secure, AI-powered journaling application for deep reflections, brainstorming, and personal growth using Gemini.

## Prerequisites
- Google Cloud Project with Cloud Run and Secret Manager enabled.
- Firebase project with Firestore and Authentication (Google Sign-In) enabled.

## Setup
1. **Secrets**:
   - Create a secret `GEMINI_API_KEY` in Secret Manager.
   - Grant the Cloud Run service account `roles/secretmanager.secretAccessor`.

2. **Environment Variables**:
   Set the following in Cloud Run:
   - `GEMINI_API_KEY`
   - `FIREBASE_DATABASE_ID` (if using non-default)
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.

3. **Firestore Rules**:
   Deploy the provided `firestore.rules`.

## Verification
- Run `gcloud run services update <SERVICE_NAME> --update-labels=dev-tutorial=cloud-run-ai-challenge --region=<REGION>`
