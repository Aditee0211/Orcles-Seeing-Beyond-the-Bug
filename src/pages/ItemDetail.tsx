import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Share2, Flag, User, Calendar, Package, Award, ArrowLeft, MessageCircle } from 'lucide-react';
import { doc, getDoc, collection, addDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ClothingItem, SwapRequest } from '../types';

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock item data for demonstration
  const mockItem: ClothingItem = {
    id: '1',
    title: 'Vintage Denim Jacket',
    description: 'This beautiful vintage denim jacket is a timeless piece that never goes out of style. Made from high-quality denim with a classic fit, it features authentic vintage details including original buttons and subtle fading that gives it character. Perfect for layering over dresses, t-shirts, or sweaters. The jacket has been well-maintained and shows minimal signs of wear. It\'s a versatile piece that can be dressed up or down for any occasion.',
    category: 'Outerwear',
    size: 'M',
    condition: 'excellent',
    images: [
      'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    tags: ['vintage', 'denim', 'casual', 'classic'],
    pointsRequired: 45,
    ownerId: 'user1',
    ownerName: 'Sarah Johnson',
    createdAt: new Date('2024-01-15'),
    status: 'available',
    featured: true
  };

  const relatedItems = [
    {
      id: '2',
      title: 'Leather Jacket',
      image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=300',
      points: 55
    },
    {
      id: '3',
      title: 'Casual Blazer',
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300',
      points: 40
    },
    {
      id: '4',
      title: 'Wool Coat',
      image: 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=300',
      points: 65
    },
    {
      id: '5',
      title: 'Bomber Jacket',
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=300',
      points: 35
    }
  ];

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Firestore
      // For now, we'll use the mock data
      setItem(mockItem);
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRequest = async () => {
    if (!currentUser || !item) return;

    setIsSubmitting(true);
    try {
      // Create swap request in Firestore
      const swapRequest: Omit<SwapRequest, 'id'> = {
        itemId: item.id,
        requesterId: currentUser.uid,
        ownerId: item.ownerId,
        status: 'pending',
        message: swapMessage,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'swapRequests'), swapRequest);
      
      // Update item status to pending
      await updateDoc(doc(db, 'items', item.id), {
        status: 'pending'
      });

      setShowSwapModal(false);
      setSwapMessage('');
      alert('Swap request sent successfully!');
    } catch (error) {
      console.error('Error sending swap request:', error);
      alert('Failed to send swap request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemWithPoints = async () => {
    if (!currentUser || !item || !userProfile) return;

    if (userProfile.points < item.pointsRequired) {
      alert('You don\'t have enough points for this item.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to redeem this item for ${item.pointsRequired} points?`
    );

    if (!confirmed) return;

    try {
      // Deduct points from user
      await updateDoc(doc(db, 'users', currentUser.uid), {
        points: increment(-item.pointsRequired)
      });

      // Add points to item owner
      await updateDoc(doc(db, 'users', item.ownerId), {
        points: increment(item.pointsRequired)
      });

      // Update item status
      await updateDoc(doc(db, 'items', item.id), {
        status: 'swapped'
      });

      alert('Item redeemed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error redeeming item:', error);
      alert('Failed to redeem item. Please try again.');
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
          <Link
            to="/browse"
            className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.uid === item.ownerId;
  const canAfford = userProfile && userProfile.points >= item.pointsRequired;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden mb-4">
              <img
                src={item.images[selectedImage]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-emerald-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(item.condition)}`}>
                    {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)} Condition
                  </span>
                  <span className="text-gray-500">Size {item.size}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                  <Flag className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Points */}
            <div className="bg-emerald-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 font-medium mb-1">Points Required</p>
                  <p className="text-3xl font-bold text-emerald-700">{item.pointsRequired}</p>
                </div>
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              {userProfile && (
                <p className="text-sm text-emerald-600 mt-2">
                  You have {userProfile.points} points
                  {!canAfford && ` (need ${item.pointsRequired - userProfile.points} more)`}
                </p>
              )}
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Listed by</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.ownerName}</p>
                  <p className="text-sm text-gray-500">Member since 2023</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">23</p>
                  <p className="text-sm text-gray-500">Swaps</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwner && currentUser && item.status === 'available' && (
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleRedeemWithPoints}
                  disabled={!canAfford}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-colors ${
                    canAfford
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Redeem with Points' : 'Not Enough Points'}
                </button>
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="w-full py-4 px-6 border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
                >
                  Request Swap
                </button>
              </div>
            )}

            {!currentUser && (
              <div className="mb-6">
                <Link
                  to="/login"
                  className="w-full block text-center py-4 px-6 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Sign In to Exchange
                </Link>
              </div>
            )}

            {/* Item Details */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Category: {item.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Listed {item.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {item.tags.length > 0 && (
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Items */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedItems.map((relatedItem) => (
              <Link
                key={relatedItem.id}
                to={`/item/${relatedItem.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={relatedItem.image}
                    alt={relatedItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {relatedItem.title}
                  </h3>
                  <p className="text-emerald-600 font-bold">{relatedItem.points} points</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Swap Request Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Swap</h3>
            <p className="text-gray-600 mb-4">
              Send a message to {item.ownerName} about swapping for this item.
            </p>
            <textarea
              value={swapMessage}
              onChange={(e) => setSwapMessage(e.target.value)}
              placeholder="Hi! I'm interested in swapping for your item. I have..."
              className="w-full h-32 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSwapModal(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSwapRequest}
                disabled={isSubmitting || !swapMessage.trim()}
                className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;