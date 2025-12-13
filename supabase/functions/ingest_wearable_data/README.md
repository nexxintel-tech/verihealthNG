# ingest_wearable_data Edge Function

This Edge Function accepts POSTed wearable readings and inserts them into `wearable_readings` using the Supabase Service Role key.

Important:
- Do NOT store the service role key in client apps.
- Provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables to the function runtime.

Example deployment (supabase CLI):

```bash
supabase functions deploy ingest_wearable_data --project-ref <ref> --env SUPABASE_SERVICE_ROLE_KEY
```
