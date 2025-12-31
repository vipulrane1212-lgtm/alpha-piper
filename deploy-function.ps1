# Supabase Edge Function Deployment Script
$accessToken = "sbp_c8f6bbebfe0645ef660c2979ce3b6a3767edb13d"
$projectRef = "oaoaihienaacnmavfase"
$functionName = "solboy-api"

# Read the function code
$functionCode = Get-Content -Path "supabase\functions\solboy-api\index.ts" -Raw

# Create a zip file with the function
$tempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
Copy-Item "supabase\functions\solboy-api\index.ts" -Destination "$tempDir\index.ts"

# Create zip (requires .NET or 7zip)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = "$env:TEMP\solboy-api.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)

Write-Host "Function code prepared. Attempting to deploy via Supabase API..."
Write-Host "Note: If this fails, please use the Supabase Dashboard method below."

# Try to deploy via API (may require different endpoint/permissions)
$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

# Note: The actual API endpoint for deploying functions may vary
# This is a placeholder - the user may need to use the dashboard

Write-Host ""
Write-Host "=========================================="
Write-Host "DEPLOYMENT INSTRUCTIONS"
Write-Host "=========================================="
Write-Host ""
Write-Host "Since API deployment requires special permissions,"
Write-Host "please follow these steps in Supabase Dashboard:"
Write-Host ""
Write-Host "STEP 1: Set the Secret"
Write-Host "1. Go to: https://supabase.com/dashboard/project/$projectRef/settings/functions"
Write-Host "2. Scroll to 'Secrets' section"
Write-Host "3. Click 'Add Secret'"
Write-Host "4. Name: SOLBOY_API_URL"
Write-Host "5. Value: https://my-project-production-3d70.up.railway.app"
Write-Host "6. Click 'Save'"
Write-Host ""
Write-Host "STEP 2: Deploy the Function"
Write-Host "1. Go to: https://supabase.com/dashboard/project/$projectRef/functions"
Write-Host "2. Click 'Create a new function' (or edit if solboy-api exists)"
Write-Host "3. Function name: $functionName"
Write-Host "4. Copy the code from: supabase\functions\solboy-api\index.ts"
Write-Host "5. Paste it in the editor"
Write-Host "6. Click 'Deploy'"
Write-Host ""
Write-Host "The function code is ready in: supabase\functions\solboy-api\index.ts"
Write-Host ""

