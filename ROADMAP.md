# MCU Watch Tracker - Technical Roadmap

## Project Overview
Private local MCU watch tracker with curved timeline visualization, GitHub JSON data source, TMDB metadata enrichment, and optional Trakt integration.

---

## Core Design Decisions

### 1. JSON Data Structure (Finalized)

#### File Organization
```
/data
  0000000000000100-iron-man.json
  0000000000000200-incredible-hulk.json
  0000000000000300-agent-carter-s01e01.json
  0000000000000400-agent-carter-s01e02.json
  0000000000000500-iron-man-2.json
  0000000000000600-agent-carter-s01e03.json
  0000000000000700-thor.json
  ...
```

**Naming Convention:**
- 16-digit zero-padded order number (0000000000000100, 0000000000000200, etc.)
- 100-step increments for flexible insertions
- Dash separator
- Slug-case title
- Example: `0000000000000300-agent-carter-s01e01.json`

#### JSON File Schema

**Movie:**
```json
{
  "order": 100,
  "type": "movie",
  "title": "Iron Man",
  "tmdb_id": 1726,
  "imdb_id": "tt0371746",
  "trakt_id": 1,
  "release_date": "2008-05-02",
  "phase": 1,
  "multiverse_relevant": false
}
```

**Episode:**
```json
{
  "order": 300,
  "type": "episode",
  "series": "agent-carter",
  "series_title": "Agent Carter",
  "series_tmdb_id": 61550,
  "series_trakt_id": 60651,
  "season": 1,
  "episode": 1,
  "title": "Now is Not the End",
  "tmdb_id": 1044606,
  "trakt_id": 123456,
  "imdb_id": "tt3475734",
  "air_date": "2015-01-06",
  "phase": 2,
  "multiverse_relevant": false
}
```

**Why this structure:**
- ✅ Filename sorting = chronological order
- ✅ No nested directories needed
- ✅ Order visible at glance
- ✅ Easy to scan entire directory
- ✅ Git-friendly (one file per item)
- ✅ Easy insertions with 100-step gaps

### 2. Timeline UI Design

**Visual Concept:**
- **Curved timeline** flowing horizontally (inspired by cinematic timelines)
- **Main line (red)**: Multiverse-relevant content
- **Branch lines**: Non-multiverse content branches off
- **Phase separation**: Gradient color transitions between phases
- **Minimal UI**: No cluttered filters/buttons
- **Dark theme**: Black background with phase-colored gradients
- **Watch status**: Subtle grayscale for unwatched items

**Episodes Display:**
- All episodes shown individually on timeline (not grouped)
- Visual series badge/color for grouping
- Movies can appear between episodes

**Interactions:**
- Horizontal scroll along curved path
- Click card → Details modal
- Mark as watched (quick action)
- Progress tracking with visual feedback

### 3. Tech Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- SVG for curved timeline path
- React Query for API state management

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL for persistent data
- Redis for caching
- Node-cron for scheduled tasks

**Search:**
- Meilisearch (separate Docker container)
- Full-text search on titles
- Fast autocomplete

**External APIs:**
- TMDB (metadata, posters, ratings)
- Trakt (optional two-way sync)

**Deployment:**
- Docker Compose
- 5 containers: Frontend, Backend, PostgreSQL, Redis, Meilisearch

### 4. Database Schema

**Core Tables:**

