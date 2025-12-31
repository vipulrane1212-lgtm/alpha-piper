# 🚀 Complete Supabase Edge Function Deployment Guide

## Quick Links (Click These)

- **Set Secret**: https://supabase.com/dashboard/project/uzalzrrvwrxhszznlcgy/settings/functions
- **Deploy Function**: https://supabase.com/dashboard/project/uzalzrrvwrxhszznlcgy/functions

---

## Step 1: Set the Environment Secret ⚙️

1. **Go to Secrets Page**: 
   - Click: https://supabase.com/dashboard/project/uzalzrrvwrxhszznlcgy/settings/functions
   - Or: Dashboard → Your Project → Settings → Edge Functions → Secrets

2. **Add New Secret**:
   - Click the **"Add Secret"** or **"New Secret"** button
   - **Name**: `SOLBOY_API_URL`
   - **Value**: `https://my-project-production-3d70.up.railway.app`
   - Click **"Save"** or **"Add"**

✅ Secret is now set!

---

## Step 2: Deploy the Function 📦

1. **Go to Functions Page**:
   - Click: https://supabase.com/dashboard/project/uzalzrrvwrxhszznlcgy/functions
   - Or: Dashboard → Your Project → Edge Functions → Functions

2. **Create/Edit Function**:
   - If `solboy-api` exists: Click on it to edit
   - If it doesn't exist: Click **"Create a new function"** or **"New Function"**

3. **Function Details**:
   - **Function Name**: `solboy-api`
   - **Runtime**: Deno (should be default)

4. **Paste the Code**:
   - Open the file: `supabase/functions/solboy-api/index.ts` in your editor
   - **Select ALL** the code (Ctrl+A)
   - **Copy** it (Ctrl+C)
   - **Paste** it into the Supabase function editor

5. **Deploy**:
   - Click the **"Deploy"** button
   - Wait for deployment to complete (usually 10-30 seconds)

✅ Function is now deployed!

---

## Step 3: Verify It Works ✅

1. **Test the Function**:
   - Go to: https://supabase.com/dashboard/project/oaoaihienaacnmavfase/functions
   - Click on `solboy-api`
   - Look for a **"Invoke"** or **"Test"** button
   - Or test via your Vercel app: https://solboyalerts.vercel.app

2. **Check Logs**:
   - In the function page, check the **"Logs"** tab
   - You should see function activity

---

## What This Function Does 🔧

- Proxies requests from your Vercel app to your Railway API
- Enriches alerts with real-time market cap data from DexScreener
- Handles CORS for your frontend
- Provides endpoints: `/stats`, `/alerts`, `/health`

---

## Troubleshooting 🔍

**Function not working?**
- Check that the secret `SOLBOY_API_URL` is set correctly
- Verify your Railway API is running: https://my-project-production-3d70.up.railway.app/api/health
- Check function logs in Supabase Dashboard

**Can't find the function?**
- Make sure you're in the correct project: `uzalzrrvwrxhszznlcgy`
- Check you're logged into Supabase

**Need help?**
- Supabase Docs: https://supabase.com/docs/guides/functions
- Your function code is in: `supabase/functions/solboy-api/index.ts`

---

## After Deployment 🎉

Your Vercel app at **https://solboyalerts.vercel.app** will now be able to:
- ✅ Fetch real-time statistics
- ✅ Get recent alerts
- ✅ Display live market cap data

Everything should work automatically! 🚀

