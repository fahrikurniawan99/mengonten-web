export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: string;
  is_verified: boolean;
  account_status: string;
  warning_message?: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  final_price: number;
  duration_days: number;
  benefits: string | string[];
  description: string;
  type: string;
  discount_percent: number;
  sort_order: number;
  is_active: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  subscription_plan_id: string;
  bank_account_id: string;
  amount: number;
  status: "pending" | "paid" | "expired" | "cancelled";
  plan?: SubscriptionPlan;
  bank_account?: {
    id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TransactionConfirmResponse {
  transaction: Transaction;
  user_subscription: {
    id: string;
    user_id: string;
    transaction_id: string;
    plan_name: string;
    plan_type: string;
    plan_benefits: string[];
    plan_price: number;
    plan_duration: number;
    storage_used_bytes: number;
    rules: Record<string, unknown>;
    status: string;
    start_date: string;
    end_date: string;
    created_at: string;
  };
}

export interface SubscriptionHistory {
  id: string;
  user_id: string;
  subscription_plan_id: string;
  plan?: SubscriptionPlan;
  start_date: string;
  end_date: string;
  status: "active" | "expired";
  created_at: string;
}

export interface SubscriptionCheck {
  has_active: boolean;
  subscription?: SubscriptionHistory;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  youtube_url: string;
  genre: string;
  status: "pending" | "processing" | "completed" | "failed";
  segments?: VideoSegment[];
  created_at: string;
}

export interface VideoSegment {
  id: string;
  video_id: string;
  title: string;
  start_time: number;
  end_time: number;
  duration: number;
  thumbnail_url?: string;
  video_url?: string;
  created_at: string;
}

export interface JobStatus {
  id: string;
  video_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress?: number;
  error?: string;
}

export interface SubmitYouTubeRequest {
  youtube_url: string;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  icon?: string;
  is_active: boolean;
}

export interface TransactionPreview {
  id: string;
  reference_id: string;
  user_id: string;
  subscription_plan_id: string;
  bank_account_id: string;
  plan?: SubscriptionPlan;
  bank_account?: BankAccount;
  unique_code: number;
  total_amount: number;
  expires_at: string;
  created_at: string;
}