```sql
-- Media items (movies only)
CREATE TABLE media_items (
  id SERIAL PRIMARY KEY,
  order_position INTEGER UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'movie',
  title VARCHAR(500) NOT NULL,
  tmdb_id INTEGER UNIQUE NOT NULL,
  imdb_id VARCHAR(20),
  trakt_id INTEGER,
  release_date DATE,
  phase INTEGER,
  multiverse_relevant BOOLEAN DEFAULT false,

  -- TMDB enriched metadata
  poster_path TEXT,
  backdrop_path TEXT,
  overview TEXT,
  vote_average DECIMAL(3,1),
  runtime INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Series metadata (no order, just reference data)
CREATE TABLE series_metadata (
  id SERIAL PRIMARY KEY,
  series_slug VARCHAR(255) UNIQUE NOT NULL,
  series_title VARCHAR(500) NOT NULL,
  tmdb_id INTEGER UNIQUE NOT NULL,
  trakt_id INTEGER,
  phase INTEGER,

  -- TMDB enriched
  poster_path TEXT,
  backdrop_path TEXT,
  overview TEXT,
  vote_average DECIMAL(3,1),

  created_at TIMESTAMP DEFAULT NOW()
);

-- Episodes (each has order position)
CREATE TABLE episodes (
  id SERIAL PRIMARY KEY,
  order_position INTEGER UNIQUE NOT NULL,
  series_id INTEGER NOT NULL REFERENCES series_metadata(id) ON DELETE CASCADE,
  season INTEGER NOT NULL,
  episode INTEGER NOT NULL,
  title VARCHAR(500),
  tmdb_id INTEGER,
  trakt_id INTEGER,
  imdb_id VARCHAR(20),
  air_date DATE,
  phase INTEGER,
  multiverse_relevant BOOLEAN DEFAULT false,

  -- TMDB enriched
  still_path TEXT,
  overview TEXT,
  vote_average DECIMAL(3,1),
  runtime INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_series_season_episode UNIQUE (series_id, season, episode)
);

-- Users (future multi-user via Trakt)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,

  -- Trakt OAuth
  trakt_access_token TEXT,
  trakt_refresh_token TEXT,
  trakt_token_expires_at TIMESTAMP,
  trakt_user_id INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Watch history
CREATE TABLE watch_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_item_id INTEGER REFERENCES media_items(id) ON DELETE CASCADE,
  episode_id INTEGER REFERENCES episodes(id) ON DELETE CASCADE,

  -- Progress tracking
  watched_duration INTEGER DEFAULT 0, -- seconds
  total_duration INTEGER NOT NULL, -- seconds
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  is_completed BOOLEAN DEFAULT false,

  watched_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),

  -- Sync tracking
  synced_to_trakt BOOLEAN DEFAULT false,
  trakt_sync_at TIMESTAMP,

  CONSTRAINT check_media_or_episode CHECK (
    (media_item_id IS NOT NULL AND episode_id IS NULL) OR
    (media_item_id IS NULL AND episode_id IS NOT NULL)
  )
);

-- Sync state tracking
CREATE TABLE sync_state (
  id SERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- 'github', 'trakt_pull', 'trakt_push'
  last_sync_at TIMESTAMP,
  last_sync_status VARCHAR(50), -- 'success', 'error', 'pending'
  last_error TEXT,
  metadata JSONB, -- etag, version, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_sync_type UNIQUE (sync_type)
);

-- TMDB metadata cache (fallback when Redis down)
CREATE TABLE tmdb_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  metadata JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);
```

### 5. Simplified Sync Strategy

**GitHub JSON Sync:**
- **Frequency**: On app boot + every 24 hours (not 5 minutes)
- **Process**:
  1. Scan `/data` directory for all JSON files
  2. Parse and validate each JSON (Zod schema)
  3. Sort by `order` field from JSON content
  4. Upsert into database
  5. Trigger TMDB metadata enrichment for new/updated items
  6. Index in Meilisearch

**TMDB Metadata Enrichment:**
- **Caching**: Redis (24h TTL) + PostgreSQL fallback
- **Rate limiting**: 40 requests per 10 seconds (TMDB limit)
- **Batch processing**: Queue for initial data load
- **Data fetched**:
  - Movies: `/movie/{id}?append_to_response=images`
  - Series: `/tv/{id}`
  - Episodes: `/tv/{series_id}/season/{season}/episode/{episode}`

**Trakt Integration (Later Phase):**
- **OAuth login**: User clicks "Login with Trakt" → OAuth flow → User created
- **Initial pull**: On first login, pull entire watch history from Trakt
- **Two-way sync**:
  - Pull: Only on login (not periodic)
  - Push: When user marks something watched locally
- **Conflict resolution**: Most recent timestamp wins
- **IDs stored**: `trakt_id`, `tmdb_id`, `imdb_id` for perfect matching

---

## Implementation Roadmap

### **Phase 0: Project Setup** (Day 1)
- [ ] Initialize project structure
- [ ] Create Docker Compose configuration
  - PostgreSQL
  - Redis
  - Meilisearch
  - Backend (Node.js/Express)
  - Frontend (React/Vite)
