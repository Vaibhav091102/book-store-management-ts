// src/types.ts

// ✅ Unified User Interface
export interface User {
  _id: string;
  name: string;
  role: "buyer" | "seller";
}

// ✅ Seller Interface

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "buyer" | "seller";
}

export interface Seller {
  _id: string;
  user_id?: string; // Make optional if missing in some parts
  sellerId?: string;
  seller_id?: string;
  bookstore_name: string;
  address: string;
  phone: string;
}

export interface Book {
  _id: string;
  name: string;
  author: string;
  price: number;
  publisher?: string;
  publishedYear?: string;
  availableCopies?: number;
  summary?: string;
  image?: string;
  sellerId?: string; // ✅ Ensure sellerId exists
  productId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface CartItem {
  bookId: string;
  productId: string;
  quantity: number;
}
