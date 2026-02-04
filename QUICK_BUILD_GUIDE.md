# 🚀 QUICK START - EAS Build Commands

## Copy-Paste Ready Commands

### 1️⃣ Install EAS CLI (one-time)
```bash
npm install -g eas-cli
```

### 2️⃣ Navigate to project
```bash
cd /app/frontend
```

### 3️⃣ Login to Expo
```bash
eas login
```
*Enter your Expo credentials when prompted*

### 4️⃣ Configure project (first-time)
```bash
eas build:configure
```
*Type 'n' when asked about eas.json (already created)*

### 5️⃣ Build the APK
```bash
eas build --platform android --profile preview
```
*Wait 10-15 minutes. You'll get a download link when done.*

---

## ⏱️ Expected Timeline
- Login: 30 seconds
- Configure: 1 minute
- Build: 10-15 minutes
- **Total: ~15 minutes**

---

## 📥 After Build Completes

You'll receive a URL like:
```
https://expo.dev/artifacts/eas/[...]/build-[...].apk
```

**On your Android phone:**
1. Open that URL
2. Download the APK
3. Install it
4. Look for "Simple Expense Tracker" with blue "ET" icon

---

## ✅ What You'll See

- **App Icon**: Blue square with white "ET"
- **Splash Screen**: Blue background with "ET" logo
- **App Name**: Simple Expense Tracker
- **Everything working**: Add, edit, delete expenses

---

## 🆘 Quick Troubleshooting

**"eas: command not found"**
```bash
npm install -g eas-cli
```

**"Not logged in"**
```bash
eas login
```

**"Build failed"**
```bash
eas build --platform android --profile preview --clear-cache
```

---

## 📱 Testing Checklist

After installing:
- [ ] App icon visible (blue "ET")
- [ ] Splash screen shows
- [ ] Can add expenses
- [ ] Can edit expenses
- [ ] Can delete expenses
- [ ] FAB positioned correctly
- [ ] Content fits on screen
- [ ] No overlap issues

---

**Need detailed help?** See `/app/BUILD_INSTRUCTIONS.md`

**Ready?** Just copy the commands above and run them! 🎉
