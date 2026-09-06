# Mindly AI
A secure, AI-powered journaling application for deep reflections, brainstorming, and personal growth using Gemini.

**Deployed App**: [https://mindly-ai.ai.studio](https://mindly-ai.ai.studio)

## Prerequisites
- Google Cloud Project with Cloud Run and Secret Manager enabled.
- Firebase project with Firestore and Authentication (Google Sign-In) enabled.

## Setup & Deployment
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

4. **Deploy to Cloud Run**:
   Use the **Deploy** button in the Google AI Studio UI, or run:
   ```bash
   gcloud run deploy mindly-ai --source . --region <REGION> --allow-unauthenticated
   ```

## Verification
- Run `gcloud run services update mindly-ai --update-labels=dev-tutorial=cloud-run-ai-challenge --region=<REGION>`

