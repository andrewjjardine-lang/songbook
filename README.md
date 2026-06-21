# 🔥 Campfire Songbook

A shareable web app for collecting song suggestions and generating a printable campfire songbook.

---

## Quick Setup (15–20 minutes)

You need two free accounts: **Firebase** (stores song submissions) and **Anthropic** (fetches lyrics).

---

### Step 1 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `campfire-songbook`) → Continue through the steps
3. In your new project, click **Firestore Database** in the left sidebar → **Create database**
   - Choose **Start in test mode** (fine for a private app) → pick any location → Enable
4. Click the **⚙ gear icon** → **Project settings** → scroll to **Your apps** → click the `</>` web icon
   - Register the app (any nickname) → copy the `firebaseConfig` values — you'll need them in Step 3

---

### Step 2 — Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → **Create Key**
2. Copy the key (starts with `sk-ant-...`)

---

### Step 3 — Add secrets to GitHub

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Add each of these secrets (names must match exactly):

| Secret name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | from Firebase config |
| `VITE_FIREBASE_AUTH_DOMAIN` | from Firebase config |
| `VITE_FIREBASE_PROJECT_ID` | from Firebase config |
| `VITE_FIREBASE_STORAGE_BUCKET` | from Firebase config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from Firebase config |
| `VITE_FIREBASE_APP_ID` | from Firebase config |
| `VITE_ANTHROPIC_API_KEY` | your `sk-ant-...` key |

---

### Step 4 — Enable GitHub Pages

1. In your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**

---

### Step 5 — Push this code

```bash
git init
git add .
git commit -m "Initial campfire songbook"
git remote add origin https://github.com/YOUR_USERNAME/songbook.git
git branch -M main
git push -u origin main
```

GitHub Actions will automatically build and deploy. In ~2 minutes your app will be live at:

**`https://YOUR_USERNAME.github.io/songbook/`**

---

## Using the app

### For guests
Send them your GitHub Pages URL. They click **Suggest a Song**, type in a title (and optionally artist + lyrics), and submit.

### For you (admin)
1. Go to the **Admin & Booklet** tab
2. Password: `campfire2026` (change it in `src/App.jsx` line 5)
3. See all submissions, fetch missing lyrics with one click, edit anything manually
4. Click **Preview Booklet** → **Print / Save PDF** to generate your printable songbook

---

## Changing the admin password

Open `src/App.jsx` and change line 5:
```js
const ADMIN_PASSWORD = 'campfire2026'
```

Then commit and push — GitHub Actions will redeploy automatically.
