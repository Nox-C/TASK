# 🤖 WALL-E Trading Dashboard - Deployment Guide

## 🚀 Render Free Tier Deployment

### 📋 Prerequisites

- GitHub repository with the cleaned codebase
- Render account (free tier)
- Cron-job.org account (free)
- pnpm package manager installed locally

---

## 🎯 Step-by-Step Deployment

### 1. **Push to GitHub**

```bash
git add .
git commit -m "🤖 EVE Red Eye Production Ready"
git push origin main
```

### 2. **Create Render Blueprint**

1. Log in to [Render Dashboard](https://render.com)
2. Click **"Blueprints"** → **"New Blueprint Instance"**
3. Connect your GitHub repository
4. Render will automatically read the `render.yaml` file
5. **Approve** the configuration

### 3. **Configure Environment Variables**

Render will prompt for these values during first deploy:

```env
NEXT_PUBLIC_API_URL=https://eve-trading-system.onrender.com
NEXT_PUBLIC_WS_URL=wss://eve-trading-system.onrender.com
NEXT_PUBLIC_WS_ENDPOINT=wss://stream.binance.com:9443/ws
```

### 4. **Deploy and Test**

- Click **"Approve"** to start deployment
- Wait for build (first build takes ~2-3 minutes)
- Test EVE Red Eye system by visiting your URL

---

## 🔄 Auto-Ping Configuration (Prevents Sleep)

### **Cron-job.org Setup**

1. Sign up at [Cron-job.org](https://cron-job.org)
2. Create new cron job:
   - **Title:** `WALL-E Keep Awake`
   - **URL:** `https://your-app.onrender.com/api/health`
   - **Schedule:** `*/14 * * * *` (Every 14 minutes)
   - **Method:** `GET`

### **Alternative: UptimeRobot**

- Free service that pings every 5 minutes
- Target: `https://your-app.onrender.com/api/health`

---

## 🚨 EVE Red Eye System Features

### **WebSocket Self-Healing**

- Auto-reconnect after 10 seconds on failure
- Red pulsing animation when disconnected
- Manual "REBOOT DIRECTIVE" button available

### **API Error Handling**

- Global interceptor catches 401/500 errors
- System-wide red eye activation
- Clear system error functionality

### **Visual Status Indicators**

- Per-symbol connection status
- Global system health bar
- Real-time error feedback

---

## 🌍 Environment Variables Explained

| Variable | Purpose | Example |
|-----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | REST API endpoint | `https://app.onrender.com` |
| `NEXT_PUBLIC_WS_URL` | WebSocket endpoint | `wss://app.onrender.com` |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment flag | `production` |
| `NEXT_PUBLIC_ENABLE_ERROR_LOGS` | Error logging | `true` |

---

## 🔧 Troubleshooting

### **EVE Red Eye Always On**

- Check WebSocket URL in environment variables
- Verify Binance WebSocket accessibility
- Check browser console for connection errors

### **Slow First Load**

- Normal for free tier (30s wake-up time)
- EVE Red Eye will show during wake-up
- Auto-ping prevents future sleep issues

### **Build Failures**

- Ensure all dependencies installed
- Check for TypeScript errors
- Verify environment variables syntax

---

## 📊 Performance Optimization

### **Free Tier Limitations**

- **Sleep:** After 15 minutes inactivity
- **Wake-up:** ~30 seconds for first visitor
- **Bandwidth:** 100GB/month limit
- **Build Time:** ~2-3 minutes

### **Mitigation Strategies**

- Auto-ping every 14 minutes
- Optimize bundle size
- Use CDN for static assets
- Implement caching headers

---

## 🎯 Production Checklist

- [ ] Mock data completely purged
- [ ] Environment variables configured
- [ ] EVE Red Eye animation working
- [ ] WebSocket auto-reconnect tested
- [ ] API error handling verified
- [ ] Health endpoint accessible
- [ ] Auto-ping service configured
- [ ] SSL certificate active
- [ ] Domain properly configured

---

## 🌟 Success Indicators

✅ **Green Status:** All systems operational  
✅ **EVE Blue Eye:** WebSocket connected  
✅ **Fast Load:** Under 2 seconds  
✅ **Auto-Healing:** Errors recover automatically  
✅ **No Sleep:** Auto-ping keeping service alive  

🚨 **Red Eye:** System needs attention  
🔧 **Manual Reboot:** User intervention required  
⏰ **Slow Load:** Service waking from sleep  

---

**🤖 WALL-E Trading Dashboard - EVE Red Eye System Ready for Production!**
