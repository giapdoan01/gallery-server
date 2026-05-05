# Gallery Multiplayer Server

A real-time multiplayer server for virtual gallery experiences, built with **Colyseus** and **Express.js**. Players can join shared 3D gallery rooms, move around with their avatars, and chat with each other in real time.

---

## Features

- **Real-time multiplayer** — built on Colyseus WebSocket rooms with automatic state synchronization
- **3D player movement** — position (x, y, z) and rotation tracked and broadcast to all players
- **Avatar system** — 5 prefab avatar options per player
- **Live chat** — room-scoped chat messages synchronized to all clients
- **Admin room** — dedicated room with kick/ban controls for moderators
- **REST API** — query room status, active players, and server stats
- **Input sanitization** — all player-submitted data validated before processing
- **Monitor dashboard** — built-in Colyseus monitor at `/monitor`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js >= 18, Express.js 5 |
| Multiplayer | Colyseus 0.16.5 |
| WebSocket | Built-in via Colyseus |
| Security | Helmet, CORS |
| Logging | Morgan |
| Dev tooling | Nodemon |

---

## Project Structure

```
gallery-server/
├── src/
│   ├── server.js                    # Entry point
│   ├── app.js                       # Express configuration
│   ├── config/config.js             # Environment config
│   ├── colyseus/
│   │   ├── schema/GalleryState.js   # Synchronized state schema
│   │   ├── rooms/
│   │   │   ├── GalleryRoom.js       # Main multiplayer room
│   │   │   └── AdminGalleryRoom.js  # Admin control room
│   │   └── handlers/
│   │       └── message.handler.js   # WebSocket message logic
│   ├── controllers/
│   │   └── room.controller.js
│   ├── services/
│   │   ├── room.service.js
│   │   └── logger.service.js
│   ├── middleware/
│   │   ├── error.middleware.js
│   │   └── logger.middleware.js
│   ├── routes/
│   │   ├── index.js
│   │   └── room.routes.js
│   └── utils/
│       ├── sanitizer.util.js
│       └── response.util.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm

### Installation

```bash
git clone https://github.com/<your-username>/gallery-server.git
cd gallery-server
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=2568
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGIN=*
ROOM_NAME=gallery
ADMIN_ROOM_NAME=admingallery
MAX_PLAYERS=20
```

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:2568` by default.

---

## REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Server info and available endpoints |
| GET | `/health` | Health check |
| GET | `/monitor` | Colyseus monitor dashboard |
| GET | `/api/rooms` | List all active rooms |
| GET | `/api/rooms/available` | Rooms with available slots |
| GET | `/api/rooms/stats` | Total rooms and players |
| GET | `/api/rooms/:roomId` | Details for a specific room |

---

## WebSocket Rooms

### `gallery` — Main Room

- Up to 20 players (configurable via `MAX_PLAYERS`)
- Players spawn at fixed initial coordinates
- State synced automatically via Colyseus schema

### `admingallery` — Admin Room

- Up to 3 admin users
- Supports admin-only commands

---

## State Schema

### Player

```js
{
  sessionId: string,
  username: string,
  avatarIndex: number,     // 0–4
  x, y, z: number,         // 3D position
  rotationY: number,
  animationState: string,  // "idle" | "walk"
  isMoving: boolean
}
```

### ChatMessage

```js
{
  id: string,
  sessionId: string,
  username: string,
  message: string,
  timestamp: number
}
```

---

## WebSocket Message Types

| Type | Direction | Description |
|---|---|---|
| `move` | Client → Server | Update player position and rotation |
| `animation` | Client → Server | Change animation state |
| `chat` | Client → Server | Send a chat message |
| `chatMessage` | Server → Client | Broadcast chat to room |
| `userKicked` | Server → Client | Notify player was kicked (admin) |
| `userBanned` | Server → Client | Notify player was banned (admin) |

---

## Input Validation

All player input is sanitized before processing:

- **Username** — alphanumeric + underscore, max 20 characters
- **Position** — x/z clamped to ±1000, y clamped to ±100
- **Animation state** — whitelist: `idle`, `walk`
- **Chat message** — HTML stripped, max 500 characters
- **Avatar index** — must be 0–4

---

## Deployment

The project includes a `render.yaml` for one-click deployment to [Render](https://render.com).

```bash
# Set environment variables in Render dashboard, then connect your repo.
```

---

## License

MIT