- [ ] Set up `.env.example` with all required vars
- [ ] Create database schema (`init.sql`)
- [ ] Create README with setup instructions

### **Phase 1: Backend Foundation** (Days 2-3)
- [ ] Initialize Node.js/Express backend with TypeScript
- [ ] Set up PostgreSQL connection (pg)
- [ ] Set up Redis connection (ioredis)
- [ ] Create base services:
  - `database.service.ts` (connection pool)
  - `redis.service.ts` (cache wrapper)
  - `logger.service.ts` (Winston)
- [ ] Create Zod validation schemas for JSON files
- [ ] Create GitHub JSON sync service:
  - Directory scanner
  - JSON parser & validator
  - Database upsert logic
- [ ] Create manual sync endpoint: `POST /api/sync/github`
- [ ] Implement startup sync (on boot)
- [ ] Add cron job for 24h periodic sync

### **Phase 2: TMDB Integration** (Days 4-5)
- [ ] Create TMDB service with rate limiting
- [ ] Implement Redis caching layer
- [ ] Implement PostgreSQL cache fallback
- [ ] Create metadata enrichment pipeline:
  - Batch queue for processing
  - Movie metadata fetching
  - Series metadata fetching
  - Episode metadata fetching
- [ ] Create endpoints:
  - `GET /api/metadata/movie/:tmdb_id`
  - `GET /api/metadata/series/:tmdb_id`
  - `GET /api/metadata/episode/:series_id/:season/:episode`
- [ ] Hook into GitHub sync to auto-enrich new items

### **Phase 3: Timeline API** (Day 6)
- [ ] Create timeline repository layer
- [ ] Create timeline service
- [ ] Implement chronological query (ORDER BY order_position)
- [ ] Implement release order query (ORDER BY release_date/air_date)
- [ ] Create endpoints:
  - `GET /api/timeline` (returns all items sorted chronologically)
  - `GET /api/timeline/:id` (single item details)
  - Query params: `?phase=1`, `?multiverse=true`, `?type=movie`
- [ ] Join with TMDB metadata
- [ ] Join with watch_history for current user

