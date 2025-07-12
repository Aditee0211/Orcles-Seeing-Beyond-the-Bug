/**
 * ReWear Platform - Google Apps Script Backend
 * Clean, simplified version with multi-spreadsheet support
 */

// Global configuration
const CONFIG = {
  REWEAR_SPREADSHEET_ID: '1QDGw8KtfWVIfNyk_sY0ymAjSao_5cdYGBmZpGwIvhAM',
  ITEMS_SPREADSHEET_ID: '11LDOkgMmZzsklPUSfGgtLO6DOUPQ7vFIiCqLW5iZqBME',
  WELCOME_POINTS: 100,
  MAX_ITEMS_PER_USER: 20,
  MAX_IMAGES_PER_ITEM: 5,
  POINTS_RANGE: { MIN: 1, MAX: 200 }
};

// Spreadsheet sheet names
const SHEETS = {
  USERS: 'Users',
  ITEMS: 'Items',
  SWAP_REQUESTS: 'SwapRequests',
  CATEGORIES: 'Categories',
  SESSIONS: 'Sessions'
};

/**
 * Get the correct spreadsheet for a given sheet name
 */
function getSpreadsheetForSheet(sheetName) {
  if (sheetName === SHEETS.ITEMS) {
    return SpreadsheetApp.openById(CONFIG.ITEMS_SPREADSHEET_ID);
  }
  return SpreadsheetApp.openById(CONFIG.REWEAR_SPREADSHEET_ID);
}

/**
 * Get a sheet from the correct spreadsheet
 */
function getSheet(sheetName) {
  const spreadsheet = getSpreadsheetForSheet(sheetName);
  return spreadsheet.getSheetByName(sheetName);
}

/**
 * Main doPost function - Entry point for all requests
 */
function doPost(e) {
  try {
    // Log the incoming request
    console.log('=== doPost called ===');
    console.log('Request object:', e);
    
    // Validate request
    if (!e || !e.postData || !e.postData.contents) {
      console.log('Invalid request format');
      return createResponse('error', 'Invalid request format');
    }
    
    console.log('Raw request contents:', e.postData.contents);
    
    // Parse JSON
    let data;
    try {
      data = JSON.parse(e.postData.contents);
      console.log('Parsed data:', data);
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      return createResponse('error', 'Invalid JSON format');
    }
    
    // Validate data structure
    if (!data || typeof data !== 'object') {
      console.log('Data is not an object');
      return createResponse('error', 'Invalid data format');
    }
    
    if (!data.action || typeof data.action !== 'string') {
      console.log('Missing or invalid action');
      return createResponse('error', 'Missing action parameter');
    }
    
    console.log('Processing action:', data.action);
    
    // Route to appropriate handler
    const handlers = {
      'register': handleRegister,
      'login': handleLogin,
      'logout': handleLogout,
      'addItem': handleAddItem,
      'getItems': handleGetItems,
      'getItem': handleGetItem,
      'updateItem': handleUpdateItem,
      'deleteItem': handleDeleteItem,
      'createSwapRequest': handleCreateSwapRequest,
      'updateSwapRequest': handleUpdateSwapRequest,
      'getUserProfile': handleGetUserProfile,
      'updateUserProfile': handleUpdateUserProfile,
      'searchItems': handleSearchItems,
      'getCategories': handleGetCategories,
      'getPlatformStats': handleGetPlatformStats,
      'adminGetUsers': handleAdminGetUsers,
      'adminBanUser': handleAdminBanUser,
      'adminApproveItem': handleAdminApproveItem,
      'adminRejectItem': handleAdminRejectItem,
      'adminGetItems': handleAdminGetItems,
      'adminGetSwapRequests': handleAdminGetSwapRequests
    };
    
    const handler = handlers[data.action];
    if (!handler) {
      console.log('Unknown action:', data.action);
      return createResponse('error', 'Unknown action: ' + data.action);
    }
    
    // Call the handler
    console.log('Calling handler for:', data.action);
    return handler(data);
    
  } catch (error) {
    console.error('doPost error:', error);
    console.error('Error stack:', error.stack);
    return createResponse('error', 'Server error: ' + error.message);
  }
}

/**
 * Create a standardized response
 */
function createResponse(status, message, data = null) {
  const response = {
    status: status,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  console.log('Sending response:', response);
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Utility functions
 */
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSessionToken() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 15);
}

function hashPassword(password) {
  // Simple hash for demo - in production, use proper hashing
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password));
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Database operations
 */
