# 🏠 LOCAL MACHINE SETUP GUIDE - Simple Expense Tracker

## 📥 Getting the Project Files

Since you don't have terminal access, you'll need to get the project files through one of these methods:

### Method 1: Request Files from Emergent Support
Contact Emergent support and request the project files from:
- **Path**: `/app/frontend`
- **Project**: Simple Expense Tracker
- **Format**: ZIP or TAR.GZ (excluding node_modules)

### Method 2: Download Through Emergent UI
Check if Emergent provides:
- File browser/explorer
- Download button for folders
- Export project option

### Method 3: Recreate Project Locally (If needed)
I'll provide all file contents below so you can recreate the project manually.

---

## 🚀 ONCE YOU HAVE THE FILES - Local Setup

### Step 1: Extract Project
1. Extract the downloaded archive to your desired location:
   ```
   ~/Documents/simple-expense-tracker/
   ```

2. You should see this structure:
   ```
   simple-expense-tracker/
   └── frontend/
       ├── app/
       ├── assets/
       ├── constants/
       ├── utils/
       ├── app.json
       ├── eas.json
       ├── package.json
       └── ...
   ```

---

### Step 2: Install Dependencies

Open terminal on your Mac/PC and navigate to the frontend folder:

```bash
cd ~/Documents/simple-expense-tracker/frontend
```

Install Node.js dependencies:
```bash
yarn install
# or
npm install
```

**Expected Time**: 2-3 minutes

---

### Step 3: Install EAS CLI

```bash
npm install -g eas-cli
```

**Verify installation**:
```bash
eas --version
```

You should see something like: `eas-cli/5.2.0`

---

### Step 4: Login to Expo

```bash
eas login
```

**Prompts:**
- Email or username: [your-expo-account]
- Password: [your-password]

**Don't have an Expo account?**
- Go to https://expo.dev/signup
- Create free account
- Come back and run `eas login`

---

### Step 5: Link Project to Your Expo Account

```bash
eas build:configure
```

**Prompts:**
- "Would you like to automatically create an EAS project?" → **Yes**
- It will link the project to your Expo account

---

### Step 6: Build the Android APK

```bash
eas build --platform android --profile preview
```

**What happens:**
1. Code gets uploaded to Expo servers
2. Build starts in the cloud (you'll see progress)
3. Takes 10-15 minutes
4. You get a download URL when complete

**First-time prompts:**
- "Generate a new Android keystore?" → **Yes**
- This creates a signing certificate for your app

---

### Step 7: Monitor Build Progress

You'll see output like:
```
✓ Uploading to Expo cloud...
✓ Build queued...
⠙ Building... (this takes 10-15 minutes)
```

**You can also:**
- Visit the build URL shown in terminal
- Check status at https://expo.dev/accounts/[your-account]/projects

---

### Step 8: Download and Install APK

When build completes:
```
✓ Build finished!
APK: https://expo.dev/artifacts/eas/[...]/build-[...].apk
```

**On your Android phone:**
1. Open the APK URL in browser
2. Download the APK file
3. Open Downloads folder
4. Tap the APK to install
5. Allow "Install from unknown sources" if prompted

---

## 🎯 Complete Command Reference

For copy-paste convenience:

```bash
# Navigate to project
cd ~/Documents/simple-expense-tracker/frontend

# Install dependencies
yarn install

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build APK
eas build --platform android --profile preview
```

---

## 📋 System Requirements

**Your Local Machine:**
- macOS, Windows, or Linux
- Node.js 18+ installed
- Git (optional)
- Internet connection

**Check Node.js version:**
```bash
node --version
```

Should be: `v18.0.0` or higher

**Don't have Node.js?**
- Download from: https://nodejs.org/
- Install LTS version
- Restart terminal

---

## ✅ Testing Checklist

After APK is installed:
- [ ] App icon: Blue square with "ET"
- [ ] Splash screen: Blue with "ET" logo
- [ ] Can add expenses
- [ ] Can edit expenses
- [ ] Can delete expenses (with confirmation)
- [ ] FAB positioned correctly (bottom-right)
- [ ] No content overlap
- [ ] Time filters work
- [ ] All screens fit properly

---

## 🆘 Troubleshooting

### Issue: "node: command not found"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: "yarn: command not found"
**Solution**: 
```bash
npm install -g yarn
# or just use npm:
npm install
```

### Issue: "eas: command not found"
**Solution**: 
```bash
npm install -g eas-cli
```

### Issue: Build fails
**Solution**: 
```bash
# Clear cache and retry
eas build --platform android --profile preview --clear-cache
```

### Issue: "Can't find app.json"
**Solution**: Make sure you're in the `frontend` folder:
```bash
cd ~/Documents/simple-expense-tracker/frontend
ls -la
# You should see app.json, eas.json, package.json
```

---

## 📞 Need Help Getting Files?

If you're unable to download files from Emergent:

1. **Check Emergent documentation** for file export
2. **Contact Emergent support** - they can provide the files
3. **Alternative**: I can provide individual file contents for manual recreation

---

## 🎉 What You'll Get

After following these steps:
- ✅ Standalone Android APK (~40-60 MB)
- ✅ Installable directly on any Android device
- ✅ Full branding (blue "ET" icon + splash)
- ✅ All features working offline
- ✅ Professional, production-ready build

---

**Timeline:**
- Setup: 5-10 minutes
- Build: 10-15 minutes
- **Total: 20-25 minutes**

---

**Ready to start?** Get the project files first, then follow the steps above! 🚀
