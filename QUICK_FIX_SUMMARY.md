# Quick Fix Summary - Railway API

## 🎯 Goal
Make Railway API return:
- ✅ Real `callers`/`subs` values (not 0)
- ✅ All 4 signals for SZN: `["early_trending", "glydo", "large_buy", "volume"]`

## ✅ Code is Already Fixed
- Callers/subs extraction: ✅ Fixed
- Signal extraction: ✅ Fixed
- API code: ✅ Fixed

## 📋 Just Do This:

### 1. Fix Callers/Subs (5 min)
```bash
# Export XTRACK channel → JSON
# Update path in: backfill_callers_subs_from_xtrack.py
python backfill_callers_subs_from_xtrack.py
git add kpi_logs.json && git commit -m "Backfill callers/subs" && git push
```

### 2. Fix Signals (5 min)
```bash
# Check SZN in kpi_logs.json - should have 4 signals
# If not:
python backfill_signals_from_telegram.py
git add kpi_logs.json && git commit -m "Backfill signals" && git push
```

### 3. Verify API
```bash
curl https://my-project-production-3d70.up.railway.app/api/alerts/recent?limit=1
# Check: SZN has callers>0, subs>0, and 4 signals
```

## ✅ Done!
Frontend will automatically show correct data once API returns it.

