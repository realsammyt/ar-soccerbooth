# AR Soccer Booth

A portrait 9:16 (1080×1920) AR photo booth kiosk application for Windows with Google Cloud integration.

## Features

- **Portrait Display**: Fixed 1080×1920 canvas for live preview and final capture
- **MediaPipe Pose Tracking**: Hand-raise gesture detection for capture trigger
- **React Three Fiber**: 3D soccer stadium scene with interactive elements
- **Quality Optimization**: Reduced pose FPS during countdown, higher render quality during capture
- **Google Cloud Storage**: Photo uploads with public URLs
- **URL Shortening**: TinyURL/Bitly integration for QR codes
- **QR Code Display**: Easy photo sharing for kiosk guests

## Quick Start

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Package for Windows
npm run package:win
```

## Configuration

Create a `.env` file with:

```
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-project-id
URL_SHORTENER_PROVIDER=tinyurl
```

For GCS uploads, place your service account JSON at:
`secrets/gcs-service-account.json`

## Project Structure

```
ar-soccerbooth/
├── electron/           # Main process
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks (pose, gesture, capture)
│   ├── store/          # Zustand stores
│   ├── services/       # GCS, URL shortener
│   └── constants/      # Display settings
├── admin-gallery/      # Separate admin web app
└── public/
    └── fonts/          # 3D fonts
```

## License

ISC
