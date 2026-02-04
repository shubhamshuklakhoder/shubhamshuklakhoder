# 📦 EAS BUILD INSTRUCTIONS - Simple Expense Tracker

## ✅ Pre-Build Checklist (Already Complete)

- ✅ `eas.json` configuration created
- ✅ `app.json` properly configured
- ✅ App icons created (icon.png, adaptive-icon.png, splash-icon.png)
- ✅ All dependencies installed
- ✅ Code is ready for production build

---

## 🚀 Step-by-Step Build Instructions

### Prerequisites
- You need an **Expo account** (free to create)
- You need **EAS CLI** installed on your machine

---

## 📋 EXACT COMMANDS TO RUN

### Step 1: Install EAS CLI (One-time setup)

Open your terminal and run:

```bash
npm install -g eas-cli
```

**Expected output**: 
```
✓ EAS CLI installed successfully
```

---

### Step 2: Navigate to Project Directory

```bash
cd /app/frontend
```

---

### Step 3: Login to Expo

```bash
eas login
```

**What happens:**
- You'll be prompted to enter your Expo username/email
- Then your password
- If you don't have an account, you'll see a link to create one (it's free)

**Example:**
```
? Email or username: your-email@example.com
? Password: [hidden]
✓ Logged in as your-email@example.com
```

---

### Step 4: Configure Your Project (First-time only)

```bash
eas build:configure
```

**What happens:**
- EAS will ask if you want to automatically create an `eas.json` file
- Type: **n** (no) - we already created it
- It will link your project to your Expo account

**Expected output:**
```
✓ Project linked to your Expo account
```

---

### Step 5: Build the Android APK

```bash
eas build --platform android --profile preview
```

**What happens:**
- EAS will upload your code to their cloud servers
- Build process starts (takes 10-15 minutes)
- You'll see progress updates in real-time

**Expected output:**
```
✓ Build in progress...
✓ Build link: https://expo.dev/accounts/[your-account]/projects/simple-expense-tracker/builds/[build-id]
```

**Note**: If this is your first build, you may be asked:
- "Generate a new Android keystore?" → **Yes**
- This is needed to sign your app

---

### Step 6: Wait for Build to Complete

The terminal will show:
```
⠋ Build in progress. Wait for it to complete...
```

You can also:
- Visit the build link in your browser to watch progress
- Close terminal and check later (build continues in cloud)

**When complete, you'll see:**
```
✓ Build finished!
✓ Download URL: https://expo.dev/artifacts/eas/[...]/build-[...].apk
```

---

### Step 7: Install APK on Your Device

**Option A: Direct Download on Device**
1. Open the download URL on your Android phone
2. Download the APK
3. Tap to install
4. If prompted, allow "Install from unknown sources"

**Option B: Download on Computer, Transfer to Phone**
1. Download APK from the URL on your computer
2. Transfer to phone via USB/cloud/email
3. Open on phone and install

---

## 📱 What to Test After Installation

Once installed, verify:

### ✅ App Icon
- Open your app drawer
- Look for "Simple Expense Tracker"
- Icon should be: **Blue square with white "ET" text**

### ✅ Splash Screen
- Tap to open the app
- You should see: **Blue screen with white "ET" logo**
- Appears for 1-2 seconds on cold start

### ✅ FAB Behavior
1. Add 10-15 expenses
2. Scroll to bottom of list
3. Check:
   - FAB doesn't overlap content
   - Last expense is fully visible
   - Proper spacing at bottom

### ✅ Screen Fit
- All content fits on screen
- No clipping or overflow
- Safe areas respected (notch, navigation bar)

---

## 🔧 Troubleshooting

### Issue: "eas: command not found"
**Solution**: 
```bash
npm install -g eas-cli
# or
yarn global add eas-cli
```

### Issue: "Not logged in"
**Solution**: 
```bash
eas login
```

### Issue: "Build failed"
**Solution**: 
- Check the build logs at the build URL
- Common fixes:
  ```bash
  # Clear cache and retry
  eas build --platform android --profile preview --clear-cache
  ```

### Issue: "Can't install APK on phone"
**Solution**:
- Enable "Install from unknown sources" in Android settings
- Settings → Security → Unknown Sources → Enable

---

## 📊 Build Time & Cost

- **Build time**: 10-15 minutes (cloud build)
- **Cost**: Free tier includes builds (check expo.dev for limits)
- **APK size**: Approximately 40-60 MB

---

## 🎯 Quick Reference

```bash
# Complete build process (copy-paste friendly)
npm install -g eas-cli
cd /app/frontend
eas login
eas build:configure
eas build --platform android --profile preview
```

---

## 📝 After Build Success

Once you have the APK installed and tested:

1. **Verify all features work**:
   - ✅ App icon displays correctly
   - ✅ Splash screen shows
   - ✅ Can add expenses
   - ✅ Can edit expenses  
   - ✅ Can delete expenses
   - ✅ FAB positioning correct
   - ✅ All screens fit properly

2. **Report back**:
   - Any issues found
   - Screenshots if needed
   - Confirmation if everything works

3. **Next steps**:
   - Final approval for release
   - Optionally: Create production build for Play Store

---

## 🆘 Need Help?

If you encounter any issues during the build process:
1. Share the error message
2. Share the build URL (if build started)
3. Note which step you're stuck on

I'll help you resolve it immediately.

---

## ✅ Expected Outcome

After following these steps, you should have:
- ✅ A standalone APK file
- ✅ Installed on your device
- ✅ Custom "ET" icon visible
- ✅ Blue splash screen working
- ✅ All features functional
- ✅ Perfect layout and spacing

---

*Ready to build? Start with Step 1!* 🚀

---

## 📌 Quick Notes

- **Free account works**: No payment required for first builds
- **Build happens in cloud**: Your computer doesn't need to be powerful
- **Can close terminal**: Build continues even if you close terminal
- **Reusable**: Can rebuild anytime with same commands
- **Version updates**: Change version in app.json, rebuild

---

**Configuration Files Already Created:**
- ✅ `/app/frontend/eas.json` - Build configuration
- ✅ `/app/frontend/app.json` - App metadata
- ✅ `/app/frontend/assets/images/*` - All icons

**You're ready to build!** Just follow the commands above. 🎉
