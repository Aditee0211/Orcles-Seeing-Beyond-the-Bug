import React, { useState, useEffect } from 'react';
import { Users, Package, AlertTriangle, TrendingUp, Eye, Check, X, Ban } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ClothingItem, User, SwapRequest } from '../types';

const Admin: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'items' | 'swaps'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockUsers: User[] = [
    {
      id: 'user1',
      email: 'sarah@example.com',
      displayName: 'Sarah Johnson',
      points: 150,
      joinedAt: new Date('2024-01-15'),
      isAdmin: false
    },
    {
      id: 'user2',
      email: 'emma@example.com',
      displayName: 'Emma Wilson',
      points: 89,
      joinedAt: new Date('2024-02-01'),
      isAdmin: false
    },
    {
      id: 'user3',
      email: 'lisa@example.com',
      displayName: 'Lisa Chen',
      points: 234,
      joinedAt: new Date('2024-01-20'),
      isAdmin: false
    }
  ];

  const mockItems: ClothingItem[] = [
    {
      id: '1',
      title: 'Vintage Denim Jacket',
      description: 'Classic vintage denim jacket in excellent condition.',
      category: 'Outerwear',
      size: 'M',
      condition: 'excellent',
      images: ['https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=200'],
      tags: ['vintage', 'denim'],
      pointsRequired: 45,
      ownerId: 'user1',
      ownerName: 'Sarah Johnson',
      createdAt: new Date('2024-01-16'),
      status: 'available'
    },
    {
      id: '2',
      title: 'Summer Floral Dress',
      description: 'Beautiful floral print dress for summer.',
      category: 'Dresses',
      size: 'S',
      condition: 'good',
      images: ['https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=200'],
      tags: ['floral', 'summer'],
      pointsRequired: 35,
      ownerId: 'user2',
      ownerName: 'Emma Wilson',
      createdAt: new Date('2024-01-18'),
      status: 'pending'
    }
  ];

  const mockSwaps: SwapRequest[] = [
    {
      id: 'swap1',
      itemId: '1',
      requesterId: 'user2',
      ownerId: 'user1',
      status: 'pending',
      message: 'Hi! I love this jacket. Would you be interested in swapping?',
      createdAt: new Date('2024-01-19')
    },
    {
      id: 'swap2',
      itemId: '2',
      requesterId: 'user3',
      ownerId: 'user2',
      status: 'accepted',
      message: 'This dress is perfect for my summer wardrobe!',
      createdAt: new Date('2024-01-17'),
      completedAt: new Date('2024-01-18')
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be Firestore queries
      setUsers(mockUsers);
      setItems(mockItems);
      setSwaps(mockSwaps);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveItem = async (itemId: string) => {
    try {
      await updateDoc(doc(db, 'items', itemId), {
        status: 'available'
      });
      loadData();
    } catch (error) {
      console.error('Error approving item:', error);
    }
  };

  const handleRejectItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'items', itemId));
      loadData();
    } catch (error) {
      console.error('Error rejecting item:', error);
    }
  };

  const handleBanUser = async (userId: string) => {
    const confirmed = window.confirm('Are you sure you want to ban this user?');
    if (!confirmed) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        banned: true
      });
      loadData();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const stats = {
    totalUsers: users.length,
    totalItems: items.length,
    pendingItems: items.filter(item => item.status === 'pending').length,
    totalSwaps: swaps.length,
    pendingSwaps: swaps.filter(swap => swap.status === 'pending').length,
    completedSwaps: swaps.filter(swap => swap.status === 'completed').length
  };

  if (!userProfile?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, items, and platform activity</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'items', label: 'Items', icon: Package },
                { id: 'swaps', label: 'Swaps', icon: AlertTriangle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Overview</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-emerald-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-600 font-medium">Total Users</p>
                            <p className="text-3xl font-bold text-emerald-700">{stats.totalUsers}</p>
                          </div>
                          <Users className="h-8 w-8 text-emerald-500" />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 font-medium">Total Items</p>
                            <p className="text-3xl font-bold text-blue-700">{stats.totalItems}</p>
                          </div>
                          <Package className="h-8 w-8 text-blue-500" />
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-600 font-medium">Pending Items</p>
                            <p className="text-3xl font-bold text-yellow-700">{stats.pendingItems}</p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-yellow-500" />
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 font-medium">Total Swaps</p>
                            <p className="text-3xl font-bold text-purple-700">{stats.totalSwaps}</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-purple-500" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">New user registered: Emma Wilson</span>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Item listed: Vintage Denim Jacket</span>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Swap completed: Summer Dress</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                          <button className="w-full text-left p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                            <span className="font-medium text-emerald-700">Review Pending Items</span>
                            <p className="text-sm text-emerald-600">{stats.pendingItems} items waiting for approval</p>
                          </button>
                          <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                            <span className="font-medium text-yellow-700">Moderate Swaps</span>
                            <p className="text-sm text-yellow-600">{stats.pendingSwaps} swaps need attention</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Points</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium">
                                      {user.displayName.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="font-medium text-gray-900">{user.displayName}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-600">{user.email}</td>
                              <td className="py-4 px-4">
                                <span className="font-medium text-emerald-600">{user.points}</span>
                              </td>
                              <td className="py-4 px-4 text-gray-600">
                                {user.joinedAt.toLocaleDateString()}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <button className="p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleBanUser(user.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Items Tab */}
                {activeTab === 'items' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Item Management</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="aspect-square rounded-lg overflow-hidden mb-4">
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-emerald-600 font-medium">{item.pointsRequired} points</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'available' ? 'bg-green-100 text-green-800' :
                              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleApproveItem(item.id)}
                              className="flex-1 py-2 px-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectItem(item.id)}
                              className="flex-1 py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Swaps Tab */}
                {activeTab === 'swaps' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Swap Management</h2>
                    
                    <div className="space-y-4">
                      {swaps.map((swap) => (
                        <div key={swap.id} className="bg-gray-50 rounded-xl p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  swap.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  swap.status === 'declined' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {swap.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 mb-2">{swap.message}</p>
                              
                              <div className="text-sm text-gray-500">
                                <p>Item ID: {swap.itemId}</p>
                                <p>Requester: {swap.requesterId}</p>
                                <p>Owner: {swap.ownerId}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button className="p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;