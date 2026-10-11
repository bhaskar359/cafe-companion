# Deployment Guide — Google Cloud Run & Cloud SQL

This document provides step-by-step instructions for deploying **Café Companion** to Google Cloud without running exploratory or billable operations automatically.

---

## 1. Prerequisites

- A Google Cloud Platform (GCP) project with billing enabled.
- Google Cloud SDK (`gcloud`) installed and configured.
- Docker or Cloud Build enabled.

---

## 2. Google Cloud SQL (PostgreSQL) Setup

1. **Create Cloud SQL Instance**:
   ```bash
   gcloud sql instances create cafe-companion-db \
     --database-version=POSTGRES_16 \
     --tier=db-f1-micro \
     --region=asia-southeast1 \
     --root-password="YOUR_SECURE_PASSWORD"
   ```

2. **Create Database**:
   ```bash
   gcloud sql databases create cafe_companion --instance=cafe-companion-db
   ```

3. **Obtain Connection Name**:
   ```bash
   gcloud sql instances describe cafe-companion-db --format="value(connectionName)"
   # Output format: PROJECT_ID:REGION:cafe-companion-db
   ```

4. **Run Migrations & Seeds**:
   Connect via Cloud SQL Auth Proxy or `psql`:
   ```bash
   psql -h 127.0.0.1 -U postgres -d cafe_companion -f src/server/db/schema.sql
   psql -h 127.0.0.1 -U postgres -d cafe_companion -f src/server/db/seed.sql
   ```

---

## 3. Google Cloud Run Deployment

1. **Build Container Image**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/cafe-companion
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy cafe-companion \
     --image gcr.io/YOUR_PROJECT_ID/cafe-companion \
     --platform managed \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --add-cloudsql-instances YOUR_PROJECT_ID:REGION:cafe-companion-db \
     --set-env-vars DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@/cafe_companion?host=/cloudsql/YOUR_PROJECT_ID:REGION:cafe-companion-db",NODE_ENV="production" \
     --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
   ```

---

## 4. Cost Controls Summary

- **Development/Prototype Mode**: Runs with 0 database cost using the built-in deterministic in-memory store.
- **Gemini Model**: Uses low-cost `gemini-3.8-flash` with strictly capped 1-turn tool executions (`search_menu` & `preview_order`).
- **Resilience**: Zero-latency offline fallback ensures the entire café menu browsing, cart, preview, and confirmation flow operates even if Gemini quota is exceeded.
