<#
===========================================================
  HomeFix India — Automated Mail Trigger Verification
  Version: v1.5 🪶  (PowerShell One-File Test Suite)
  Author : Edith for Jagadish
===========================================================
#>

# --- CONFIG ------------------------------------------------
$SUPABASE_EDGE_URL = "https://xnubmphixlpkyqfhghup.functions.supabase.co/send-booking-email-core"
$AUTH_HEADER = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudWJtcGhpeGxwa3lxZmhnaHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI1MTQ2MSwiZXhwIjoyMDc1ODI3NDYxfQ.hRjJP3yJU5j2EdvrhSQCUMiHxOJ3Hd5ZS-rj-Hhe2Xg"
$TO_EMAIL = "connectjagadish@gmail.com"

function Send-HomeFixMail {
    param (
        [string]$subject,
        [string]$html
    )
    Write-Host "-----------------------------------------------------------"
    Write-Host "🧩 Sending: $subject"
    Write-Host "-----------------------------------------------------------"

    $body = @{
        to      = $TO_EMAIL
        subject = $subject
        message = $html
    } | ConvertTo-Json -Depth 5

    $response = Invoke-WebRequest -Uri $SUPABASE_EDGE_URL `
        -Method POST `
        -Headers @{
            "Authorization" = $AUTH_HEADER
            "Content-Type"  = "application/json"
        } `
        -Body $body `
        -UseBasicParsing

    Write-Host "✅ Response:" $response.StatusCode $response.StatusDescription
    Write-Host $response.Content
    Write-Host "`n"
}

# --- TEST SEQUENCE ----------------------------------------

# 1️⃣  Welcome Mail
Send-HomeFixMail `
    -subject "Welcome to HomeFix India 🏠" `
    -html "<h2>Hello Jagadish 🪶</h2><p>Your account is now active with HomeFix India.<br>Explore services and DIY tools.</p><p style='color:#777;font-size:12px;'>— HomeFix System</p>"

Start-Sleep -Seconds 2

# 2️⃣  Booking Confirmation
Send-HomeFixMail `
    -subject "Booking Confirmed — False Ceiling Installation" `
    -html "<h3>✅ Booking Confirmed!</h3><p>Your booking for <b>False Ceiling Installation</b> has been received successfully.</p><p><b>Date:</b> 25 Oct 2025<br><b>Slot:</b> 10 AM – 12 PM</p><p style='color:#777;font-size:12px;'>— HomeFix India</p>"

Start-Sleep -Seconds 2

# 3️⃣  Booking Status Update
Send-HomeFixMail `
    -subject "Booking Update — False Ceiling Installation" `
    -html "<h3>Status Update</h3><p>Your booking for <b>False Ceiling Installation</b> has been updated to <b>SCHEDULED</b>.</p><p>Our team will reach you soon.</p><p style='color:#777;font-size:12px;'>— HomeFix India</p>"

Start-Sleep -Seconds 2

# 4️⃣  Admin Broadcast
Send-HomeFixMail `
    -subject "System Broadcast — HomeFix India" `
    -html "<h2>Broadcast Message</h2><p>HomeFix automation mail triggers are now live and stable 🎉</p><p>Welcome aboard!</p><p style='color:#777;font-size:12px;'>— Admin | HomeFix India</p>"

Write-Host "-----------------------------------------------------------"
Write-Host "🏁 All test mails sent. Check your Gmail + Resend dashboard."
Write-Host "-----------------------------------------------------------"
