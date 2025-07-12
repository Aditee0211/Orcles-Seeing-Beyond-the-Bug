import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, itemService } from '../lib/appsScriptService';
import './LandingPage.css';

interface User {
  email: string;
  points: number;
  role: string;
}

interface Item {
  id: string;
  itemId?: string;
  description: string;
  title?: string;
  category: string;
  size: string;
  condition: string;
  points?: number;
  pointsRequired?: number;
  status: string;
  imageUrl?: string;
  images?: string[];
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'auth' | 'signup' | 'dashboard' | 'addItem' | 'myItems' | 'browseItems'>('auth');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    description: '',
    category: '',
    size: '',
    condition: '',
    points: 50,
    image: null as File | null
  });

  // Check authentication on component mount
  useEffect(() => {
    checkAuthAndRender();
  }, []);

  const checkAuthAndRender = () => {
    const sessionToken = localStorage.getItem('sessionToken');
    const userEmail = localStorage.getItem('userEmail');
    const userPoints = localStorage.getItem('userPoints');
    const userRole = localStorage.getItem('userRole');

    if (sessionToken && userEmail) {
      setUser({
        email: userEmail,
        points: parseInt(userPoints || '0'),
        role: userRole || 'user'
      });
      setCurrentView('dashboard');
    } else {
      setCurrentView('auth');
    }
    setIsLoading(false);
  };

  const displayMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage({ text, type });
    if (type === 'success' || type === 'info') {
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const clearMessage = () => setMessage(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      displayMessage('Please fill in all fields.', 'error');
      return;
    }

    displayMessage('Logging in...', 'info');

    try {
      const response = await authService.login(formData.email, formData.password);
      
      localStorage.setItem('sessionToken', response.sessionToken);
      localStorage.setItem('userId', response.userId);
      localStorage.setItem('userEmail', response.email);
      localStorage.setItem('userPoints', response.points.toString());
      localStorage.setItem('userRole', response.role);

      setUser({
        email: response.email,
        points: response.points,
        role: response.role
      });

      displayMessage('Login successful!', 'success');
      setCurrentView('dashboard');
      setFormData({ ...formData, email: '', password: '' });
    } catch (error) {
      displayMessage(error instanceof Error ? error.message : 'Login failed.', 'error');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      displayMessage('Please fill in all fields.', 'error');
      return;
    }

    if (formData.password.length < 6) {
      displayMessage('Password must be at least 6 characters long.', 'error');
      return;
    }

    displayMessage('Signing up...', 'info');

    try {
      const displayName = formData.email.split('@')[0];
      const response = await authService.register(formData.email, formData.password, displayName);
      
      displayMessage('Registration successful! Please login.', 'success');
      setFormData({ ...formData, email: '', password: '' });
      setCurrentView('auth');
    } catch (error) {
      displayMessage(error instanceof Error ? error.message : 'Registration failed.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPoints');
    localStorage.removeItem('userRole');
    setUser(null);
    setCurrentView('auth');
    clearMessage();
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      displayMessage('You must be logged in to add an item.', 'error');
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      displayMessage('Please enter a detailed description (at least 10 characters).', 'error');
      return;
    }

    if (!formData.category || !formData.size || !formData.condition) {
      displayMessage('Please fill in all required fields.', 'error');
      return;
    }

    if (!formData.image) {
      displayMessage('Please upload an image for your item.', 'error');
      return;
    }

    if (formData.image.size > 2 * 1024 * 1024) {
      displayMessage('Image file size must be less than 2MB.', 'error');
      return;
    }

    displayMessage('Adding item...', 'info');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        const itemData = {
          title: formData.description,
          description: formData.description,
          category: formData.category,
          size: formData.size,
          condition: formData.condition as 'excellent' | 'good' | 'fair',
          pointsRequired: formData.points,
          images: [base64data]
        };

        const response = await itemService.addItem(localStorage.getItem('sessionToken')!, itemData);
        
        displayMessage(`Item added successfully! ID: ${response.itemId}`, 'success');
        setFormData({
          ...formData,
          description: '',
          category: '',
          size: '',
          condition: '',
          points: 50,
          image: null
        });
        setCurrentView('dashboard');
      };
      reader.readAsDataURL(formData.image);
    } catch (error) {
      displayMessage(error instanceof Error ? error.message : 'Failed to add item.', 'error');
    }
  };

  const loadMyItems = async () => {
    if (!user) return;

    displayMessage('Loading your items...', 'info');
    try {
      const response = await itemService.getItems({}, 'newest', 1, 100);
      const myItems = response.items.filter(item => item.ownerId === localStorage.getItem('userId'));
      setItems(myItems);
      clearMessage();
    } catch (error) {
      displayMessage('Failed to load your items.', 'error');
    }
  };

  const loadBrowseItems = async () => {
    if (!user) return;

    displayMessage('Loading available items...', 'info');
    try {
      const response = await itemService.getItems({}, 'newest', 1, 100);
      const otherItems = response.items.filter(item => item.ownerId !== localStorage.getItem('userId'));
      setItems(otherItems);
      clearMessage();
    } catch (error) {
      displayMessage('Failed to load available items.', 'error');
    }
  };

  const renderAuthPage = () => (
    <div className="container">
      <h2>Welcome to ReWear</h2>
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="auth-tabs">
        <button 
          className={`tab ${currentView === 'auth' ? 'active' : ''}`}
          onClick={() => setCurrentView('auth')}
        >
          Login
        </button>
        <button 
          className={`tab ${currentView === 'signup' ? 'active' : ''}`}
          onClick={() => setCurrentView('signup')}
        >
          Sign Up
        </button>
      </div>

      {currentView === 'auth' ? (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="primary-btn">Login</button>
        </form>
      ) : (
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="signup-email">Email:</label>
            <input
              type="email"
              id="signup-email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-password">Password:</label>
            <input
              type="password"
              id="signup-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              minLength={6}
              required
            />
          </div>
          <button type="submit" className="primary-btn">Sign Up</button>
        </form>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="container dashboard">
      <h2>Welcome to Your ReWear Dashboard!</h2>
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="dashboard-sections">
        <div className="dashboard-card">
          <h3>List an Item</h3>
          <p>Have clothes to exchange? List them here and earn points!</p>
          <button className="action-btn" onClick={() => setCurrentView('addItem')}>
            List a New Item
          </button>
        </div>
        
        <div className="dashboard-card">
          <h3>My Listed Items</h3>
          <p>View, edit, or remove the items you've put up for exchange.</p>
          <button className="action-btn" onClick={() => {
            setCurrentView('myItems');
            loadMyItems();
          }}>
            View My Items
          </button>
        </div>
        
        <div className="dashboard-card">
          <h3>Browse Items</h3>
          <p>Explore available items from other users and redeem with your points.</p>
          <button className="action-btn" onClick={() => {
            setCurrentView('browseItems');
            loadBrowseItems();
          }}>
            Browse Items
          </button>
        </div>
        
        <div className="dashboard-card">
          <h3>Swap Requests</h3>
          <p>Manage incoming and outgoing swap requests.</p>
          <button className="action-btn" onClick={() => displayMessage('Swap Request management coming soon!', 'info')}>
            View Swap Requests
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddItem = () => (
    <div className="container">
      <h2>List a New Item</h2>
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleAddItem}>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Blue denim jacket, slightly worn"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            <option value="Top">Top</option>
            <option value="Bottom">Bottom</option>
            <option value="Dress">Dress</option>
            <option value="Outerwear">Outerwear</option>
            <option value="Footwear">Footwear</option>
            <option value="Accessory">Accessory</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="size">Size:</label>
          <select
            id="size"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            required
          >
            <option value="">Select Size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
            <option value="One Size">One Size</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="condition">Condition:</label>
          <select
            id="condition"
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            required
          >
            <option value="">Select Condition</option>
            <option value="excellent">New with Tags</option>
            <option value="good">Like New</option>
            <option value="fair">Gently Used</option>
            <option value="fair">Fair</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="points">Desired Points:</label>
          <input
            type="number"
            id="points"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
            min={10}
            required
          />
          <small>(e.g., 50 points)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Upload Image:</label>
          <input
            type="file"
            id="image"
            accept="image/jpeg, image/png"
            onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
            required
          />
          <small>(Max 2MB, JPEG/PNG recommended)</small>
        </div>
        
        <button type="submit" className="primary-btn">Add Item</button>
      </form>
    </div>
  );

  const renderItems = (title: string, items: Item[], showActions = false) => (
    <div className="container items-container">
      <h2>{title}</h2>
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {items.length === 0 ? (
        <p>{title === 'My Listed Items' ? 'You have not listed any items yet.' : 'No items currently available.'}</p>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.itemId} className="item-card">
              <img 
                src={item.imageUrl || 'https://via.placeholder.com/150?text=No+Image'} 
                alt={item.description} 
              />
              <h3>{item.description}</h3>
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Size:</strong> {item.size}</p>
              <p><strong>Condition:</strong> {item.condition}</p>
              <p><strong>Points:</strong> {item.points}</p>
              {showActions && (
                <p><strong>Status:</strong> {item.status}</p>
              )}
              <div className="item-actions">
                {showActions ? (
                  <>
                    <button className="action-btn" onClick={() => alert('Edit functionality coming soon!')}>
                      Edit
                    </button>
                    <button className="action-btn delete" onClick={() => alert('Remove functionality coming soon!')}>
                      Remove
                    </button>
                  </>
                ) : (
                  <button className="action-btn" onClick={() => alert('View details functionality coming soon!')}>
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <header>
        <h1 onClick={() => setCurrentView('dashboard')}>ReWear</h1>
        {user && (
          <div className="user-info">
            <div className="user-details">
              Hello, <span>{user.email}</span>! <br />
              Points: <span>{user.points}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <main>
        {currentView === 'auth' && renderAuthPage()}
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'addItem' && renderAddItem()}
        {currentView === 'myItems' && renderItems('My Listed Items', items, true)}
        {currentView === 'browseItems' && renderItems('Browse Available Items', items, false)}
      </main>
    </div>
  );
};

export default LandingPage; 