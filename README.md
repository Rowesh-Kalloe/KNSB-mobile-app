# KNSB Mobile App

A React Native mobile application for viewing skating rankings and results, built with Expo and TypeScript.

## Features

- 📊 **Skating Rankings**: View current skating competition results
- 🔍 **Advanced Filtering**: Filter by distance, season, gender, level, category, and track
- 📱 **Responsive Design**: Works on both mobile and web platforms
- 🎯 **Search Functionality**: Search for specific skaters
- 📄 **Pagination**: Navigate through large result sets
- ⚡ **Performance Optimized**: Built with React Native and Expo for optimal performance

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router 5
- **UI Components**: React Native core components
- **Icons**: Lucide React Native
- **Styling**: React Native StyleSheet

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd KNSB-mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. For web development:
```bash
# Open http://localhost:8081 in your browser
```

5. For mobile development:
```bash
# Scan the QR code with Expo Go app
```

## Project Structure

```
KNSB-mobile-app/
├── app/                    # Main application screens
│   ├── (tabs)/           # Tab navigation
│   │   └── index.tsx     # Main rankings screen
│   ├── _layout.tsx       # Root layout
│   └── +not-found.tsx    # 404 page
├── assets/                # Static assets
│   ├── data/             # Mock data and configurations
│   └── images/           # App images and icons
├── components/            # Reusable components
│   └── ErrorBoundary.tsx # Error handling component
├── hooks/                 # Custom React hooks
├── services/              # API services and proxy
└── tsconfig.json         # TypeScript configuration
```

## Development

### Available Scripts

- `npm run dev` - Start Expo development server
- `npm run dev:proxy` - Start CORS proxy server
- `npm run dev:all` - Start both servers
- `npm run build:web` - Build for web
- `npm run lint` - Run linting

### API Integration

The app is designed to work with a skating results API. Currently, it uses mock data while the API integration is being developed.

- **API Service**: `services/api.ts`
- **Proxy Server**: `services/proxy/server.js` (for CORS handling)
- **Mock Data**: `assets/data/skating_results_data.json`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For support or questions, please contact the development team.