function getAllUsers() {
  const sheet = getSheet(SHEETS.USERS);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only header row
  
  return data.slice(1).map(row => ({
    id: row[0],
    email: row[1],
    displayName: row[2],
    password: row[3],
    points: parseInt(row[4]) || 0,
    joinedAt: row[5],
    isAdmin: row[6] === 'TRUE',
    banned: row[7] === 'TRUE'
  }));
}

function getUserByEmail(email) {
  const users = getAllUsers();
  return users.find(user => user.email === email.toLowerCase());
}

function getUserById(userId) {
  const users = getAllUsers();
  return users.find(user => user.id === userId);
}

function createUser(userData) {
  try {
    const sheet = getSheet(SHEETS.USERS);
    if (!sheet) return false;
    
    const row = [
      userData.id,
      userData.email,
      userData.displayName,
      userData.password,
      userData.points,
      userData.joinedAt,
      userData.isAdmin,
      userData.banned
    ];
    
    sheet.appendRow(row);
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
}

function createSession(userId, sessionToken) {
  try {
    const sheet = getSheet(SHEETS.SESSIONS);
    if (!sheet) return false;
    
    const row = [
      sessionToken,
      userId,
      new Date().toISOString(),
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    ];
    
    sheet.appendRow(row);
    return true;
  } catch (error) {
    console.error('Error creating session:', error);
    return false;
  }
}

function getSession(sessionToken) {
  try {
    const sheet = getSheet(SHEETS.SESSIONS);
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return null;
    
    const session = data.slice(1).find(row => row[0] === sessionToken);
    if (!session) return null;
    
    // Check if session is expired
    const expiresAt = new Date(session[3]);
    if (new Date() > expiresAt) {
      // Remove expired session
      const rowIndex = data.findIndex(row => row[0] === sessionToken);
      if (rowIndex > 0) {
        sheet.deleteRow(rowIndex + 1);
      }
      return null;
    }
    
    return {
      token: session[0],
      userId: session[1],
      createdAt: session[2],
      expiresAt: session[3]
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

function deleteSession(sessionToken) {
  try {
    const sheet = getSheet(SHEETS.SESSIONS);
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === sessionToken);
    
    if (rowIndex > 0) {
      sheet.deleteRow(rowIndex + 1);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
}

/**
 * Handler functions
 */
function handleRegister(data) {
  const { email, password, displayName } = data;
  
  // Validation
  if (!email || !password || !displayName) {
    return createResponse('error', 'All fields are required');
  }
  
  if (!isValidEmail(email)) {
    return createResponse('error', 'Invalid email format');
  }
  
  if (password.length < 6) {
    return createResponse('error', 'Password must be at least 6 characters');
  }
  
  // Check if user already exists
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return createResponse('error', 'User already exists');
  }
  
  // Check if this is the first user (make them admin)
  const allUsers = getAllUsers();
  const isFirstUser = allUsers.length === 0;
  
  // Create user
  const userId = generateUserId();
  const userData = {
    id: userId,
    email: email.toLowerCase(),
    displayName: displayName,
    password: hashPassword(password),
    points: CONFIG.WELCOME_POINTS,
    joinedAt: new Date().toISOString(),
    isAdmin: isFirstUser,
    banned: false
  };
  
  const success = createUser(userData);
  if (!success) {
    return createResponse('error', 'Failed to create user');
  }
  
  // Create session
  const sessionToken = generateSessionToken();
  createSession(userId, sessionToken);
  
  return createResponse('success', 'User registered successfully', {
    sessionToken,
    userId,
    email: userData.email,
    displayName: userData.displayName,
    points: userData.points,
    isAdmin: userData.isAdmin
  });
}

function handleLogin(data) {
  const { email, password } = data;
  
  // Validation
  if (!email || !password) {
    return createResponse('error', 'Email and password are required');
  }
  
  // Find user
  const user = getUserByEmail(email);
  if (!user) {
    return createResponse('error', 'Invalid email or password');
  }
  
  // Check password
  if (user.password !== hashPassword(password)) {
    return createResponse('error', 'Invalid email or password');
  }
  
  // Check if banned
  if (user.banned) {
    return createResponse('error', 'Account is banned');
  }
  
  // Create session
  const sessionToken = generateSessionToken();
  createSession(user.id, sessionToken);
  
  return createResponse('success', 'Login successful', {
    sessionToken,
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    points: user.points,
    isAdmin: user.isAdmin
  });
}

function handleLogout(data) {
  const { sessionToken } = data;
  
  if (!sessionToken) {
    return createResponse('error', 'Session token required');
  }
  
  deleteSession(sessionToken);
  
  return createResponse('success', 'Logout successful');
}

function handleGetCategories(data) {
  const categories = [
    { id: 'tops', name: 'Tops' },
    { id: 'bottoms', name: 'Bottoms' },
    { id: 'dresses', name: 'Dresses' },
    { id: 'outerwear', name: 'Outerwear' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'bags', name: 'Bags' },
    { id: 'jewelry', name: 'Jewelry' }
  ];
  
  return createResponse('success', 'Categories retrieved', { categories });
}

function handleAddItem(data) {
  const { sessionToken, title, description, category, condition, size, points, images } = data;
  
  // Validate session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const user = getUserById(session.userId);
  if (!user || user.banned) {
    return createResponse('error', 'User not found or banned');
  }
  
  // Validation
  if (!title || !description || !category || !condition || !size || !points) {
    return createResponse('error', 'All fields are required');
  }
  
  if (points < CONFIG.POINTS_RANGE.MIN || points > CONFIG.POINTS_RANGE.MAX) {
    return createResponse('error', `Points must be between ${CONFIG.POINTS_RANGE.MIN} and ${CONFIG.POINTS_RANGE.MAX}`);
  }
  
  // Check user's item limit
  const userItems = getUserItems(session.userId);
  if (userItems.length >= CONFIG.MAX_ITEMS_PER_USER) {
    return createResponse('error', 'Maximum items limit reached');
  }
  
  // Create item
  const itemId = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const itemData = {
    id: itemId,
    userId: session.userId,
    title: title,
    description: description,
    category: category,
    condition: condition,
    size: size,
    points: parseInt(points),
    images: images || [],
    status: 'pending', // pending, approved, rejected
    createdAt: new Date().toISOString(),
    approvedAt: null,
    approvedBy: null
  };
  
  const success = createItem(itemData);
  if (!success) {
    return createResponse('error', 'Failed to create item');
  }
  
  return createResponse('success', 'Item added successfully', { itemId });
}

function handleGetItems(data) {
  const { category, condition, size, minPoints, maxPoints, page = 1, limit = 20 } = data;
  
  try {
    const sheet = getSheet(SHEETS.ITEMS);
    if (!sheet) {
      return createResponse('success', 'No items found', { items: [], total: 0 });
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse('success', 'No items found', { items: [], total: 0 });
    }
    
    let items = data.slice(1).map(row => ({
      id: row[0],
      userId: row[1],
      title: row[2],
      description: row[3],
      category: row[4],
      condition: row[5],
      size: row[6],
      points: parseInt(row[7]) || 0,
      images: row[8] ? JSON.parse(row[8]) : [],
      status: row[9],
      createdAt: row[10],
      approvedAt: row[11],
      approvedBy: row[12]
    }));
    
    // Filter by status (only show approved items)
    items = items.filter(item => item.status === 'approved');
    
    // Apply filters
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    if (condition) {
      items = items.filter(item => item.condition === condition);
    }
    
    if (size) {
      items = items.filter(item => item.size === size);
    }
    
    if (minPoints) {
      items = items.filter(item => item.points >= parseInt(minPoints));
    }
    
    if (maxPoints) {
      items = items.filter(item => item.points <= parseInt(maxPoints));
    }
    
    // Sort by creation date (newest first)
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const total = items.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return createResponse('success', 'Items retrieved', {
      items: paginatedItems,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error('Error getting items:', error);
    return createResponse('error', 'Failed to retrieve items');
  }
}

function handleGetItem(data) {
  const { itemId } = data;
  
  if (!itemId) {
    return createResponse('error', 'Item ID required');
  }
  
  const item = getItemById(itemId);
  if (!item) {
    return createResponse('error', 'Item not found');
  }
  
  // Get user info for the item
  const user = getUserById(item.userId);
  const itemWithUser = {
    ...item,
    user: user ? {
      id: user.id,
      displayName: user.displayName,
      joinedAt: user.joinedAt
    } : null
  };
  
  return createResponse('success', 'Item retrieved', { item: itemWithUser });
}

function handleUpdateItem(data) {
  const { sessionToken, itemId, title, description, category, condition, size, points, images } = data;
  
  // Validate session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const user = getUserById(session.userId);
  if (!user || user.banned) {
    return createResponse('error', 'User not found or banned');
  }
  
  // Get item
  const item = getItemById(itemId);
  if (!item) {
    return createResponse('error', 'Item not found');
  }
  
  // Check ownership
  if (item.userId !== session.userId && !user.isAdmin) {
    return createResponse('error', 'Not authorized to update this item');
  }
  
  // Update item
  const updatedItem = {
    ...item,
    title: title || item.title,
    description: description || item.description,
    category: category || item.category,
    condition: condition || item.condition,
    size: size || item.size,
    points: points ? parseInt(points) : item.points,
    images: images || item.images
  };
  
  const success = updateItem(itemId, updatedItem);
  if (!success) {
    return createResponse('error', 'Failed to update item');
  }
  
  return createResponse('success', 'Item updated successfully');
}

function handleDeleteItem(data) {
  const { sessionToken, itemId } = data;
  
  // Validate session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const user = getUserById(session.userId);
  if (!user || user.banned) {
    return createResponse('error', 'User not found or banned');
  }
  
  // Get item
  const item = getItemById(itemId);
  if (!item) {
    return createResponse('error', 'Item not found');
  }
  
  // Check ownership
  if (item.userId !== session.userId && !user.isAdmin) {
    return createResponse('error', 'Not authorized to delete this item');
  }
  
  const success = deleteItem(itemId);
  if (!success) {
    return createResponse('error', 'Failed to delete item');
  }
  
  return createResponse('success', 'Item deleted successfully');
}

function handleCreateSwapRequest(data) {
  const { sessionToken, itemId, message } = data;
  
  // Validate session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const user = getUserById(session.userId);
  if (!user || user.banned) {
    return createResponse('error', 'User not found or banned');
  }
  
  // Get item
  const item = getItemById(itemId);
  if (!item) {
    return createResponse('error', 'Item not found');
  }
  
  // Can't request your own item
  if (item.userId === session.userId) {
    return createResponse('error', 'Cannot request your own item');
  }
  
  // Check if user has enough points
  if (user.points < item.points) {
    return createResponse('error', 'Insufficient points');
  }
  
  // Create swap request
  const requestId = 'swap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const requestData = {
    id: requestId,
    requesterId: session.userId,
    itemId: itemId,
    message: message || '',
    status: 'pending', // pending, accepted, rejected, completed
    createdAt: new Date().toISOString(),
    respondedAt: null,
    completedAt: null
  };
  
  const success = createSwapRequest(requestData);
  if (!success) {
    return createResponse('error', 'Failed to create swap request');
  }
  
  return createResponse('success', 'Swap request created successfully', { requestId });
}

function handleUpdateSwapRequest(data) {
  const { sessionToken, requestId, status } = data;
  
  // Validate session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const user = getUserById(session.userId);
  if (!user || user.banned) {
    return createResponse('error', 'User not found or banned');
  }
  
  // Get swap request
  const request = getSwapRequestById(requestId);
  if (!request) {
    return createResponse('error', 'Swap request not found');
  }
  
  // Get item
  const item = getItemById(request.itemId);
  if (!item) {
    return createResponse('error', 'Item not found');
  }
  
  // Check authorization (only item owner can respond)
  if (item.userId !== session.userId) {
    return createResponse('error', 'Not authorized to update this request');
  }
  
  if (!['accepted', 'rejected'].includes(status)) {
    return createResponse('error', 'Invalid status');
  }
  
  // Update request
  const updatedRequest = {
    ...request,
    status: status,
    respondedAt: new Date().toISOString()
  };
  
  const success = updateSwapRequest(requestId, updatedRequest);
  if (!success) {
    return createResponse('error', 'Failed to update swap request');
  }
  
  // If accepted, transfer points
  if (status === 'accepted') {
    const requester = getUserById(request.requesterId);
    const itemOwner = getUserById(item.userId);
    
    if (requester && itemOwner) {
      // Deduct points from requester
      updateUserPoints(request.requesterId, requester.points - item.points);
      // Add points to item owner
      updateUserPoints(item.userId, itemOwner.points + item.points);
    }
  }
  
  return createResponse('success', 'Swap request updated successfully');
}

function handleGetUserProfile(data) {
  const { sessionToken } = data;
  
  // Validate session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const user = getUserById(session.userId);
  if (!user) {
    return createResponse('error', 'User not found');
  }
  
  // Get user's items
  const items = getUserItems(session.userId);
  
  // Get user's swap requests
  const requests = getUserSwapRequests(session.userId);
  
  const profile = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    points: user.points,
    joinedAt: user.joinedAt,
    isAdmin: user.isAdmin,
    items: items,
    swapRequests: requests
  };
  
  return createResponse('success', 'Profile retrieved', { profile });
}

function handleUpdateUserProfile(data) {
  const { sessionToken, displayName } = data;
  
  // Validate session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const user = getUserById(session.userId);
  if (!user || user.banned) {
    return createResponse('error', 'User not found or banned');
  }
  
  if (!displayName || displayName.trim().length === 0) {
    return createResponse('error', 'Display name is required');
  }
  
  // Update user
  const updatedUser = {
    ...user,
    displayName: displayName.trim()
  };
  
  const success = updateUser(session.userId, updatedUser);
  if (!success) {
    return createResponse('error', 'Failed to update profile');
  }
  
  return createResponse('success', 'Profile updated successfully');
}

function handleSearchItems(data) {
  const { query, category, condition, size, minPoints, maxPoints, page = 1, limit = 20 } = data;
  
  try {
    const sheet = getSheet(SHEETS.ITEMS);
    if (!sheet) {
      return createResponse('success', 'No items found', { items: [], total: 0 });
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse('success', 'No items found', { items: [], total: 0 });
    }
    
    let items = data.slice(1).map(row => ({
      id: row[0],
      userId: row[1],
      title: row[2],
      description: row[3],
      category: row[4],
      condition: row[5],
      size: row[6],
      points: parseInt(row[7]) || 0,
      images: row[8] ? JSON.parse(row[8]) : [],
      status: row[9],
      createdAt: row[10],
      approvedAt: row[11],
      approvedBy: row[12]
    }));
    
    // Filter by status (only show approved items)
    items = items.filter(item => item.status === 'approved');
    
    // Apply search query
    if (query) {
      const searchTerm = query.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply filters
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    if (condition) {
      items = items.filter(item => item.condition === condition);
    }
    
    if (size) {
      items = items.filter(item => item.size === size);
    }
    
    if (minPoints) {
      items = items.filter(item => item.points >= parseInt(minPoints));
    }
    
    if (maxPoints) {
      items = items.filter(item => item.points <= parseInt(maxPoints));
    }
    
    // Sort by creation date (newest first)
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const total = items.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return createResponse('success', 'Search completed', {
      items: paginatedItems,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error('Error searching items:', error);
    return createResponse('error', 'Failed to search items');
  }
}

function handleGetPlatformStats(data) {
  try {
    const users = getAllUsers();
    const items = getAllItems();
    const swapRequests = getAllSwapRequests();
    
    const stats = {
      totalUsers: users.length,
      totalItems: items.filter(item => item.status === 'approved').length,
      pendingItems: items.filter(item => item.status === 'pending').length,
      totalSwapRequests: swapRequests.length,
      completedSwaps: swapRequests.filter(req => req.status === 'completed').length
    };
    
    return createResponse('success', 'Stats retrieved', { stats });
  } catch (error) {
    console.error('Error getting stats:', error);
    return createResponse('error', 'Failed to get stats');
  }
}

// Admin functions
function handleAdminGetUsers(data) {
  const { sessionToken } = data;
  
  // Validate admin session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const user = getUserById(session.userId);
  if (!user || !user.isAdmin) {
    return createResponse('error', 'Admin access required');
  }
  
  const users = getAllUsers();
  return createResponse('success', 'Users retrieved', { users });
}

function handleAdminBanUser(data) {
  const { sessionToken, userId, banned } = data;
  
  // Validate admin session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const admin = getUserById(session.userId);
  if (!admin || !admin.isAdmin) {
    return createResponse('error', 'Admin access required');
  }
  
  const user = getUserById(userId);
  if (!user) {
    return createResponse('error', 'User not found');
  }
  
  // Can't ban yourself
  if (userId === session.userId) {
    return createResponse('error', 'Cannot ban yourself');
  }
  
  const updatedUser = {
    ...user,
    banned: banned
  };
  
  const success = updateUser(userId, updatedUser);
  if (!success) {
    return createResponse('error', 'Failed to update user');
  }
  
  return createResponse('success', `User ${banned ? 'banned' : 'unbanned'} successfully`);
}

function handleAdminApproveItem(data) {
  const { sessionToken, itemId } = data;
  
  // Validate admin session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const admin = getUserById(session.userId);
  if (!admin || !admin.isAdmin) {
    return createResponse('error', 'Admin access required');
  }
  
  const item = getItemById(itemId);
  if (!item) {
    return createResponse('error', 'Item not found');
  }
  
  const updatedItem = {
    ...item,
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy: session.userId
  };
  
  const success = updateItem(itemId, updatedItem);
  if (!success) {
    return createResponse('error', 'Failed to approve item');
  }
  
  return createResponse('success', 'Item approved successfully');
}

function handleAdminRejectItem(data) {
  const { sessionToken, itemId } = data;
  
  // Validate admin session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const admin = getUserById(session.userId);
  if (!admin || !admin.isAdmin) {
    return createResponse('error', 'Admin access required');
  }
  
  const item = getItemById(itemId);
  if (!item) {
    return createResponse('error', 'Item not found');
  }
  
  const updatedItem = {
    ...item,
    status: 'rejected',
    approvedAt: new Date().toISOString(),
    approvedBy: session.userId
  };
  
  const success = updateItem(itemId, updatedItem);
  if (!success) {
    return createResponse('error', 'Failed to reject item');
  }
  
  return createResponse('success', 'Item rejected successfully');
}

function handleAdminGetItems(data) {
  const { sessionToken, status } = data;
  
  // Validate admin session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const admin = getUserById(session.userId);
  if (!admin || !admin.isAdmin) {
    return createResponse('error', 'Admin access required');
  }
  
  let items = getAllItems();
  
  if (status) {
    items = items.filter(item => item.status === status);
  }
  
  return createResponse('success', 'Items retrieved', { items });
}

function handleAdminGetSwapRequests(data) {
  const { sessionToken } = data;
  
  // Validate admin session
  const session = getSession(sessionToken);
  if (!session) {
    return createResponse('error', 'Invalid session');
  }
  
  const admin = getUserById(session.userId);
  if (!admin || !admin.isAdmin) {
    return createResponse('error', 'Admin access required');
  }
  
  const requests = getAllSwapRequests();
  return createResponse('success', 'Swap requests retrieved', { requests });
}

// Additional helper functions for database operations
function getAllItems() {
  try {
    const sheet = getSheet(SHEETS.ITEMS);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    return data.slice(1).map(row => ({
      id: row[0],
      userId: row[1],
      title: row[2],
      description: row[3],
      category: row[4],
      condition: row[5],
      size: row[6],
      points: parseInt(row[7]) || 0,
      images: row[8] ? JSON.parse(row[8]) : [],
      status: row[9],
      createdAt: row[10],
      approvedAt: row[11],
      approvedBy: row[12]
    }));
  } catch (error) {
    console.error('Error getting all items:', error);
    return [];
  }
}

function getItemById(itemId) {
  const items = getAllItems();
  return items.find(item => item.id === itemId);
}

function getUserItems(userId) {
  const items = getAllItems();
  return items.filter(item => item.userId === userId);
}

function createItem(itemData) {
  try {
    const sheet = getSheet(SHEETS.ITEMS);
    if (!sheet) return false;
    
    const row = [
      itemData.id,
      itemData.userId,
      itemData.title,
      itemData.description,
      itemData.category,
      itemData.condition,
      itemData.size,
      itemData.points,
      JSON.stringify(itemData.images),
      itemData.status,
      itemData.createdAt,
      itemData.approvedAt,
      itemData.approvedBy
    ];
    
    sheet.appendRow(row);
    return true;
  } catch (error) {
    console.error('Error creating item:', error);
    return false;
  }
}

function updateItem(itemId, itemData) {
  try {
    const sheet = getSheet(SHEETS.ITEMS);
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === itemId);
    
    if (rowIndex <= 0) return false;
    
    const row = [
      itemData.id,
      itemData.userId,
      itemData.title,
      itemData.description,
      itemData.category,
      itemData.condition,
      itemData.size,
      itemData.points,
      JSON.stringify(itemData.images),
      itemData.status,
      itemData.createdAt,
      itemData.approvedAt,
      itemData.approvedBy
    ];
    
    sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
    return true;
  } catch (error) {
    console.error('Error updating item:', error);
    return false;
  }
}

function deleteItem(itemId) {
  try {
    const sheet = getSheet(SHEETS.ITEMS);
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === itemId);
    
    if (rowIndex > 0) {
      sheet.deleteRow(rowIndex + 1);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting item:', error);
    return false;
  }
}

function getAllSwapRequests() {
  try {
    const sheet = getSheet(SHEETS.SWAP_REQUESTS);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    return data.slice(1).map(row => ({
      id: row[0],
      requesterId: row[1],
      itemId: row[2],
      message: row[3],
      status: row[4],
      createdAt: row[5],
      respondedAt: row[6],
      completedAt: row[7]
    }));
  } catch (error) {
    console.error('Error getting all swap requests:', error);
    return [];
  }
}

function getSwapRequestById(requestId) {
  const requests = getAllSwapRequests();
  return requests.find(req => req.id === requestId);
}

function getUserSwapRequests(userId) {
  const requests = getAllSwapRequests();
  return requests.filter(req => req.requesterId === userId);
}

function createSwapRequest(requestData) {
  try {
    const sheet = getSheet(SHEETS.SWAP_REQUESTS);
    if (!sheet) return false;
    
    const row = [
      requestData.id,
      requestData.requesterId,
      requestData.itemId,
      requestData.message,
      requestData.status,
      requestData.createdAt,
      requestData.respondedAt,
      requestData.completedAt
    ];
    
    sheet.appendRow(row);
    return true;
  } catch (error) {
    console.error('Error creating swap request:', error);
    return false;
  }
}

function updateSwapRequest(requestId, requestData) {
  try {
    const sheet = getSheet(SHEETS.SWAP_REQUESTS);
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === requestId);
    
    if (rowIndex <= 0) return false;
    
    const row = [
      requestData.id,
      requestData.requesterId,
      requestData.itemId,
      requestData.message,
      requestData.status,
      requestData.createdAt,
      requestData.respondedAt,
      requestData.completedAt
    ];
    
    sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
    return true;
  } catch (error) {
    console.error('Error updating swap request:', error);
    return false;
  }
}

function updateUser(userId, userData) {
  try {
    const sheet = getSheet(SHEETS.USERS);
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === userId);
    
    if (rowIndex <= 0) return false;
    
    const row = [
      userData.id,
      userData.email,
      userData.displayName,
      userData.password,
      userData.points,
      userData.joinedAt,
      userData.isAdmin,
      userData.banned
    ];
    
    sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

function updateUserPoints(userId, newPoints) {
  try {
    const user = getUserById(userId);
    if (!user) return false;
    
    const updatedUser = {
      ...user,
      points: Math.max(0, newPoints) // Ensure points don't go negative
    };
    
    return updateUser(userId, updatedUser);
  } catch (error) {
    console.error('Error updating user points:', error);
    return false;
  }
}

/**
 * Test function to verify the script is working
 */
function testScript() {
  console.log('Script is working!');
  console.log('CONFIG:', CONFIG);
  console.log('SHEETS:', SHEETS);
  
  // Test getting categories
  const categories = [
    { id: 'tops', name: 'Tops' },
    { id: 'bottoms', name: 'Bottoms' },
    { id: 'dresses', name: 'Dresses' },
    { id: 'outerwear', name: 'Outerwear' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'bags', name: 'Bags' },
    { id: 'jewelry', name: 'Jewelry' }
  ];
  
  console.log('Categories:', categories);
  return 'Script test completed successfully!';
}

/**
 * Diagnostic function to check which sheets are missing
 */
function diagnoseSheets() {
  console.log('=== DIAGNOSING SHEETS ===');
  
  const results = {
    rewearSpreadsheet: {
      id: CONFIG.REWEAR_SPREADSHEET_ID,
      accessible: false,
      sheets: {}
    },
    itemsSpreadsheet: {
      id: CONFIG.ITEMS_SPREADSHEET_ID,
      accessible: false,
      sheets: {}
    }
  };
  
  // Check ReWear Data spreadsheet
  try {
    const rewearSpreadsheet = SpreadsheetApp.openById(CONFIG.REWEAR_SPREADSHEET_ID);
    results.rewearSpreadsheet.accessible = true;
    
    const rewearSheets = rewearSpreadsheet.getSheets();
    rewearSheets.forEach(sheet => {
      results.rewearSpreadsheet.sheets[sheet.getName()] = true;
    });
    
    console.log('ReWear Data spreadsheet accessible');
    console.log('Available sheets:', Object.keys(results.rewearSpreadsheet.sheets));
  } catch (error) {
    console.error('Error accessing ReWear Data spreadsheet:', error.message);
  }
  
  // Check Items spreadsheet
  try {
    const itemsSpreadsheet = SpreadsheetApp.openById(CONFIG.ITEMS_SPREADSHEET_ID);
    results.itemsSpreadsheet.accessible = true;
    
    const itemsSheets = itemsSpreadsheet.getSheets();
    itemsSheets.forEach(sheet => {
      results.itemsSpreadsheet.sheets[sheet.getName()] = true;
    });
    
    console.log('Items spreadsheet accessible');
    console.log('Available sheets:', Object.keys(results.itemsSpreadsheet.sheets));
  } catch (error) {
    console.error('Error accessing Items spreadsheet:', error.message);
  }
  
  // Check required sheets
  const requiredSheets = {
    'ReWear Data': ['Users', 'SwapRequests', 'Sessions', 'Categories'],
    'Items': ['Items']
  };
  
  const missingSheets = {
    'ReWear Data': [],
    'Items': []
  };
  
  requiredSheets['ReWear Data'].forEach(sheetName => {
    if (!results.rewearSpreadsheet.sheets[sheetName]) {
      missingSheets['ReWear Data'].push(sheetName);
    }
  });
  
  requiredSheets['Items'].forEach(sheetName => {
    if (!results.itemsSpreadsheet.sheets[sheetName]) {
      missingSheets['Items'].push(sheetName);
    }
  });
  
  console.log('=== DIAGNOSIS RESULTS ===');
  console.log('Missing sheets in ReWear Data:', missingSheets['ReWear Data']);
  console.log('Missing sheets in Items:', missingSheets['Items']);
  
  return {
    results,
    missingSheets,
    summary: `Missing ${missingSheets['ReWear Data'].length + missingSheets['Items'].length} sheets total`
  };
}

/**
 * Create missing sheets automatically
 */
function createMissingSheets() {
  console.log('=== CREATING MISSING SHEETS ===');
  
  const diagnosis = diagnoseSheets();
  
  // Create sheets in ReWear Data spreadsheet
  if (diagnosis.results.rewearSpreadsheet.accessible) {
    const rewearSpreadsheet = SpreadsheetApp.openById(CONFIG.REWEAR_SPREADSHEET_ID);
    
    diagnosis.missingSheets['ReWear Data'].forEach(sheetName => {
      try {
        const newSheet = rewearSpreadsheet.insertSheet(sheetName);
        
        // Set up headers based on sheet type
        switch (sheetName) {
          case 'Users':
            newSheet.getRange(1, 1, 1, 8).setValues([['ID', 'Email', 'DisplayName', 'Password', 'Points', 'JoinedAt', 'IsAdmin', 'Banned']]);
            break;
          case 'SwapRequests':
            newSheet.getRange(1, 1, 1, 8).setValues([['ID', 'RequesterID', 'ItemID', 'Message', 'Status', 'CreatedAt', 'RespondedAt', 'CompletedAt']]);
            break;
          case 'Sessions':
            newSheet.getRange(1, 1, 1, 4).setValues([['Token', 'UserID', 'CreatedAt', 'ExpiresAt']]);
            break;
          case 'Categories':
            newSheet.getRange(1, 1, 1, 2).setValues([['ID', 'Name']]);
            // Add default categories
            const categories = [
              ['tops', 'Tops'],
              ['bottoms', 'Bottoms'],
              ['dresses', 'Dresses'],
              ['outerwear', 'Outerwear'],
              ['shoes', 'Shoes'],
              ['accessories', 'Accessories'],
              ['bags', 'Bags'],
              ['jewelry', 'Jewelry']
            ];
            newSheet.getRange(2, 1, categories.length, 2).setValues(categories);
            break;
        }
        
        console.log(`Created sheet: ${sheetName}`);
      } catch (error) {
        console.error(`Error creating sheet ${sheetName}:`, error.message);
      }
    });
  }
  
  // Create sheets in Items spreadsheet
  if (diagnosis.results.itemsSpreadsheet.accessible) {
    const itemsSpreadsheet = SpreadsheetApp.openById(CONFIG.ITEMS_SPREADSHEET_ID);
    
    diagnosis.missingSheets['Items'].forEach(sheetName => {
      try {
        const newSheet = itemsSpreadsheet.insertSheet(sheetName);
        
        // Set up headers for Items sheet
        if (sheetName === 'Items') {
          newSheet.getRange(1, 1, 1, 13).setValues([['ID', 'UserID', 'Title', 'Description', 'Category', 'Condition', 'Size', 'Points', 'Images', 'Status', 'CreatedAt', 'ApprovedAt', 'ApprovedBy']]);
        }
        
        console.log(`Created sheet: ${sheetName}`);
      } catch (error) {
        console.error(`Error creating sheet ${sheetName}:`, error.message);
      }
    });
  }
  
  console.log('=== SHEET CREATION COMPLETE ===');
  return 'Missing sheets have been created. Run diagnoseSheets() to verify.';
}

/**
 * Quick test to verify everything is working
 */
function quickTest() {
  console.log('=== QUICK TEST ===');
  
  try {
    // Test 1: Check if we can access sheets
    const usersSheet = getSheet(SHEETS.USERS);
    console.log('Users sheet accessible:', !!usersSheet);
    
    const itemsSheet = getSheet(SHEETS.ITEMS);
    console.log('Items sheet accessible:', !!itemsSheet);
    
    // Test 2: Try to get categories
    const categories = [
      { id: 'tops', name: 'Tops' },
      { id: 'bottoms', name: 'Bottoms' },
      { id: 'dresses', name: 'Dresses' },
      { id: 'outerwear', name: 'Outerwear' },
      { id: 'shoes', name: 'Shoes' },
      { id: 'accessories', name: 'Accessories' },
      { id: 'bags', name: 'Bags' },
      { id: 'jewelry', name: 'Jewelry' }
    ];
    
    console.log('Categories test passed');
    
    // Test 3: Test doPost with getCategories
    const testData = {
      action: 'getCategories'
    };
    
    const mockEvent = {
      postData: {
        contents: JSON.stringify(testData)
      }
    };
    
    const result = doPost(mockEvent);
    console.log('doPost test result:', result.getContent());
    
    return 'All tests passed!';
    
  } catch (error) {
    console.error('Test failed:', error.message);
    return 'Test failed: ' + error.message;
  }
} 