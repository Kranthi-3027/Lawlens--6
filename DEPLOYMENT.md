# LawLens - AI Legal Assistant

An AI-powered legal document analysis tool using Google's Gemini AI.

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Generative AI API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Kranthi-3027/lawlens-5.git
cd lawlens-5
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory (copy from `.env.example`):
```env
# Google Gemini API (for serverless function)
API_KEY=your_google_gemini_api_key_here

# Firebase Configuration (for authentication)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**IMPORTANT:** Never commit your `.env` file to git!

### Local Development

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard (Settings → Environment Variables):
   
   **For the API (serverless function):**
   - Key: `API_KEY`
   - Value: Your Google Gemini API key
   
   **For Firebase (frontend):**
   - Key: `VITE_FIREBASE_API_KEY`
   - Value: Your Firebase API key
   - Key: `VITE_FIREBASE_AUTH_DOMAIN`
   - Value: Your Firebase auth domain (e.g., `your-project.firebaseapp.com`)
   - Key: `VITE_FIREBASE_PROJECT_ID`
   - Value: Your Firebase project ID
   - Key: `VITE_FIREBASE_STORAGE_BUCKET`
   - Value: Your Firebase storage bucket
   - Key: `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - Value: Your Firebase messaging sender ID
   - Key: `VITE_FIREBASE_APP_ID`
   - Value: Your Firebase app ID
   - Key: `VITE_FIREBASE_MEASUREMENT_ID`
   - Value: Your Firebase measurement ID

4. Deploy!
5. **IMPORTANT:** Add your Vercel domain to Firebase Console → Authentication → Authorized domains

**Important:** The Gemini API key is stored securely on the server (in `/api/chat.js`) and is never exposed to the client. Firebase config values are safe to be in the frontend bundle.

### Netlify Deployment

1. Push your code to GitHub
2. Import the project in Netlify
3. Add environment variables in Netlify dashboard (Site settings → Environment variables):
   
   **Same variables as Vercel above** (API_KEY and all VITE_FIREBASE_* variables)

4. Deploy!
5. **IMPORTANT:** Add your Netlify domain to Firebase Console → Authentication → Authorized domains

## Security

- ✅ Gemini API key is kept server-side in serverless functions (never exposed to client)
- ✅ Firebase config uses environment variables (no hardcoded secrets in code)
- ✅ `.env` files are gitignored
- ✅ CORS is properly configured
- ✅ Firebase public config values are safe in frontend bundle

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Vercel Serverless Functions
- **AI:** Google Generative AI (Gemini)
- **Auth:** Firebase Authentication
- **Storage:** Firebase Firestore

## License

MIT