### **Phase 4: Watch Progress Tracking** (Day 7)
- [ ] Create watch repository
- [ ] Create watch service
- [ ] Implement single-user mode (hardcoded user_id = 1)
- [ ] Create endpoints:
  - `POST /api/watch` (create/update watch entry)
  - `PUT /api/watch/:id/progress` (update progress %)
  - `DELETE /api/watch/:id` (remove watch entry)
  - `GET /api/watch/history` (user's watch history)
- [ ] Calculate progress percentage automatically
- [ ] Return updated timeline with watch status

### **Phase 5: Statistics API** (Day 8)
- [ ] Create stats service
- [ ] Implement calculations:
  - Total watch time (sum of watched durations)
  - Overall completion % (watched / total)
  - Movies watched / total
  - Episodes watched / total
  - Phase completion breakdown
- [ ] Create endpoint: `GET /api/stats`
- [ ] Add caching for expensive queries

### **Phase 6: Frontend Foundation** (Days 9-10)
- [ ] Initialize React + Vite + TypeScript
- [ ] Set up Tailwind CSS
- [ ] Install Framer Motion
- [ ] Install React Query
- [ ] Create API client with Axios
- [ ] Create React Query hooks:
  - `useTimeline()`
  - `useWatchProgress()`
  - `useStats()`
- [ ] Create basic layout components:
  - `Header.tsx`
  - `Layout.tsx`
  - `LoadingSpinner.tsx`
  - `ErrorBoundary.tsx`

### **Phase 7: Curved Timeline UI** (Days 11-14)
- [ ] **Design curved timeline SVG path**:
  - Generate smooth Bezier curve
  - Position items along path
  - Calculate x/y coordinates for each card
  - Handle branching for non-multiverse content
- [ ] Create `TimelineContainer.tsx`:
  - Render SVG path (red for multiverse, branches for others)
  - Horizontal scroll container
  - Phase gradient backgrounds
- [ ] Create `MediaCard.tsx`:
  - Movie card variant
  - Episode card variant
  - Poster image with TMDB URLs
  - Watch status overlay (grayscale, gradient, checkmark)
  - Series badge for episodes
  - Multiverse indicator
  - Hover interactions
- [ ] Create `DetailsModal.tsx`:
  - Full metadata display
  - Progress slider
  - Mark as watched button
  - Backdrop image
- [ ] Implement animations with Framer Motion:
  - Card entrance animations
  - Scroll-triggered reveals
  - Modal transitions

### **Phase 8: Watch Progress UI** (Day 15)
- [ ] Implement mark as watched functionality
- [ ] Implement progress slider in modal
- [ ] Add optimistic UI updates
- [ ] Show visual feedback (grayscale → color transition)
- [ ] Update stats in real-time

### **Phase 9: Meilisearch Integration** (Days 16-17)
- [ ] Set up Meilisearch Docker container
- [ ] Create Meilisearch service in backend
- [ ] Index all media items on GitHub sync
- [ ] Index episodes with series context
- [ ] Create search endpoint: `GET /api/search?q=iron`
- [ ] Create frontend search component:
  - Debounced input
  - Autocomplete dropdown
  - Highlight results on timeline
- [ ] Update index on data changes

### **Phase 10: Polish & UX** (Days 18-19)
- [ ] Add keyboard shortcuts:
  - Arrow keys: Navigate timeline
  - Space: Mark as watched
  - Enter: Open details
  - Esc: Close modal
  - `/`: Focus search
- [ ] Add loading states everywhere
- [ ] Add error handling & user feedback
- [ ] Add empty states
- [ ] Optimize performance:
  - Lazy load images
  - Virtualize timeline if needed
  - Debounce expensive operations
- [ ] Add responsive design (mobile/tablet)
- [ ] Test with 100+ items

### **Phase 11: Example Data Creation** (Day 20)
- [ ] Create GitHub repository for JSON data
- [ ] Manually enter MCU Phase 1 data (6 movies)
- [ ] Manually enter MCU Phase 2 data (6 movies + Agent Carter)
- [ ] Validate all JSON files
- [ ] Test GitHub sync with real data
- [ ] Document JSON schema in repo README

### **Phase 12: Trakt Integration** (Days 21-24)
- [ ] Register Trakt API application
- [ ] Implement Trakt OAuth flow:
  - `GET /api/trakt/authorize`
  - `GET /api/trakt/callback`
- [ ] Create user on successful OAuth
- [ ] Store access/refresh tokens (encrypted)
- [ ] Implement token refresh logic
- [ ] Create Trakt service:
  - Pull watch history
  - Push watch events
  - Match items via TMDB/Trakt/IMDB IDs
- [ ] Implement initial sync on login
- [ ] Implement push on local watch action
- [ ] Add "Login with Trakt" button to UI
- [ ] Add sync status indicator
- [ ] Handle rate limits & errors gracefully

### **Phase 13: Testing & Documentation** (Days 25-26)
- [ ] Write unit tests for services
- [ ] Write integration tests for APIs
- [ ] Write E2E tests for critical flows
- [ ] Document API endpoints (Swagger/OpenAPI)
- [ ] Write deployment guide
- [ ] Create `.env.example` with all vars
- [ ] Document Trakt setup process
- [ ] Create troubleshooting guide

### **Phase 14: Deployment & Optimization** (Days 27-28)
- [ ] Optimize Docker images (multi-stage builds)
- [ ] Add health checks to all services
- [ ] Set up automatic backups (PostgreSQL)
- [ ] Add logging & monitoring
- [ ] Security audit:
  - SQL injection prevention
  - XSS protection
  - CORS configuration
  - Rate limiting
  - Token encryption
- [ ] Performance testing with large datasets
- [ ] Final polish & bug fixes

---

## Technology Choices

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.4",
    "@tanstack/react-query": "^5.8.4",
    "axios": "^1.6.0",
    "tailwindcss": "^3.3.5"
  }
}
```

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "ioredis": "^5.3.2",
    "zod": "^3.22.4",
    "axios": "^1.6.0",
    "node-cron": "^3.0.2",
    "winston": "^3.11.0",
    "meilisearch": "^0.36.0"
  }
}
```

