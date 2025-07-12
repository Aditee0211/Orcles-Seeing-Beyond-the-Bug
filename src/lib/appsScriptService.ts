/**
 * Google Apps Script Service Layer for ReWear Platform
 * Handles all communication between frontend and Google Apps Script backend
 */

// Configuration
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxVMIZOgUHG9wxSPCXmJMOwruAZU0gmJlgC4Hcg3MQ4M1qC-I9oeqPZXgkoOpFIhq5a/exec';

// Types for API responses
interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  points: number;
  joinedAt: string;
  isAdmin: boolean;
}

interface ClothingItem {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: 'excellent' | 'good' | 'fair';
  pointsRequired: number;
  tags: string[];
  images: string[];
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  status: 'available' | 'pending' | 'swapped';
  featured: boolean;
}

interface SwapRequest {
  id: string;
  itemId: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message: string;
  createdAt: string;
  completedAt?: string;
}

interface LoginResponse {
  sessionToken: string;
  userId: string;
  email: string;
  displayName: string;
  points: number;
  role: 'admin' | 'user';
}

interface ItemsResponse {
  items: ClothingItem[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

interface UserProfile {
  user: User;
  items: ClothingItem[];
  sentRequests: SwapRequest[];
  receivedRequests: SwapRequest[];
}

interface PlatformStats {
  totalUsers: number;
  totalItems: number;
  pendingItems: number;
  totalSwaps: number;
  pendingSwaps: number;
  completedSwaps: number;
}

// Error handling
class AppsScriptError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AppsScriptError';
  }
}

// Utility function to make API calls
async function makeApiCall(action: string, data: any = {}): Promise<ApiResponse> {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...data
      })
    });

    if (!response.ok) {
      throw new AppsScriptError(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'error') {
      throw new AppsScriptError(result.message);
    }

    return result;
  } catch (error) {
    if (error instanceof AppsScriptError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new AppsScriptError('Network error: ' + errorMessage);
  }
}

// Authentication Services
export const authService = {
  // Register new user
  async register(email: string, password: string, displayName: string): Promise<LoginResponse> {
    const response = await makeApiCall('register', {
      email,
      password,
      displayName
    });
    
    return response.data as LoginResponse;
  },

  // Login user
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await makeApiCall('login', {
      email,
      password
    });
    
    return response.data as LoginResponse;
  },

  // Logout user
  async logout(sessionToken: string): Promise<void> {
    await makeApiCall('logout', {
      sessionToken
    });
  },

  // Get user profile
  async getUserProfile(sessionToken: string): Promise<UserProfile> {
    const response = await makeApiCall('getUserProfile', {
      sessionToken
    });
    
    return response.data as UserProfile;
  },

  // Update user profile
  async updateUserProfile(sessionToken: string, updates: Partial<User>): Promise<User> {
    const response = await makeApiCall('updateUserProfile', {
      sessionToken,
      ...updates
    });
    
    return response.data as User;
  }
};

// Item Services
export const itemService = {
  // Add new item
  async addItem(sessionToken: string, itemData: {
    title: string;
    description: string;
    category: string;
    size: string;
    condition: 'excellent' | 'good' | 'fair';
    pointsRequired: number;
    tags?: string;
    images?: string[];
  }): Promise<{ itemId: string }> {
    const response = await makeApiCall('addItem', {
      sessionToken,
      ...itemData
    });
    
    return response.data as { itemId: string };
  },

  // Get items with filters and pagination
  async getItems(filters: {
    category?: string;
    condition?: string;
    size?: string;
    minPoints?: number;
    maxPoints?: number;
  } = {}, sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high' = 'newest', page: number = 1, limit: number = 20): Promise<ItemsResponse> {
    const response = await makeApiCall('getItems', {
      ...filters,
      sortBy,
      page,
      limit
    });
    
    return response.data as ItemsResponse;
  },

  // Get single item by ID
  async getItem(itemId: string): Promise<ClothingItem> {
    const response = await makeApiCall('getItem', {
      itemId
    });
    
    return response.data.item as ClothingItem;
  },

  // Update item
  async updateItem(sessionToken: string, itemId: string, updates: Partial<ClothingItem>): Promise<void> {
    await makeApiCall('updateItem', {
      sessionToken,
      itemId,
      ...updates
    });
  },

  // Delete item
  async deleteItem(sessionToken: string, itemId: string): Promise<void> {
    await makeApiCall('deleteItem', {
      sessionToken,
      itemId
    });
  },

  // Search items
  async searchItems(query: string, filters: any = {}): Promise<ClothingItem[]> {
    const response = await makeApiCall('searchItems', {
      query,
      filters
    });
    
    return response.data.items as ClothingItem[];
  },

  // Redeem item with points
  async redeemItem(sessionToken: string, itemId: string): Promise<void> {
    await makeApiCall('redeemItem', {
      sessionToken,
      itemId
    });
  }
};

