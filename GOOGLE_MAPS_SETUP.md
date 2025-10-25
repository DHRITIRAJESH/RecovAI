# Google Maps API Integration Guide

## 🚀 Quick Start

The map feature is now using **REAL Google Maps API**! Here's what you need to do:

## 📋 Getting Your Google Maps API Key

### Step 1: Go to Google Cloud Console

Visit: https://console.cloud.google.com/

### Step 2: Create or Select a Project

1. Click on the project dropdown (top left)
2. Click "New Project"
3. Name it (e.g., "RecovAI Maps")
4. Click "Create"

### Step 3: Enable Required APIs

1. Go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Maps JavaScript API** (required for map display)
   - **Places API** (optional, for advanced features)
   - **Geocoding API** (optional, for address lookup)

### Step 4: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "API Key"
3. Copy the generated API key
4. **IMPORTANT**: Click "Restrict Key" for security

### Step 5: Restrict Your API Key (Security)

1. Under "Application restrictions":

   - Select "HTTP referrers (websites)"
   - Add: `http://localhost:3000/*`
   - Add: `http://localhost:3005/*`
   - Add your production domain when deploying

2. Under "API restrictions":

   - Select "Restrict key"
   - Select only the APIs you enabled (Maps JavaScript API, etc.)

3. Click "Save"

### Step 6: Add Key to Your Project

1. Open `frontend/.env` file
2. Replace the placeholder key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```
3. Save the file
4. Restart your frontend server

## 🎯 What's Changed

### ✅ Real Google Maps

- **Before**: Mock gradient background with static pins
- **After**: Interactive Google Maps with pan, zoom, satellite view

### ✅ Interactive Markers

- **Green markers**: Rehabilitation Centers
- **Purple markers**: Physiotherapy Centers
- **Blue marker**: Your current location
- Click any marker to see center details in an InfoWindow

### ✅ User Location

- Automatically detects your location (with permission)
- "Center on Me" button to re-center map to your location
- Falls back to PES University, Banshankari if location denied

### ✅ InfoWindow on Click

- Click any center marker to see:
  - Name and rating
  - Address
  - Distance from you
  - Quick "Call" and "Directions" buttons

## 🎨 Map Features

1. **Map Controls**:

   - Zoom In/Out buttons
   - Street View (drag the yellow person icon)
   - Map Type (Satellite, Terrain, etc.)
   - Fullscreen mode

2. **Marker Colors**:

   - 🟢 Green = Rehab Centers
   - 🟣 Purple = Physio Centers
   - 🔵 Blue = Your Location

3. **Interactions**:
   - Click markers → See details
   - Pan the map → Drag with mouse
   - Zoom → Scroll wheel or +/- buttons
   - Filter centers → Search bar or filter buttons

## 💰 Pricing (Google Maps API)

### Free Tier

- **$200 free credit** per month
- Covers ~28,000 map loads per month
- Most small projects stay free forever

### How to Stay Free

- Restrict API key to your domains only
- Enable only required APIs
- Monitor usage in Google Cloud Console

### For RecovAI Usage

With 6 centers and typical patient usage:

- ~100 users/day × 30 days = 3,000 map loads/month
- **Well within free tier** ✅

## 🔒 Security Best Practices

1. **Never commit API keys to Git**:

   - `.env` file is in `.gitignore`
   - Use environment variables only

2. **Restrict your API key**:

   - HTTP referrers for localhost + production domain
   - API restrictions to only Maps JavaScript API

3. **Monitor usage**:
   - Check Google Cloud Console regularly
   - Set up billing alerts

## 🐛 Troubleshooting

### Map shows gray tiles

- **Issue**: Invalid or missing API key
- **Fix**: Check `.env` file has correct key, restart server

### "This page can't load Google Maps correctly"

- **Issue**: API not enabled or billing not set up
- **Fix**: Enable Maps JavaScript API in Google Cloud Console

### Markers not showing

- **Issue**: Coordinates might be wrong
- **Fix**: Check backend `/api/nearby-centers` returns valid lat/lng

### User location not working

- **Issue**: Browser blocked location permission
- **Fix**: Click the location icon in browser address bar, allow location

## 📍 Current Centers (Bengaluru)

All 6 centers are near PES University, Banshankari:

1. **PES Physiotherapy & Sports Clinic** - 0.5 km (closest!)
2. **Banashankari Rehabilitation Center** - 0.8 km
3. **Padmanabhanagar Physiotherapy** - 1.3 km
4. **South Bangalore Recovery** - 2.1 km
5. **Jayanagar Healing Hands** - 2.5 km
6. **JP Nagar Sports Rehab** - 3.2 km

## 🚀 Next Steps

1. Get your Google Maps API key (5 minutes)
2. Add it to `frontend/.env`
3. Restart frontend: `npm run dev`
4. Login as patient (john.doe@email.com / patient123)
5. Go to "📍 Find Nearby Centers" tab
6. See REAL Google Maps with your centers! 🎉

## 📞 Support

If you face any issues:

1. Check console for errors (F12 in browser)
2. Verify API key is correct in `.env`
3. Ensure Maps JavaScript API is enabled
4. Check browser allows location access

---

**Built with ❤️ for RecovAI - Real maps, real recovery**
