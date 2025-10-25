# 🎯 QUICK START - Get Your Map Working in 5 Minutes!

## 🚨 IMPORTANT: You Need a Google Maps API Key!

The map feature is now using **REAL Google Maps API**. The placeholder key in `.env` won't work. Here's how to get yours:

---

## 📋 Simple 5-Step Process

### Step 1: Go to Google Cloud Console

👉 **Link**: https://console.cloud.google.com/

### Step 2: Create Project (30 seconds)

1. Click **"Select a project"** (top left, next to "Google Cloud")
2. Click **"NEW PROJECT"**
3. Project name: `RecovAI` (or anything you want)
4. Click **"CREATE"**
5. Wait 10 seconds for project creation

### Step 3: Enable Maps API (1 minute)

1. In the search bar at top, type: **"Maps JavaScript API"**
2. Click on **"Maps JavaScript API"** in results
3. Click the **blue "ENABLE" button**
4. Wait for it to enable (shows green checkmark)

### Step 4: Create API Key (30 seconds)

1. You'll see a popup saying "To use this API, you may need credentials"
2. Click **"CREATE CREDENTIALS"**
3. Or go to: **"APIs & Services" → "Credentials"** (left sidebar)
4. Click **"+ CREATE CREDENTIALS" → "API Key"**
5. A popup shows your API key (starts with `AIzaSy...`)
6. **COPY THIS KEY!** 📋

### Step 5: Add Key to Your Project (15 seconds)

1. Open this file: `frontend/.env`
2. Find this line:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyBCgOtR8K-z7VZxYqYqYqYqYqYqYqYqYqY
   ```
3. Replace the placeholder with your real key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyDfG2H3J4K5L6M7N8P9Q0R1S2T3U4V5W6X
   ```
   (Use YOUR key, not this example!)
4. **SAVE the file** (Ctrl+S)

---

## 🚀 Restart and Test!

### Restart Frontend:

```powershell
# Stop current server (Ctrl+C in terminal)
# Then run:
cd frontend
npm run dev
```

### Test the Map:

1. Open browser: http://localhost:3000
2. Login as patient:
   - Email: `john.doe@email.com`
   - Password: `patient123`
3. Click **"📍 Find Nearby Centers"** tab
4. **YOU SHOULD SEE REAL GOOGLE MAPS!** 🎉

---

## ✅ What You'll See

### ❌ BEFORE (Mock Map):

```
┌─────────────────────────────────────┐
│                                     │
│     Gradient Background             │
│           📍                        │
│      Interactive Map                │
│                                     │
│  💡 This is a demo map...           │
│                                     │
└─────────────────────────────────────┘
```

### ✅ AFTER (Real Google Maps):

```
┌─────────────────────────────────────┐
│  🗺️  Real Google Maps!             │
│                                     │
│    Streets, Buildings, Labels       │
│         📍 📍 📍                    │
│       🔵 (You)                      │
│    Green & Purple Markers           │
│    Zoom, Pan, Satellite View        │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎯 Features Now Working

- ✅ **Real map tiles** (streets, satellite, terrain)
- ✅ **6 interactive markers** (green = rehab, purple = physio)
- ✅ **Your location** (blue circle)
- ✅ **Click markers** → See center details
- ✅ **Pan & zoom** → Explore Bengaluru
- ✅ **"Center on Me"** button → Jump to your location
- ✅ **Search & filter** → Find specific centers

---

## 💰 Cost: FREE!

- Google gives **$200/month free credit**
- This map uses ~$10-20/month MAX (with heavy usage)
- **You stay in free tier** ✅

---

## 🔒 Optional: Secure Your API Key (Recommended)

After creating the key, click **"RESTRICT KEY"** in Google Cloud Console:

1. **Application restrictions**:

   - Select: **"HTTP referrers (websites)"**
   - Add: `http://localhost:3000/*`
   - Add: `http://localhost:3005/*`

2. **API restrictions**:

   - Select: **"Restrict key"**
   - Check only: **"Maps JavaScript API"**

3. Click **"SAVE"**

This prevents others from using your key if they find it.

---

## 🐛 Troubleshooting

### Map shows gray tiles:

- **Cause**: API key not added to `.env`
- **Fix**: Add your real key to `frontend/.env`, restart server

### "This page can't load Google Maps correctly":

- **Cause**: Maps JavaScript API not enabled
- **Fix**: Go to Google Cloud Console → Enable "Maps JavaScript API"

### "You must enable Billing on the Google Cloud Project":

- **Cause**: Google requires billing info (but charges nothing in free tier)
- **Fix**: Go to Google Cloud Console → Billing → Add payment method
- **Note**: Google won't charge unless you exceed $200/month (unlikely!)

---

## 📞 Need Help?

1. **Check browser console** (F12 → Console tab)
2. **Look for errors** mentioning "Google Maps" or "API key"
3. **Verify `.env` file** has your real key (not placeholder)
4. **Restart server** after changing `.env`

---

## 🎉 You're Done!

Once you add your API key and restart:

- Real Google Maps will load
- 6 centers near PES University visible
- Interactive markers you can click
- Search/filter/navigate the map

**Enjoy your fully functional map feature!** 🗺️✨

---

**Files to check**:

- `frontend/.env` ← Add your API key here
- `GOOGLE_MAPS_SETUP.md` ← Full detailed guide
- `REAL_MAPS_IMPLEMENTATION.md` ← Technical details
