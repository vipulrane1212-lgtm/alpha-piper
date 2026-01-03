# Railway Agent Action Plan - Fix Callers/Subs & Matched Signals

**Date:** January 3, 2026  
**Priority:** HIGH - Website showing incomplete data  
**Status:** Code is FIXED, data needs backfilling

---

## 🎯 Goal
Fix the Railway API to return:
1. ✅ Actual `callers` and `subs` values (not 0)
2. ✅ All `matchedSignals` for each alert (SZN should have 4, not 2)

---

## ✅ What's Already Fixed (Code)

### 1. Callers/Subs Extraction - FIXED ✅
- **File:** `live_monitor_core.py` - `parse_callers_subs()`
- **Status:** Code updated to handle XTRACK format: `📢 Callers: 3 | Subs: 12357`
- **Action:** No code changes needed, just backfill existing data

### 2. Matched Signals Extraction - FIXED ✅
- **File:** `backfill_from_json_export.py`
- **Status:** Code updated to parse all confirmation lines (✓) from Telegram
- **Action:** Run backfill script to update existing alerts

---

## 📋 Action Items

### Task 1: Fix Callers/Subs for Existing Alerts

**Step 1: Export XTRACK Channel**
- Export the XTRACK channel messages (the one with `🚀 #token did 👉 2x` format)
- Export as JSON format
- This is a **different channel** from the alert channel

**Step 2: Update Backfill Script**
- Open `backfill_callers_subs_from_xtrack.py`
- Update the path to your XTRACK export:
  ```python
  telegram_export = Path("path/to/xtrack/export.json")
  ```

**Step 3: Run Backfill Script**
```bash
python backfill_callers_subs_from_xtrack.py
```

**Step 4: Verify Results**
- Check `kpi_logs.json`
- Find a few alerts (e.g., SZN, MINT, USA)
- Verify they now have `callers` and `subs` with actual values (not 0)

**Step 5: Commit and Deploy**
```bash
git add kpi_logs.json
git commit -m "Backfill callers/subs from XTRACK messages"
git push origin main
```

---

### Task 2: Fix Matched Signals (SZN has 4, API returns 2)

**Step 1: Verify Current Data**
- Open `kpi_logs.json`
- Find SZN alert
- Check `matched_signals` field
- **Expected:** `["early_trending", "glydo", "large_buy", "volume"]` (4 signals)
- **If it only has 2 signals:** Continue to Step 2

**Step 2: Run Signal Backfill**
```bash
python backfill_signals_from_telegram.py
```

**Step 3: Verify Results**
- Check `kpi_logs.json` again
- SZN should now have all 4 signals
- Other alerts should also have complete signal arrays

**Step 4: Check API Endpoint Code**
- Open `api_server.py` (or your main API file)
- Find the `/api/alerts/recent` endpoint handler
- **Verify:**
  - ✅ It returns the full `matched_signals` array
  - ✅ No `.slice()` or `.filter()` that limits signals
  - ✅ No transformation that removes signals
  - ✅ Field name is `matchedSignals` or `matched_signals` (both work)

**Step 5: Test API Endpoint**
```bash
curl https://my-project-production-3d70.up.railway.app/api/alerts/recent?limit=3
```

**Check Response:**
- SZN should have `matchedSignals: ["early_trending", "glydo", "large_buy", "volume"]`
- All alerts should have `callers` and `subs` with actual values

**Step 6: Commit and Deploy**
```bash
git add kpi_logs.json
git commit -m "Backfill matched signals - SZN now has all 4 signals"
git push origin main
```

---

## 🔍 Verification Checklist

After completing both tasks, verify:

### For Callers/Subs:
- [ ] SZN alert in `kpi_logs.json` has `callers: 3` (or actual value, not 0)
- [ ] SZN alert in `kpi_logs.json` has `subs: 12357` (or actual value, not 0)
- [ ] API endpoint returns actual callers/subs values
- [ ] Website displays actual callers/subs (not 0)

### For Matched Signals:
- [ ] SZN alert in `kpi_logs.json` has 4 signals: `["early_trending", "glydo", "large_buy", "volume"]`
- [ ] API endpoint returns all 4 signals for SZN
- [ ] Website displays all 4 signals for SZN
- [ ] Other alerts also show complete signal arrays

---

## 🧪 Test API Response

**Expected Response for SZN:**
```json
{
  "alerts": [
    {
      "token": "SZN",
      "contract": "9RPY2YVVQXSCXTMMWBR83UV6RINVSGNJAMS3KAWYBONK",
      "callers": 3,      // ✅ Actual value (not 0)
      "subs": 12357,     // ✅ Actual value (not 0)
      "matchedSignals": [
        "early_trending",  // ✅ All 4 signals
        "glydo",
        "large_buy",
        "volume"
      ]
    }
  ]
}
```

---

## 📝 Notes

1. **XTRACK Channel:** Different from alert channel - contains `📢 Callers: X | Subs: Y` format
2. **Signal Extraction:** Uses confirmation lines (✓) from "Why it triggered" section
3. **Frontend Ready:** Frontend code is already fixed and will display data correctly once API returns it
4. **No Code Changes Needed:** All extraction logic is already fixed, just need to backfill data

---

## 🚨 If Issues Persist

### If callers/subs still show 0:
1. Check XTRACK export format matches: `📢 Callers: 3 | Subs: 12357`
2. Verify backfill script matched alerts by contract address correctly
3. Check API endpoint returns `callers` and `subs` fields (not renamed)

### If SZN still shows only 2 signals:
1. Verify `kpi_logs.json` has all 4 signals for SZN
2. Check API endpoint code doesn't filter/limit the array
3. Test API directly: `curl https://my-project-production-3d70.up.railway.app/api/alerts/recent?limit=1`
4. Check Supabase function logs to see what Railway API returns

---

## ✅ Success Criteria

- ✅ All alerts show actual callers/subs values (not 0)
- ✅ SZN shows all 4 matched signals on website
- ✅ All alerts show complete matched signals arrays
- ✅ API endpoint returns all fields correctly

---

**Once complete, the website will automatically display the correct data!** 🎉