### Docker Services
- **PostgreSQL 15**: Main database
- **Redis 7**: Caching layer
- **Meilisearch 1.5**: Search engine
- **Node 20**: Backend runtime
- **Nginx** (optional): Frontend serving in production

---

## File Structure

```
mcu-watch-tracker/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── ROADMAP.md
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   ├── client.ts
│       │   ├── timeline.ts
│       │   ├── watch.ts
│       │   ├── search.ts
│       │   └── trakt.ts
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   └── Layout.tsx
│       │   ├── timeline/
│       │   │   ├── TimelineContainer.tsx
│       │   │   ├── CurvedPath.tsx
│       │   │   ├── MediaCard.tsx
│       │   │   ├── MovieCard.tsx
│       │   │   ├── EpisodeCard.tsx
│       │   │   └── WatchStatusOverlay.tsx
│       │   ├── search/
│       │   │   └── SearchBar.tsx
│       │   └── modals/
│       │       └── DetailsModal.tsx
│       ├── hooks/
│       │   ├── useTimeline.ts
│       │   ├── useWatchProgress.ts
│       │   ├── useSearch.ts
│       │   └── useTrakt.ts
│       ├── types/
│       │   ├── media.ts
│       │   ├── watch.ts
│       │   └── api.ts
│       └── utils/
│           ├── coordinates.ts (curve path calculations)
│           └── format.ts
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── config/
│       │   ├── database.ts
│       │   ├── redis.ts
│       │   ├── meilisearch.ts
│       │   └── env.ts
│       ├── routes/
│       │   ├── timeline.routes.ts
│       │   ├── watch.routes.ts
│       │   ├── sync.routes.ts
│       │   ├── search.routes.ts
│       │   ├── stats.routes.ts
│       │   └── trakt.routes.ts
│       ├── services/
│       │   ├── timeline.service.ts
│       │   ├── watch.service.ts
│       │   ├── github.service.ts
│       │   ├── tmdb.service.ts
│       │   ├── trakt.service.ts
│       │   ├── search.service.ts
│       │   └── sync.service.ts
│       ├── repositories/
│       │   ├── media.repository.ts
│       │   ├── episode.repository.ts
│       │   ├── watch.repository.ts
│       │   └── user.repository.ts
│       ├── jobs/
│       │   └── github-sync.job.ts
│       └── utils/
│           ├── validation.ts (Zod schemas)
│           ├── logger.ts
│           └── encryption.ts (for Trakt tokens)
│
└── database/
    └── init.sql
```

---

## Environment Variables

```bash
# Backend
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/mcu_tracker
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_API_KEY=masterKey

# TMDB API
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3

# Trakt API (Phase 12)
TRAKT_CLIENT_ID=your_trakt_client_id
TRAKT_CLIENT_SECRET=your_trakt_client_secret
TRAKT_REDIRECT_URI=http://localhost:3000/api/trakt/callback

# GitHub Data Source
GITHUB_DATA_REPO=https://github.com/username/mcu-data
GITHUB_DATA_DIR=/data

# Frontend
VITE_API_URL=http://localhost:3000
```

---

## Success Criteria

### MVP (After Phase 11)
- ✅ Timeline displays all MCU content chronologically
- ✅ Curved timeline with phase gradients
- ✅ Watch progress tracking works
- ✅ TMDB metadata enrichment works
- ✅ GitHub JSON sync works (boot + 24h)
- ✅ Search works with Meilisearch
- ✅ Stats dashboard shows accurate data
- ✅ Single user can track watch progress locally

### Full Version (After Phase 14)
- ✅ All MVP features
- ✅ Trakt OAuth login works
- ✅ Two-way Trakt sync works
- ✅ Multi-user support via Trakt accounts
- ✅ Responsive design (mobile/tablet)
- ✅ Performance optimized for 100+ items
- ✅ Full test coverage
- ✅ Production-ready deployment

---

## Timeline Estimate
- **MVP**: ~20 days (Phases 0-11)
- **Full Version**: ~28 days (Phases 0-14)

## Next Steps
1. ✅ Finalize roadmap
2. Create new curved timeline mockup
3. Begin Phase 0: Project Setup
