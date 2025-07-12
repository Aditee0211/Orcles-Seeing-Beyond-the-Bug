import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, Heart, Star } from 'lucide-react';
import { ClothingItem } from '../types';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPoints: '',
    maxPoints: '',
    size: '',
    sortBy: 'relevance'
  });

  // Mock search results
  const mockResults: ClothingItem[] = [
    {
      id: '1',
      title: 'Vintage Denim Jacket',
      description: 'Classic vintage denim jacket in excellent condition.',
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
      description: 'Beautiful floral print dress for summer occasions.',
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
    }
  ];

  useEffect(() => {
    performSearch();
  }, [query, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // In a real app, this would be a Firestore query
      // For now, we'll filter mock data based on the search query
      let filteredResults = mockResults;

      if (query) {
        filteredResults = filteredResults.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }

      // Apply additional filters
      if (filters.category) {
        filteredResults = filteredResults.filter(item => item.category === filters.category);
      }

      if (filters.condition) {
        filteredResults = filteredResults.filter(item => item.condition === filters.condition);
      }

      if (filters.size) {
        filteredResults = filteredResults.filter(item => item.size === filters.size);
      }

      if (filters.minPoints) {
        filteredResults = filteredResults.filter(item => item.pointsRequired >= parseInt(filters.minPoints));
      }

      if (filters.maxPoints) {
        filteredResults = filteredResults.filter(item => item.pointsRequired <= parseInt(filters.maxPoints));
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
            {query && (
              <span className="text-emerald-600"> for "{query}"</span>
            )}
          </h1>
          <p className="text-gray-600">
            {loading ? 'Searching...' : `${results.length} items found`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              {query 
                ? `No items match your search for "${query}"`
                : 'Try searching for clothing items, brands, or categories'
              }
            </p>
            <Link
              to="/browse"
              className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Browse All Items
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((item) => (
              <Link
                key={item.id}
                to={`/item/${item.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
              >
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;