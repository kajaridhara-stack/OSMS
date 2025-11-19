# Email Configuration Guide for OSMS

## Gmail App Password Setup

The OSMS system uses Gmail SMTP to send student credentials via email. Follow these steps to set it up properly:

### Step 1: Enable 2-Step Verification

1. Go to your [Google Account Security Page](https://myaccount.google.com/security)
2. Under "Signing in to Google", select **2-Step Verification**
3. Follow the prompts to enable it (if not already enabled)

### Step 2: Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "OSMS" or "School Management System"
5. Click **Generate**
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables

#### For Local Development:
Add to your `.env` file in the `backend` folder:
```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-char-app-password
```

#### For Render Production:
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your OSMS web service
3. Go to **Environment** tab
4. Add these variables:
   - `EMAIL_USER` = your-gmail-address@gmail.com
   - `EMAIL_PASS` = your-16-char-app-password (remove spaces)
5. Click **Save Changes**
6. Render will automatically redeploy

### Step 4: Test Email

1. Register a new student with a valid email address
2. Check the Render logs for: `✅ Email successfully sent to:`
3. Check the student's inbox for the welcome email

## Troubleshooting

### "Connection timeout" error
- **Check**: App password is correct (no spaces)
- **Check**: 2-Step Verification is enabled
- **Check**: Using the App Password, not your regular Gmail password

### "Invalid login" error
- **Regenerate** the App Password
- **Verify** EMAIL_USER is your full Gmail address

### Still not working?
The system will work perfectly without email - students just won't receive automated emails with their credentials. You can manually share credentials with students.

## Alternative: Use a Different Email Service

If Gmail continues to have issues, consider using:
- **SendGrid** - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5,000 emails/month
- **AWS SES** - Very cheap, highly reliable

Contact support if you need help switching to a different email provider.
