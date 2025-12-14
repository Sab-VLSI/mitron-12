# KrishiMitra - Agriculture Assistant App

An AI-powered agriculture assistant application for farmers with multilingual support, real-time weather data, market prices, and personalized farming advice.

## Features

- 🌾 **Multilingual Support**: Available in 8 languages (English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati)
- 🤖 **AI Chatbot**: Get instant farming advice using Google Generative AI
- 🌤️ **Weather Dashboard**: Real-time weather data and 7-day forecasts
- 📊 **Market Data**: Current commodity prices from various markets
- 📅 **Crop Calendar**: Track cultivation phases and activities
- 💬 **Voice Support**: Voice input and text-to-speech in multiple languages
- 📱 **PWA Support**: Install as a Progressive Web App for offline access
- 🎯 **Government Schemes**: Information about agricultural subsidies and programs

## Prerequisites

- Node.js 18.x or higher
- npm or pnpm package manager
- Google Generative AI API key (optional, but required for chatbot functionality)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd krishimitra-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```
   
   To get a Google Generative AI API key:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy and paste it into your `.env.local` file
   
   **Note**: The app includes a fallback API key for demo purposes, but it's recommended to use your own key for production.

## Running the App

### Development Mode

Start the development server:

```bash
npm run dev
```

or

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

The production server will run on [http://localhost:3000](http://localhost:3000)

## Usage

1. **Login**: Use the demo credentials:
   - Email: `farmer@example.com`
   - Password: `password123`

2. **Profile Setup**: Complete your profile with:
   - Location details (country, state, district)
   - Land area and soil type
   - Soil characteristics (color, texture, drainage, etc.)

3. **Dashboard**: Access personalized farming advice based on your location and soil type

4. **AI Chatbot**: Click the chat icon in the bottom-right corner to:
   - Ask questions about crops, weather, diseases, fertilizers, etc.
   - Use voice input in your preferred language
   - Get real-time weather and market data

5. **Features**:
   - **Weather Dashboard**: View current conditions and forecasts
   - **Market Data**: Check commodity prices
   - **Crop Calendar**: Plan your cultivation activities
   - **Schemes**: Browse government agricultural programs

## Project Structure

```
krishimitra-main/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── profile-setup/     # Profile setup page
│   ├── crop-calendar/     # Crop calendar page
│   └── schemes/          # Government schemes page
├── components/            # React components
│   ├── ai-chatbot.tsx    # AI chatbot component
│   ├── weather-dashboard.tsx
│   └── ui/               # UI components
├── lib/                   # Utility functions
│   ├── translations.ts   # Translation strings
│   └── utils.ts         # Helper functions
├── public/               # Static assets
└── styles/              # Global styles
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Google Generative AI**: AI chatbot functionality
- **Radix UI**: Accessible UI components
- **Lucide React**: Icon library
- **Recharts**: Chart library for data visualization

## Troubleshooting

### Build Errors

If you encounter build errors:

1. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### API Key Issues

If the chatbot doesn't work:

1. Verify your `.env.local` file exists and contains the API key
2. Restart the development server after adding the API key
3. Check the browser console for error messages

### Port Already in Use

If port 3000 is already in use:

```bash
# Use a different port
npm run dev -- -p 3001
```

## License

This project is private and proprietary.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
