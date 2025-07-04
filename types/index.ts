export interface User {
  id: string;
  username: string;
  balance: number;
}

export interface Bet {
  id: string;
  amount: number;
  choice: "over" | "under";
  target: number;
  roll: number;
  win: boolean;
  payout: number;
  createdAt?: string;
  userId?: string;
  clientSeed?: string;
  serverSeed?: string;
  serverSeedHash?: string;
}

export interface BetHistoryItem {
  id: string;
  amount: number;
  choice: "over" | "under";
  target: number;
  roll: number;
  win: boolean;
  payout: number;
  createdAt: string;
}

export interface BetHistoryResponse {
  bets: BetHistoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBets: number;
  };
}

export interface SimpleBet {
  id: string;
  username: string;
  amount: number;
  choice: "over" | "under";
  win: boolean;
}

export interface FullBetDetails {
  id: string;
  roll: number;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
}

export interface LoginData {
  username: string;
}

export interface BetData {
  amount: number;
  choice: "over" | "under";
  clientSeed: string;
  target: number;
}

export interface UserJWTPayload {
  userId: string;
  username: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ApiErrorResponse {
  error: string;
  statusCode: number;
  message?: string;
}