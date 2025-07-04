# 🎲 Real-Time Dice Game

A full-stack, real-time multiplayer dice game built with Next.js, TypeScript, and a serverless-first architecture. This project demonstrates modern web development practices with a focus on security, scalability, and user experience.

[![Live Demo](https://img.shields.io/badge/🚀-Live_Demo-4CAF50?style=for-the-badge)](https://real-time-dice-game.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)

[Watch Demo Video](https://github.com/user-attachments/assets/5d2df0b4-bad5-4cc2-8136-d7afd5b7c58d)

## 📱 Real-time Cross-Device Sync

Experience seamless gameplay with real-time balance updates across all your logged-in devices. Bet on your mobile, and watch your balance instantly reflect on your desktop, without needing to refresh!

### Desktop View

[Desktop Gameplay Video](https://github.com/user-attachments/assets/9e9be89c-cfed-4de3-ad64-0ce2a192a4bf)

### Mobile View

[Mobile Gameplay Video](https://github.com/user-attachments/assets/af6e02c5-9b8e-4ff7-9797-114623943abe)

## ✨ Features

### 🎮 Core Gameplay

- Complete betting loop with real-time updates
- Real-time balance synchronization across all logged-in devices
- Intuitive UI for placing bets and viewing results
- Responsive design that works on all devices

### 🔒 Security

- JWT-based authentication with httpOnly cookies
- Server-side session management
- Rate limiting and abuse protection
- Provably fair game mechanics

### ⚡ Performance

- Serverless architecture for optimal scaling
- Real-time updates via WebSockets
- Optimized database queries with Drizzle ORM

### 🧪 Testing & Quality

- Unit tests for core game logic
- TypeScript for type safety
- CI/CD ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Pusher account (for WebSockets)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd real-time-dice-game
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Update the values in `.env.local` with your configuration.

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Realtime**: Pusher Channels
- **Authentication**: JWT with httpOnly cookies
- **Testing**: Vitest

### Key Design Decisions

#### Serverless-First Approach

- Uses Vercel's serverless functions for API routes
- Pusher Channels for real-time communication
- Stateless authentication with JWT

#### Database Layer

- Drizzle ORM for type-safe database operations
- Row-level locking for financial transactions
- Optimized queries for high performance

#### Security

- All sensitive operations are transactional
- Rate limiting on API endpoints
- Secure authentication flow
- Input validation on all API routes

## 🧪 Testing

Run the test suite:

```bash
npm test
```

### Test Coverage

- Core game logic (provably fair system)
- Authentication flows
- Database operations

## 📚 Documentation

### API Reference

#### Authentication

- **POST** `/api/auth/login`

  - **Request Body**: `{ username: string }`
  - **Response**: `{ user: { id: string, username: string, balance: number } }`
  - **Description**: Creates or logs in a user with the provided username. Returns a session token in an httpOnly cookie.

- **POST** `/api/auth/logout`

  - **Response**: `{ message: "Logged out" }`
  - **Description**: Logs out the current user by clearing the session cookie.

- **GET** `/api/auth/session`
  - **Headers**: `Cookie` (with session token)
  - **Response**: `{ user: { id: string, username: string, balance: number } }`
  - **Description**: Gets the current authenticated user's session information.

#### Game

- **POST** `/api/game/bet`

  - **Headers**:
    - `X-User-Payload`: `{ userId: string }`
    - `Content-Type: application/json`
  - **Request Body**:
    ```typescript
    {
      amount: number,  // Bet amount (must be positive)
      choice: "over" | "under",
      target: number,  // 1-99
      clientSeed: string
    }
    ```
  - **Response**:
    ```typescript
    {
      id: string,
      roll: number,       // 1-100
      win: boolean,
      payout: number,
      newBalance: number,
      serverSeed: string, // For client-side verification
      serverSeedHash: string
    }
    ```
  - **Description**: Places a new bet and returns the result.

- **GET** `/api/game/my-bets`

  - **Headers**: `X-User-Payload`: `{ userId: string }`
  - **Query Params**:
    - `page`: number (default: 1)
  - **Response**:
    ```typescript
    {
      bets: Array<{
        id: string,
        amount: number,
        choice: "over" | "under",
        target: number,
        roll: number,
        win: boolean,
        payout: number,
        createdAt: string
      }>,
      pagination: {
        currentPage: number,
        totalPages: number,
        totalBets: number
      }
    }
    ```
  - **Description**: Gets the authenticated user's bet history with pagination.

- **GET** `/api/game/recent-bets`

  - **Response**:
    ```typescript
    Array<{
      id: string
      username: string
      amount: number
      choice: "over" | "under"
      win: boolean
    }>
    ```
  - **Description**: Gets the most recent bets from all users (max 8).

- **GET** `/api/game/bet-details/:betId`
  - **Response**:
    ```typescript
    {
      id: string,
      roll: number,
      serverSeed: string,
      serverSeedHash: string,
      clientSeed: string
    }
    ```
  - **Description**: Gets the details needed to verify a bet's fairness.

### Game Rules

1. Players place bets on whether the dice roll will be over or under a target number
2. The game uses a provably fair system with server and client seeds
3. Winnings are automatically added to the player's balance
4. Initial balance: 100 credits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
