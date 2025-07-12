import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Package, Heart, Award, Users, ShoppingBag, Settings } from 'lucide-react';
import { itemService, swapService, sessionManager, type ClothingItem, type SwapRequest } from '../lib/appsScriptService';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();

  const stats = [
    { label: 'Total Points', value: userProfile?.points || 0, icon: Award, color: 'text-emerald-600' },
    { label: 'Items Listed', value: 12, icon: Package, color: 'text-blue-600' },
    { label: 'Successful Swaps', value: 8, icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Favorites', value: 24, icon: Heart, color: 'text-pink-600' }
  ];

  const myListings = [
    {
      id: 1,
      title: 'Summer Dress',
      image: 'https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'available',
      views: 23
    },
    {
      id: 2,
      title: 'Leather Jacket',
      image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'pending',
      views: 41
    },
    {
      id: 3,
      title: 'Designer Heels',
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'available',
      views: 18
    },
    {
      id: 4,
      title: 'Casual Jeans',
      image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'swapped',
      views: 67
    }
  ];

  const myPurchases = [
    {
      id: 1,
      title: 'Vintage Blazer',
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=200',
      points: 45,
      date: '2 days ago'
    },
    {
      id: 2,
      title: 'Silk Scarf',
      image: 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=200',
      points: 20,
      date: '1 week ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'swapped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {userProfile?.displayName}!
                </h1>
                <p className="text-gray-600">Here's what's happening with your items</p>
              </div>
            </div>
            <Link
              to="/add-item"
              className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Item
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-opacity-10 flex items-center justify-center ${stat.color.replace('text-', 'bg-')}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Listings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
              <Link
                to="/my-listings"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {myListings.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">{item.views} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Purchases */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Purchases</h2>
              <Link
                to="/my-purchases"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {myPurchases.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm font-medium text-emerald-600">{item.points} points</span>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;