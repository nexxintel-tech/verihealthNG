# ingest_wearable_data

Function name

- `ingest_wearable_data`

Purpose

- Accepts wearable device readings and ingests them into the Supabase backend (audit + structured vitals).

Endpoint path

- `/ingest_wearable_data` (deployed as an Edge Function at the Supabase functions URL for the project)

Headers required

- `Content-Type: application/json`
- `Authorization: Bearer <token>` (use a service-role key for server-side calls where appropriate; do NOT embed secrets in repository files)

Explicit note

“Implementation is managed in Supabase. This directory exists to reflect deployed infrastructure.”

⚠️ Do NOT add `index.ts` logic here unless explicitly instructed later — this directory mirrors deployed infrastructure only.
# ingest_wearable_data Edge Function

This Edge Function accepts POSTed wearable readings and inserts them into `wearable_readings` using the Supabase Service Role key.

Important:
- Do NOT store the service role key in client apps.
- Provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables to the function runtime.

Example deployment (supabase CLI):

```bash
supabase functions deploy ingest_wearable_data --project-ref <ref> --env SUPABASE_SERVICE_ROLE_KEY
```