// Swap Services
export const swapService = {
  // Create swap request
  async createSwapRequest(sessionToken: string, itemId: string, message?: string): Promise<{ swapId: string }> {
    const response = await makeApiCall('createSwapRequest', {
      sessionToken,
      itemId,
      message
    });
    
    return response.data as { swapId: string };
  },

  // Update swap request status
  async updateSwapRequest(sessionToken: string, swapId: string, status: SwapRequest['status']): Promise<void> {
    await makeApiCall('updateSwapRequest', {
      sessionToken,
      swapId,
      status
    });
  }
};

// Category Services
export const categoryService = {
  // Get all categories
  async getCategories(): Promise<Array<{ id: string; name: string; icon: string; count: number; active: boolean }>> {
    const response = await makeApiCall('getCategories');
    return response.data as Array<{ id: string; name: string; icon: string; count: number; active: boolean }>;
  }
};

// Admin Services
export const adminService = {
  // Get platform statistics
  async getPlatformStats(sessionToken: string): Promise<PlatformStats> {
    const response = await makeApiCall('getPlatformStats', {
      sessionToken
    });
    
    return response.data.stats as PlatformStats;
  },

  // Get all users (admin only)
  async getUsers(sessionToken: string): Promise<User[]> {
    const response = await makeApiCall('adminGetUsers', {
      sessionToken
    });
    
    return response.data.users as User[];
  },

  // Ban user (admin only)
  async banUser(sessionToken: string, userId: string): Promise<void> {
    await makeApiCall('adminBanUser', {
      sessionToken,
      userId
    });
  },

  // Approve item (admin only)
  async approveItem(sessionToken: string, itemId: string): Promise<void> {
    await makeApiCall('adminApproveItem', {
      sessionToken,
      itemId
    });
  },

  // Reject item (admin only)
  async rejectItem(sessionToken: string, itemId: string): Promise<void> {
    await makeApiCall('adminRejectItem', {
      sessionToken,
      itemId
    });
  },

  // Get all items (admin only)
  async getItems(sessionToken: string): Promise<ClothingItem[]> {
    const response = await makeApiCall('adminGetItems', {
      sessionToken
    });
    
    return response.data.items as ClothingItem[];
  },

  // Get all swap requests (admin only)
  async getSwapRequests(sessionToken: string): Promise<SwapRequest[]> {
    const response = await makeApiCall('adminGetSwapRequests', {
      sessionToken
    });
    
    return response.data.swaps as SwapRequest[];
  }
};

// Session management utilities
export const sessionManager = {
  // Save session to localStorage
  saveSession(sessionData: LoginResponse): void {
    localStorage.setItem('sessionToken', sessionData.sessionToken);
    localStorage.setItem('userId', sessionData.userId);
    localStorage.setItem('userEmail', sessionData.email);
    localStorage.setItem('userDisplayName', sessionData.displayName);
    localStorage.setItem('userPoints', sessionData.points.toString());
    localStorage.setItem('userRole', sessionData.role);
  },

  // Get session data from localStorage
  getSession(): {
    sessionToken: string;
    userId: string;
    email: string;
    displayName: string;
    points: number;
    role: string;
  } | null {
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) return null;

    return {
      sessionToken,
      userId: localStorage.getItem('userId') || '',
      email: localStorage.getItem('userEmail') || '',
      displayName: localStorage.getItem('userDisplayName') || '',
      points: parseInt(localStorage.getItem('userPoints') || '0'),
      role: localStorage.getItem('userRole') || 'user'
    };
  },

  // Clear session from localStorage
  clearSession(): void {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');
    localStorage.removeItem('userPoints');
    localStorage.removeItem('userRole');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('sessionToken');
  },

  // Check if user is admin
  isAdmin(): boolean {
    return localStorage.getItem('userRole') === 'admin';
  }
};

// Export types for use in components
export type {
  User,
  ClothingItem,
  SwapRequest,
  LoginResponse,
  ItemsResponse,
  UserProfile,
  PlatformStats,
  ApiResponse
};

export { AppsScriptError }; 