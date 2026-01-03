# Railway API Diagnostic Prompt - Copy & Paste This

## Context
I have a Solana memecoin alerts website (solboy.in) that displays trading alerts. The frontend is deployed on Vercel and uses a Supabase Edge Function as a proxy to fetch data from a Railway API backend.

## Current Issues
1. **Callers and Subs showing as zero** - All alerts display `📢 Callers: 0` and `👥 Subs: 0` even though they should have values
   - **Status**: Code is FIXED (handles XTRACK format: `📢 Callers: 3 | Subs: 12357`)
   - **Action Needed**: Backfill existing alerts in `kpi_logs.json` using `backfill_callers_subs_from_xtrack.py`
2. **Missing matched signals** - Alerts should show "matched signals" (like "Glydo", "Smart Money", "Large Buy", "Volume", etc.) but many are missing or incomplete
3. **Incomplete signal arrays** - **CRITICAL**: SZN should have 4 signals (`early_trending`, `glydo`, `large_buy`, `volume`) but API only returns 2 (`glydo`, `smart_money`). Backtest verification confirms all 4 signals exist in the data.
4. **No current buys/tracked sources** - The "matched signals" section is not showing all the monitored sources that triggered each alert

## What I Need You To Check

### 1. Railway API Endpoint
**URL**: `https://my-project-production-3d70.up.railway.app/api/alerts/recent?limit=10`

**Please test this endpoint and check:**
- Does it return alerts?
- Do the alerts have `callers` and `subs` fields? What are their values?
- Do the alerts have `matchedSignals` or `matched_signals` fields? What values are in these arrays?
- **CRITICAL**: For SZN token, does it return all 4 signals (`early_trending`, `glydo`, `large_buy`, `volume`) or only 2?
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
   - **Code Status**: ✅ FIXED - `parse_callers_subs()` in `live_monitor_core.py` now handles XTRACK format
   - **Format**: `📢 Callers: 3 | Subs: 12357` (from XTRACK channel, different from alert channel)
   - **Action Needed**: 
     - Export XTRACK channel messages (the one with `🚀 #token did 👉 2x` messages)
     - Run `backfill_callers_subs_from_xtrack.py` to update existing alerts in `kpi_logs.json`
   - Are they stored in the alert data?
   - Are they being set to 0 by default somewhere?

3. **How are `matchedSignals` populated?**
   - Is there a backfill script that extracts signals from Telegram?
   - Are signals being properly parsed and stored?
   - **CRITICAL**: Check if `backfill_from_json_export.py` has been updated with the fixed signal extraction logic (parsing confirmation lines with ✓)
   - **CRITICAL**: Has `backfill_signals_from_telegram.py` been run to update existing alerts in `kpi_logs.json`?
   - Verify that SZN in `kpi_logs.json` has all 4 signals: `["early_trending", "glydo", "large_buy", "volume"]`

4. **Check the `/api/alerts/recent` endpoint handler:**
   - Does it return all fields including `callers`, `subs`, and `matchedSignals`?
   - Is there any filtering or transformation that might be removing these fields?
   - Are the fields being renamed (e.g., `callers` → `callers_count`)?

### 3. Check Data Storage
**If alerts are stored in `kpi_logs.json` or similar file:**
- Open the file and check a few alert entries
- **CRITICAL**: Find SZN alert and verify it has `matched_signals: ["early_trending", "glydo", "large_buy", "volume"]` (all 4 signals)
- Verify that `callers` and `subs` have actual values (not 0 or null)
- Verify that `matched_signals` or `matchedSignals` arrays contain multiple signal names
- Check if the data structure matches what the API is returning
- **If SZN only has 2 signals in storage**: Run `backfill_signals_from_telegram.py` to update it

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

### For Callers/Subs:
1. **Code is FIXED** ✅ - `parse_callers_subs()` handles XTRACK format
2. **If `callers`/`subs` are 0 in storage**: 
   - Export XTRACK channel messages (JSON format)
   - Run `backfill_callers_subs_from_xtrack.py` to update `kpi_logs.json`
   - Script matches alerts by contract address and updates callers/subs
3. **If `callers`/`subs` are in storage but API returns 0**: Fix the API endpoint to return these fields

### For Matched Signals:
4. **If `matchedSignals` are incomplete in storage**: 
   - Run `backfill_signals_from_telegram.py` to update existing alerts
   - Verify the script uses the fixed extraction logic (parses confirmation lines with ✓)
5. **If `matchedSignals` are complete in storage but API returns incomplete**:
   - Check the `/api/alerts/recent` endpoint code
   - Ensure it returns the full `matched_signals` array without filtering
   - Check if there's any `.slice()` or `.filter()` that limits the array
6. **If fields are being lost**: Ensure the API response preserves all fields from storage

## Additional Context
- Frontend expects: `callers` (number), `subs` (number), `matchedSignals` (string array)
- Supabase function proxies the Railway API and should preserve all fields
- Frontend has localStorage caching to prevent data loss during redeployments
- **Callers/Subs Code**: ✅ FIXED - Extraction logic updated in `live_monitor_core.py`
- **Callers/Subs Data**: ⚠️ Needs backfill - Run `backfill_callers_subs_from_xtrack.py` with XTRACK channel export
- **XTRACK Format**: `📢 Callers: 3 | Subs: 12357` (different channel from alerts)

---

**Please test the Railway API endpoint and share:**
1. ✅ Sample API response (full JSON) - **Especially for SZN token**
2. ✅ SZN alert from storage (`kpi_logs.json`) - **Check if it has all 4 signals**
3. ✅ Code for `/api/alerts/recent` endpoint - **Check if it filters/limits signals**
4. ✅ Verification: Does SZN in storage have 4 signals but API returns only 2?
5. ✅ Any issues found and recommended fixes

**Expected for SZN:**
- Storage: `matched_signals: ["early_trending", "glydo", "large_buy", "volume"]` (4 signals)
- API Response: Should return all 4 signals
- Website: Should display all 4 signals

