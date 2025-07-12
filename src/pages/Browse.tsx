import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List, Heart, Star } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ClothingItem } from '../types';

const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    condition: '',
    minPoints: '',
    maxPoints: '',
    size: '',
    sortBy: 'newest'
  });
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const categories = ['Tops', 'Dresses', 'Pants', 'Shoes', 'Accessories', 'Outerwear'];
  const conditions = ['excellent', 'good', 'fair'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Mock data for demonstration
  const mockItems: ClothingItem[] = [
    {
      id: '1',
      title: 'Vintage Denim Jacket',
      description: 'Classic vintage denim jacket in excellent condition. Perfect for layering.',
      category: 'Outerwear',
      size: 'M',
      condition: 'excellent',
      images: ['https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=400'],
      tags: ['vintage', 'denim', 'casual'],
      pointsRequired: 45,
      ownerId: 'user1',
      ownerName: 'Sarah Johnson',
      createdAt: new Date(),
      status: 'available',
      featured: true
    },
    {
      id: '2',
      title: 'Summer Floral Dress',
      description: 'Beautiful floral print dress, perfect for summer occasions.',
      category: 'Dresses',
      size: 'S',
      condition: 'good',
      images: ['https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=400'],
      tags: ['floral', 'summer', 'casual'],
      pointsRequired: 35,
      ownerId: 'user2',
      ownerName: 'Emma Wilson',
      createdAt: new Date(),
      status: 'available'
    },
    {
      id: '3',
      title: 'Designer Handbag',
      description: 'Authentic designer handbag in pristine condition.',
      category: 'Accessories',
      size: 'One Size',
      condition: 'excellent',
      images: ['https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=400'],
      tags: ['designer', 'luxury', 'handbag'],
      pointsRequired: 65,
      ownerId: 'user3',
      ownerName: 'Lisa Chen',
      createdAt: new Date(),
      status: 'available'
    },
    {
      id: '4',
      title: 'Casual Sneakers',
      description: 'Comfortable white sneakers, lightly worn.',
      category: 'Shoes',
      size: '8',
      condition: 'good',
      images: ['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400'],
      tags: ['sneakers', 'casual', 'white'],
      pointsRequired: 25,
      ownerId: 'user4',
      ownerName: 'Mike Davis',
      createdAt: new Date(),
      status: 'available'
    },
    {
      id: '5',
      title: 'Silk Blouse',
      description: 'Elegant silk blouse perfect for professional settings.',
      category: 'Tops',
      size: 'M',
      condition: 'excellent',
      images: ['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400'],
      tags: ['silk', 'professional', 'elegant'],
      pointsRequired: 40,
      ownerId: 'user5',
      ownerName: 'Anna Rodriguez',
      createdAt: new Date(),
      status: 'available'
    },
    {
      id: '6',
      title: 'Leather Boots',
      description: 'High-quality leather boots, perfect for fall and winter.',
      category: 'Shoes',
      size: '7',
      condition: 'good',
      images: ['https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400'],
      tags: ['leather', 'boots', 'winter'],
      pointsRequired: 50,
      ownerId: 'user6',
      ownerName: 'Tom Wilson',
      createdAt: new Date(),
      status: 'available'
    }
  ];

  useEffect(() => {
    loadItems();
  }, [filters]);

  const loadItems = async () => {
    setLoading(true);
    try {
      // In a real app, this would query Firestore
      // For now, we'll filter the mock data
      let filteredItems = [...mockItems];

      if (filters.category) {
        filteredItems = filteredItems.filter(item => 
          item.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

      if (filters.condition) {
        filteredItems = filteredItems.filter(item => item.condition === filters.condition);
      }

      if (filters.size) {
        filteredItems = filteredItems.filter(item => item.size === filters.size);
      }

      if (filters.minPoints) {
        filteredItems = filteredItems.filter(item => 
          item.pointsRequired >= parseInt(filters.minPoints)
        );
      }

      if (filters.maxPoints) {
        filteredItems = filteredItems.filter(item => 
          item.pointsRequired <= parseInt(filters.maxPoints)
        );
      }

      // Sort items
      switch (filters.sortBy) {
        case 'price-low':
          filteredItems.sort((a, b) => a.pointsRequired - b.pointsRequired);
          break;
        case 'price-high':
          filteredItems.sort((a, b) => b.pointsRequired - a.pointsRequired);
          break;
        case 'newest':
        default:
          filteredItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          break;
      }

      setItems(filteredItems);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      minPoints: '',
      maxPoints: '',
      size: '',
      sortBy: 'newest'
    });
    setSearchParams({});
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
            <p className="text-gray-600 mt-2">
              {items.length} items available for exchange
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-gray-600'} rounded-l-lg transition-colors`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-600'} rounded-r-lg transition-colors`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Condition
                  </label>
                  <select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Any Condition</option>
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Size
                  </label>
                  <select
                    value={filters.size}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Any Size</option>
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                {/* Points Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Points Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPoints}
                      onChange={(e) => handleFilterChange('minPoints', e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPoints}
                      onChange={(e) => handleFilterChange('maxPoints', e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Points: Low to High</option>
                    <option value="price-high">Points: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/item/${item.id}`}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden ${
                      viewMode === 'list' ? 'flex items-center space-x-4 p-4' : ''
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="aspect-square overflow-hidden relative">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          {item.featured && (
                            <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </div>
                          )}
                          <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                            <Heart className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-emerald-600 font-bold">
                              {item.pointsRequired} points
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getConditionColor(item.condition)}`}>
                              {item.condition}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Size {item.size}</span>
                            <span>by {item.ownerName}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-emerald-600 font-bold">
                              {item.pointsRequired} points
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(item.condition)}`}>
                              {item.condition}
                            </span>
                            <span className="text-gray-500">Size {item.size}</span>
                          </div>
                        </div>
                        <button className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                      </>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;