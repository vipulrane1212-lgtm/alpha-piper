# 🚀 Simple Supabase Deployment - Just Follow These Steps

## What You Need to Do (5 minutes)

### Step 1: Go to Supabase Dashboard
1. Open your browser
2. Go to: **https://supabase.com/dashboard**
3. **Sign in** with your account (GitHub/Email)

### Step 2: Find or Create Your Project

**If you see a project list:**
- Look for a project, or
- Click **"New Project"** to create one
- Note down the **Project Reference ID** (you'll see it in the URL or project settings)

**Your project is already created!**
- Project Reference: `uzalzrrvwrxhszznlcgy`
- Project URL: `https://uzalzrrvwrxhszznlcgy.supabase.co`

**If you need to create a new project:**
- Name: `SolBoy Alerts`
- Choose a region
- Set a database password (save it!)
- Wait 2-3 minutes for setup

### Step 3: Get Your Project Details

Once you're in your project:
1. Go to **Settings** → **API**
2. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project Reference**: `xxxxx` (this is your project ID)
   - **anon/public key**: `eyJhbGc...` (long token)

**Copy these down!**

### Step 4: Set the Secret

1. Go to: **Edge Functions** → **Secrets** (in left sidebar)
2. Click **"Add Secret"** or **"New Secret"**
3. Enter:
   - **Name**: `SOLBOY_API_URL`
   - **Value**: `https://my-project-production-3d70.up.railway.app`
4. Click **"Save"**

✅ Secret is set!

### Step 5: Deploy the Function

1. Go to: **Edge Functions** → **Functions** (in left sidebar)
2. Click **"Create a new function"** or **"New Function"**
3. **Function Name**: `solboy-api`
4. **Copy the code**:
   - Open this file in your code editor: `supabase/functions/solboy-api/index.ts`
   - Select ALL (Ctrl+A)
   - Copy (Ctrl+C)
   - Paste into the Supabase editor
5. Click **"Deploy"**
6. Wait for it to finish (10-30 seconds)

✅ Function is deployed!

### Step 6: Update Your Code (If You Created New Project)

If you created a NEW project (not the old one), I need to update your code with the new project details.

**Share with me:**
- Your new Project Reference ID
- Your new Project URL
- Your new anon/public key

Then I'll update all the files automatically!

---

## That's It! 🎉

After Step 5, your Vercel app at **https://solboyalerts.vercel.app** should work!

---

## Quick Checklist

- [ ] Signed into Supabase Dashboard
- [ ] Found or created project
- [ ] Set secret `SOLBOY_API_URL`
- [ ] Deployed function `solboy-api`
- [ ] (If new project) Shared project details with me

---

## Need Help?

If you get stuck at any step, just tell me which step and what error you see!

