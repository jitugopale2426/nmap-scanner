# Nmap Network Scanner

A full-stack web application for running Nmap network discovery scans, visualizing discovered hosts, and tracking open ports.

## Tech Stack

- **Frontend** — Next.js, React, TailwindCSS, Zustand
- **Backend** — Node.js, Express.js
- **Database** — MongoDB (Mongoose)
- **Scanner** — Nmap
- **Validation** — Zod

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Nmap](https://nmap.org/download.html)

Verify installations:
```bash
node -v
mongod --version
nmap --version
```

## Project Structure

```
nmap-scanner/
├── backend/      — Node.js + Express API
└── frontend/     — Next.js application
```

## Setup & Run

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
NMAP_PATH=path_to_nmap_executable
```

> On Windows: `NMAP_PATH=C:\Program Files (x86)\Nmap\nmap.exe`
> On Linux/Mac: `NMAP_PATH=nmap`

```bash
npm run dev
```

> **Windows users:** Run terminal as Administrator — Nmap requires elevated permissions for network scanning.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scanner/scan` | Start a new scan |
| GET | `/api/scanner/scans` | List all scans (paginated, filter by status) |
| GET | `/api/scanner/scans/stats` | Summary stats |
| GET | `/api/scanner/scans/:id` | Scan details with discovered hosts |
| DELETE | `/api/scanner/scans/:id` | Delete a scan |

Query params for listing: `?page=1&limit=10&status=completed`

## Database Schema

**ScanJob**
```
target       String   — IP, CIDR range, or hostname scanned
status       String   — pending | running | completed | failed
startedAt    Date
completedAt  Date
error        String   — set if scan failed
```

**Host**
```
scanJobId    ObjectId  — reference to ScanJob
ip           String
hostname     String
status       String    — up | down
ports        Array     — [{ port, protocol, state, service }]
scannedAt    Date
```

## Usage

1. Enter a target — e.g. `192.168.1.1` or `192.168.1.0/24`
2. Click **Run Scan** — scan runs in the background
3. The list auto-refreshes until the scan completes
4. Click any scan to view discovered hosts and open ports
