# Voice Transcription App

A modern web application that transcribes audio files using OpenAI's Whisper API and enhances the text with GPT for better readability.

## Features

- 🎵 Audio file upload with drag & drop support
- 🎯 AI-powered transcription using Whisper
- ✨ Text enhancement using GPT for improved formatting
- 🔐 GitHub authentication
- 📝 Transcription history
- 🌙 Dark mode support
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js with GitHub provider
- **Database**: PostgreSQL with Drizzle ORM
- **AI Services**: OpenAI Whisper & GPT
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon DB)
- GitHub OAuth App
- OpenAI API key

### 1. Clone and Install

```bash
git clone <your-repo>
cd voice-transcription-app
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `GITHUB_CLIENT_ID` - GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth App Client Secret
- `OPENAI_API_KEY` - OpenAI API key

### 3. GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Application name: "Voice Transcription App"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret to your `.env.local`

### 4. Database Setup

Generate and push the database schema:

```bash
npm run db:generate
npm run db:push
```

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to use the app.

## Usage

1. **Sign In**: Click "Sign in with GitHub" to authenticate
2. **Upload Audio**: Drag and drop or select an audio file (MP3, WAV, M4A, OGG, FLAC, WebM)
3. **Get Transcription**: The app will transcribe using Whisper and enhance the text with GPT
4. **View Results**: See both original and enhanced versions of the transcription
5. **History**: Access your previous transcriptions

## Supported Audio Formats

- MP3
- WAV
- M4A
- OGG
- FLAC
- WebM

Maximum file size: 25MB (OpenAI Whisper limit)

## API Endpoints

- `POST /api/transcribe` - Upload and transcribe audio file
- `GET /api/transcriptions` - Get user's transcription history
- `DELETE /api/transcriptions?id=<id>` - Delete a transcription

## Database Scripts

- `npm run db:generate` - Generate migrations from schema changes
- `npm run db:push` - Push schema directly to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   └── components/        # React components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   ├── openai.ts         # OpenAI service functions
│   └── schema.ts         # Database schema
├── types/                # TypeScript type definitions
└── drizzle.config.ts     # Drizzle configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
