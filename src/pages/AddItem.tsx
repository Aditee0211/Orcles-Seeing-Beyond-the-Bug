import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Upload, X, Plus, Camera } from 'lucide-react';
import { itemService, sessionManager } from '../lib/appsScriptService';
import { useAuth } from '../contexts/AuthContext';

const schema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  category: yup.string().required('Category is required'),
  size: yup.string().required('Size is required'),
  condition: yup.string().required('Condition is required').oneOf(['excellent', 'good', 'fair'], 'Invalid condition'),
  pointsRequired: yup.number().required('Points are required').min(1, 'Points must be at least 1').max(200, 'Points cannot exceed 200'),
  tags: yup.string().optional()
});

interface FormData {
  title: string;
  description: string;
  category: string;
  size: string;
  condition: 'excellent' | 'good' | 'fair';
  pointsRequired: number;
  tags: string;
}

const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      pointsRequired: 25
    }
  });

  const categories = [
    'Tops', 'Dresses', 'Pants', 'Shoes', 'Accessories', 'Outerwear', 'Activewear', 'Formal'
  ];

  const sizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12', 'One Size'
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent', description: 'Like new, no visible wear' },
    { value: 'good', label: 'Good', description: 'Minor signs of wear, well maintained' },
    { value: 'fair', label: 'Fair', description: 'Noticeable wear but still functional' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      alert('You can upload a maximum of 5 images');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const newPreviews = [...imagePreviews];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const uploadImages = async (): Promise<string[]> => {
    // For now, we'll use placeholder URLs
    // In a real implementation, you'd upload to Google Drive or another service
    return images.map((_, index) => `https://via.placeholder.com/400x400?text=Image+${index + 1}`);
  };

  const onSubmit = async (data: FormData) => {
    const session = sessionManager.getSession();
    if (!session) {
      alert('You must be logged in to add an item');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images (placeholder implementation)
      const imageUrls = await uploadImages();

      // Process tags
      const tags = data.tags
        ? data.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag)
        : [];

      // Create item using Google Apps Script
      const result = await itemService.addItem(session.sessionToken, {
        title: data.title,
        description: data.description,
        category: data.category,
        size: data.size,
        condition: data.condition as 'excellent' | 'good' | 'fair',
        pointsRequired: data.pointsRequired,
        tags: tags.join(','),
        images: imageUrls
      });

      alert('Item added successfully!');
      navigate(`/item/${result.itemId}`);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pointsValue = watch('pointsRequired');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Item</h1>
            <p className="text-gray-600">
              Share your clothing items with the ReWear community and earn points
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Photos ({images.length}/5)
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {images.length === 0 && (
                <p className="text-sm text-red-600 mt-2">At least one photo is required</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g., Vintage Denim Jacket"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category')}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                )}
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size *
                </label>
                <select
                  {...register('size')}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a size</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                {errors.size && (
                  <p className="text-sm text-red-600 mt-1">{errors.size.message}</p>
                )}
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Required *
                </label>
                <input
                  {...register('pointsRequired')}
                  type="number"
                  min="1"
                  max="200"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <div className="mt-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Suggested: 15-50 points</span>
                    <span className="font-medium text-emerald-600">
                      {pointsValue} points
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${Math.min((pointsValue / 200) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                {errors.pointsRequired && (
                  <p className="text-sm text-red-600 mt-1">{errors.pointsRequired.message}</p>
                )}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Condition *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {conditions.map((condition) => (
                  <label
                    key={condition.value}
                    className="relative border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-emerald-500 transition-colors"
                  >
                    <input
                      {...register('condition')}
                      type="radio"
                      value={condition.value}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{condition.label}</span>
                      <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{condition.description}</p>
                  </label>
                ))}
              </div>
              {errors.condition && (
                <p className="text-sm text-red-600 mt-2">{errors.condition.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe your item in detail. Include brand, material, fit, and any special features..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <input
                {...register('tags')}
                type="text"
                placeholder="vintage, designer, casual, summer (separate with commas)"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Add tags to help others find your item
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-6 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-6 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Adding Item...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;