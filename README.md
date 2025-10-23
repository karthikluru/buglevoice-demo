# Luru Bugle AI - Vercel App

A Vercel deployment of the Luru Bugle AI call interface, converted from AWS Lambda.

## Setup

1. **Deploy to Vercel:**
   ```bash
   cd vercel-app
   vercel
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   - `VAPI_API_KEY`: Your Vapi API key
   - `VAPI_ASSISTANT_ID`: Your Vapi Assistant ID  
   - `VAPI_PHONE_NUMBER_ID`: Your Vapi Phone Number ID

3. **Or use Vercel CLI:**
   ```bash
   vercel env add VAPI_API_KEY
   vercel env add VAPI_ASSISTANT_ID
   vercel env add VAPI_PHONE_NUMBER_ID
   ```

## Development

```bash
npm run dev
```

## Features

- ✅ Beautiful responsive UI
- ✅ Form validation
- ✅ Vapi API integration
- ✅ Phone number formatting (E.164)
- ✅ UTM parameter tracking
- ✅ CORS support
- ✅ Error handling

## Free Tier Compatible

This app is optimized for Vercel's free tier with:
- 30-second function timeout
- Efficient request handling
- No external dependencies beyond Node.js built-ins
