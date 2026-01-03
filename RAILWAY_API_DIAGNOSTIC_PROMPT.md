# Railway API Diagnostic Prompt - Copy & Paste This

## Context
I have a Solana memecoin alerts website (solboy.in) that displays trading alerts. The frontend is deployed on Vercel and uses a Supabase Edge Function as a proxy to fetch data from a Railway API backend.

## Current Issues
1. **Callers and Subs showing as zero** - All alerts display `📢 Callers: 0` and `👥 Subs: 0` even though they should have values
2. **Missing matched signals** - Alerts should show "matched signals" (like "Glydo", "Smart Money", "Large Buy", "Volume", etc.) but many are missing or incomplete
3. **No current buys/tracked sources** - The "matched signals" section is not showing all the monitored sources that triggered each alert

## What I Need You To Check

### 1. Railway API Endpoint
**URL**: `https://my-project-production-3d70.up.railway.app/api/alerts/recent?limit=10`

**Please test this endpoint and check:**
- Does it return alerts?
- Do the alerts have `callers` and `subs` fields? What are their values?
- Do the alerts have `matchedSignals` or `matched_signals` fields? What values are in these arrays?
- What is the full structure of a sample alert object?

**Expected fields in each alert:**
```json
{
  "id": "...",
  "token": "...",
  "tier": 1,
  "contract": "...",
  "callers": 123,  // Should NOT be 0 or null
  "subs": 456,     // Should NOT be 0 or null
  "matchedSignals": ["glydo", "smart_money", "large_buy", "volume"],  // Should have multiple signals
  "entryMc": 135000,
  "description": "...",
  "timestamp": "..."
}
```

### 2. Check Railway API Source Code
**Please check the Railway API codebase (likely Python Flask/FastAPI):**

1. **Where are alerts stored?** 
   - Is it a JSON file (`kpi_logs.json`)?
   - Is it a database?
   - How are alerts persisted?

2. **How are `callers` and `subs` populated?**
   - Are they extracted from Telegram messages?
   - Are they stored in the alert data?
   - Are they being set to 0 by default somewhere?

3. **How are `matchedSignals` populated?**
   - Is there a backfill script that extracts signals from Telegram?
   - Are signals being properly parsed and stored?
   - Check if `backfill_from_json_export.py` or similar script is extracting all signals correctly

4. **Check the `/api/alerts/recent` endpoint handler:**
   - Does it return all fields including `callers`, `subs`, and `matchedSignals`?
   - Is there any filtering or transformation that might be removing these fields?
   - Are the fields being renamed (e.g., `callers` → `callers_count`)?

### 3. Check Data Storage
**If alerts are stored in `kpi_logs.json` or similar file:**
- Open the file and check a few alert entries
- Verify that `callers` and `subs` have actual values (not 0 or null)
- Verify that `matched_signals` or `matchedSignals` arrays contain multiple signal names
- Check if the data structure matches what the API is returning

### 4. Check Telegram Parsing
**If there's a Telegram monitor/parser script:**
- How does it extract `callers` and `subs` from Telegram messages?
- How does it extract `matchedSignals` from the "Why it triggered" section?
- Are these fields being properly parsed and saved?

### 5. Test the Full Pipeline
**Please provide:**
1. A sample raw alert from your storage (JSON file or database)
2. The API response from `/api/alerts/recent?limit=3` (full JSON)
3. Any logs or errors from the Railway API
4. The code that handles the `/api/alerts/recent` endpoint

## Expected Behavior
- **Callers**: Should show the number of callers (people who called the token) - typically > 0
- **Subs**: Should show the number of subscribers - typically > 0  
- **Matched Signals**: Should show ALL signals that triggered the alert, e.g., `["early_trending", "glydo", "large_buy", "volume"]` not just `["glydo"]`

## Files to Check
1. Railway API server code (likely `api_server.py` or `main.py`)
2. Backfill script (`backfill_from_json_export.py` or similar)
3. Data storage file (`kpi_logs.json` or database)
4. Telegram parser/monitor script

## What to Fix
1. **If `callers`/`subs` are 0 in storage**: Fix the Telegram parser to extract these values correctly
2. **If `callers`/`subs` are in storage but API returns 0**: Fix the API endpoint to return these fields
3. **If `matchedSignals` are incomplete**: Fix the backfill script to extract ALL signals from Telegram messages (check confirmation lines with ✓)
4. **If fields are being lost**: Ensure the API response preserves all fields from storage

## Additional Context
- Frontend expects: `callers` (number), `subs` (number), `matchedSignals` (string array)
- Supabase function proxies the Railway API and should preserve all fields
- Frontend has localStorage caching to prevent data loss during redeployments

---

**Please test the Railway API endpoint and share:**
1. ✅ Sample API response (full JSON)
2. ✅ Sample alert from storage (if accessible)
3. ✅ Code for `/api/alerts/recent` endpoint
4. ✅ Any issues found and recommended fixes

