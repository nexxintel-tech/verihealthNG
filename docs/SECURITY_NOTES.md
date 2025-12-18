All Supabase secrets are runtime-injected.
No secrets belong in source control.

Notes:
- `.replit` has had secrets removed and is now listed in `.gitignore`.
- Rotate any exposed keys and ensure CI/runtime environments provide keys via secure secrets.

Quick verification commands (run in WSL or dev machine):

```bash
# search for accidental secret strings in tracked files
git grep -n "SUPABASE_ANON_KEY\|SUPABASE_SERVICE_ROLE_KEY\|DATABASE_URL" || true

# ensure .replit is ignored by git
git check-ignore -v .replit || true

``` 
