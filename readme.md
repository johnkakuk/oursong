# OurSong

## Project Overview

OurSong is a personal music memory board application built on the Spotify API. Rather than functioning as a generic music library, OurSong lets you attach meaning to music. Each saved song gets its own board where you can collect photos, videos, and written posts that capture the memory, feeling, or story behind it.

“Songs” live at the center of the experience. A Song is anchored by a track (searched and saved via Spotify), and populated with media and text content over time. Think of it as a private, song-indexed journal: part scrapbook, part diary, built around the music that matters to you.

### Planned Features

- **Spotify Integration** — Search for any track, artist, or album via the Spotify API. Authenticated users with Spotify Premium can stream tracks directly in-app via the Web Playback SDK.
- **Song Boards** — One board per saved track. Each board includes the song, associated people, a description, and hierarchical tags/categories.
- **Memory Posts** — Three content types: photo posts (with optional text overlay), text posts (with optional background color), and video posts. All posts support captions and categories.
- **Rich Text** — Text posts use TipTap for lightweight rich text editing (bold, italic, headings, lists).
- **People Associations** — Each Memory can be associated with a Person. This will allow you to open up a Person and see all Songs and Memories associated with them.
- **Masonry Grid Layout** — Board content displays in a responsive three-column masonry grid, collapsing to two and one column on smaller viewports.
- **Lightbox** — Images open in a full lightbox viewer with keyboard navigation.
- **Custom Audio** — Boards optionally support uploaded MP3s as an alternative to Spotify playback.
- **Shareable Boards** — Boards can optionally be made public and accessed by anyone with the link.

---- 

## Prerequisites

The following must be installed before running OurSong locally:

- [Node.js](https://nodejs.org/) v20 or higher
- [MongoDB](https://www.mongodb.com/) — local instance or MongoDB Atlas connection string
- A [Spotify Developer](https://developer.spotify.com/) account with a registered application (for Client ID and Client Secret)
- A Spotify Premium account (required for in-app playback via the Web Playback SDK)
- A modern browser (Chrome or Edge recommended for Web Playback SDK compatibility)

A Docker container will likely be used in the future to simplify deployment.

---- 

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/johnkakuk/OurSong.git
cd oursong
```

### 2. Install dependencies

Install dependencies for both the backend and frontend:

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure environment variables

In the `/server` directory, create a `.env` file using the provided template:

```bash
cp .env.example .env
```

Then fill in your values:

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/oursong
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/auth/callback
SESSION_SECRET=your_session_secret
```

### 4. Start the development servers

```bash
# From /server
npm run dev

# From /client (in a separate terminal)
npm run dev
```

The app will be available at the URLs listed below.

---- 

## Links

| Resource                    | URL                                     |
| --------------------------- | --------------------------------------- |
| Frontend (React)            | http://localhost:5173                   |
| Backend API                 | http://localhost:5000                   |
| MongoDB (local)             | mongodb://localhost:27017/oursong       |
| Spotify Developer Dashboard | https://developer.spotify.com/dashboard |
