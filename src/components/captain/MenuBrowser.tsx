/**
 * Menu Browser Component - WITH SPICE & RECOMMENDATIONS
 * Browse menu items by category with spice indicators and recommendations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faUtensils,
  faDrumstickBite,
  faBreadSlice,
  faFire,
  faGlassWater,
  faCakeCandles,
  faLeaf,
  faPlus,
  faPepperHot,
  faStar,
  faCrown,
} from '@fortawesome/free-solid-svg-icons';
import { MenuItem, MenuCategory } from '@/types';
import { cn, formatCurrency, debounce } from '@/lib/utils';
import menuApi from '@/lib/api/menu';
import toast from 'react-hot-toast';
import Loading from '@/components/common/Loading';

// ============================================
// TYPES
// ============================================

interface MenuBrowserProps {
  onAddItem: (item: MenuItem) => void;
}

// Category icons mapping
const categoryIcons: Record<string, any> = {
  chinese: faUtensils,
  punjabi: faDrumstickBite,
  roti: faBreadSlice,
  tandoor: faFire,
  drinks: faGlassWater,
  desserts: faCakeCandles,
  default: faUtensils,
};

// Spice level indicators
const spiceLevels = {
  mild: { icon: '🌶️', label: 'Mild', color: 'text-yellow-500' },
  regular: { icon: '🌶️', label: 'Regular', color: 'text-orange-500' },
  spicy: { icon: '🌶️🌶️', label: 'Spicy', color: 'text-red-500' },
  extra_spicy: { icon: '🌶️🌶️🌶️', label: 'Extra Spicy', color: 'text-red-600' },
};

// Recommendation badges
const recommendationTypes = {
  chef_special: { label: "Chef's Special", icon: faCrown, color: 'from-amber-500 to-amber-600' },
  spicy: { label: 'Spicy Favorite', icon: faPepperHot, color: 'from-red-500 to-red-600' },
  mild: { label: 'Mild Delight', icon: faStar, color: 'from-green-500 to-green-600' },
  regular: { label: 'Popular Choice', icon: faStar, color: 'from-blue-500 to-blue-600' },
  tangy: { label: 'Tangy Twist', icon: faStar, color: 'from-orange-500 to-orange-600' },
};

// ============================================
// COMPONENT
// ============================================

export default function MenuBrowser({ onAddItem }: MenuBrowserProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Fetch categories and items on mount
  useEffect(() => {
    fetchMenuData();
  }, []);

  // Filter items when category or search changes
  useEffect(() => {
    filterItems();
  }, [selectedCategory, searchQuery, allItems, showRecommendations]);

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchMenuData = async () => {
    try {
      setIsLoading(true);
      
      const [categoriesResponse, itemsResponse] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getAllMenuItems(),
      ]);

      // Extract arrays from responses
      let categoriesData: MenuCategory[] = [];
      let itemsData: MenuItem[] = [];

      // Extract categories array
      if (Array.isArray(categoriesResponse)) {
        categoriesData = categoriesResponse;
      } else if (categoriesResponse?.categories && Array.isArray(categoriesResponse.categories)) {
        categoriesData = categoriesResponse.categories;
      } else if (categoriesResponse?.data?.categories && Array.isArray(categoriesResponse.data.categories)) {
        categoriesData = categoriesResponse.data.categories;
      } else if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
        categoriesData = categoriesResponse.data;
      }

      // Extract items array
      if (Array.isArray(itemsResponse)) {
        itemsData = itemsResponse;
      } else if (itemsResponse?.items && Array.isArray(itemsResponse.items)) {
        itemsData = itemsResponse.items;
      } else if (itemsResponse?.data?.items && Array.isArray(itemsResponse.data.items)) {
        itemsData = itemsResponse.data.items;
      } else if (itemsResponse?.data && Array.isArray(itemsResponse.data)) {
        itemsData = itemsResponse.data;
      }

      setCategories(categoriesData);
      setAllItems(itemsData);

      // Select first category by default
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].category_id);
      }
    } catch (error) {
      toast.error('Failed to load menu data');
      console.error('Error fetching menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // FILTERING
  // ============================================

  const filterItems = () => {
    let items = [...allItems];

    // Show recommendations
    if (showRecommendations) {
      items = items.filter((item) => item.is_recommended);
    } else if (selectedCategory) {
      // Filter by category
      items = items.filter((item) => item.category_id === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) =>
        item.item_name.toLowerCase().includes(query)
      );
    }

    // Filter only available items
    items = items.filter((item) => item.is_available);

    setFilteredItems(items);
  };

  // Debounced search handler
  const handleSearch = debounce((query: string) => {
    setSearchQuery(query);
  }, 300);

  // Get recommended items count
  const recommendedCount = allItems.filter(item => item.is_recommended).length;

  // ============================================
  // RENDER
  // ============================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" text="Loading menu..." />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground mb-2">
            No menu categories available
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact administrator
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5"
          />
          <input
            type="text"
            placeholder="Search menu items..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories + Recommendations Toggle */}
      <div className="mb-6 space-y-3">
        {/* Recommendations Button */}
        {recommendedCount > 0 && (
          <button
            onClick={() => {
              setShowRecommendations(!showRecommendations);
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className={cn(
              'w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all shadow-md',
              showRecommendations
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white scale-105'
                : 'bg-card hover:bg-muted text-foreground border-2 border-amber-500/30'
            )}
          >
            <FontAwesomeIcon icon={faStar} className="h-5 w-5" />
            <span>Our Recommendations</span>
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
              {recommendedCount}
            </span>
          </button>
        )}

        {/* Category Tabs */}
        <div className="overflow-x-auto scrollbar-thin">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.category_id}
                onClick={() => {
                  setSelectedCategory(category.category_id);
                  setShowRecommendations(false);
                  setSearchQuery('');
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap',
                  !showRecommendations && selectedCategory === category.category_id
                    ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-md'
                    : 'bg-card hover:bg-muted text-foreground'
                )}
              >
                <FontAwesomeIcon
                  icon={categoryIcons[category.category_name.toLowerCase()] || categoryIcons.default}
                  className="h-4 w-4"
                />
                <span>{category.category_name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Section Header */}
        {showRecommendations && (
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FontAwesomeIcon icon={faStar} className="text-amber-500" />
              Our Recommendations
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Handpicked favorites from our menu
            </p>
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.item_id} item={item} onAdd={onAddItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MENU ITEM CARD
// ============================================

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    onAdd(item);
    setIsAdding(false);
    toast.success(`${item.item_name} added to cart`);
  };

  const spiceInfo = item.is_spicy && item.spice_level ? spiceLevels[item.spice_level as keyof typeof spiceLevels] : null;
  const recommendationInfo = item.is_recommended && item.recommendation_type 
    ? recommendationTypes[item.recommendation_type as keyof typeof recommendationTypes] 
    : null;

  return (
    <button
      onClick={handleAdd}
      disabled={isAdding || !item.is_available}
      className={cn(
        'card p-4 text-left transition-all hover:shadow-lg hover:scale-105 relative',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        isAdding && 'scale-95'
      )}
    >
      {/* Recommendation Badge */}
      {recommendationInfo && (
        <div className={cn(
          'absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white',
          'bg-gradient-to-r shadow-md flex items-center gap-1',
          recommendationInfo.color
        )}>
          <FontAwesomeIcon icon={recommendationInfo.icon} className="h-3 w-3" />
          <span>{recommendationInfo.label}</span>
        </div>
      )}

      {/* Spice Indicator */}
      {spiceInfo && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded-full text-xs font-bold text-white backdrop-blur-sm">
          {spiceInfo.icon}
        </div>
      )}

      <div className="flex justify-between items-start mb-2 mt-8">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{item.item_name}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {item.description}
            </p>
          )}
        </div>
        <div className="ml-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faPlus} className="text-primary h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(item.price)}</p>
          {item.preparation_time && (
            <p className="text-xs text-muted-foreground">{item.preparation_time} mins</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.is_vegetarian && (
            <div className="w-6 h-6 border-2 border-green-500 rounded flex items-center justify-center">
              <FontAwesomeIcon icon={faLeaf} className="text-green-500 h-3 w-3" />
            </div>
          )}
          {!item.is_available && (
            <span className="text-xs text-red-500 font-medium">Out of Stock</span>
          )}
        </div>
      </div>
    </button>
  );
}