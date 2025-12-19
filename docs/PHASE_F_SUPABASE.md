# Phase F — Supabase Source of Truth

Schema: `wearable`

Tables:

- `wearable.devices`
- `wearable.ingested_data`

Device secret handling:

- Device secrets are stored as `bytea` in the database and must be treated as server-only values. They must never be exposed to client code or committed into repository files. Access to device secrets is restricted to trusted server-side code and Edge Functions that run with a service-role key.

Edge Functions:

- `ingest_wearable_data`
- `wearable_device_manager`

Statement:

“Phase F infrastructure is deployed and managed directly in Supabase. This repository consumes it as a remote API.”

✅ Result: Human-readable Phase F source of truth
