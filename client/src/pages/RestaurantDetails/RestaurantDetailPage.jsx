import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import FoodCard from '../../components/ui/FoodCard/FoodCard';
import RestaurantHeader from './components/RestaurantHeader';
import CategorySidebar from './components/CategorySidebar';
import MobileCategoryNav from './components/MobileCategoryNav';
import MenuSection from './components/MenuSection';
import FloatingCartSummary from './components/FloatingCartSummary';
import ReviewsSection from './components/ReviewsSection';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart } from '../../features/cart/cartSlice';

import { fetchRestaurantDetails } from '../../features/restaurants/restaurantSlice';
import { fetchRestaurantMenu } from '../../features/menu/menuSlice';

const RestaurantDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  
  const { currentRestaurant, loading: restaurantLoading } = useSelector((state) => state.restaurants);
  const { items: menuItems, loading: menuLoading } = useSelector((state) => state.menu);
  const { items: cart, totalQuantity: totalCartCount } = useSelector((state) => state.cart);

  const handleAddToCart = useCallback((item) => dispatch(addToCart(item)), [dispatch]);
  const handleRemoveFromCart = useCallback((itemId) => dispatch(removeFromCart(itemId)), [dispatch]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareText, setShareText] = useState('Share');

  React.useEffect(() => {
    if (id) {
      dispatch(fetchRestaurantDetails(id));
      dispatch(fetchRestaurantMenu(id));
    }
  }, [dispatch, id]);

  const dynamicCategories = useMemo(() => {
    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) return [];
    const cats = new Set(menuItems.map(item => item.category));
    return Array.from(cats).map(cat => ({
      id: cat?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
      name: cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Unknown',
      count: 0
    }));
  }, [menuItems]);

  const [activeCategory, setActiveCategory] = useState('');
  
  React.useEffect(() => {
    if (dynamicCategories.length > 0 && !activeCategory) {
      setActiveCategory(dynamicCategories[0].id);
    }
  }, [dynamicCategories, activeCategory]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!menuItems || !Array.isArray(menuItems)) return [];
    if (!searchQuery.trim()) return menuItems;
    return menuItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, menuItems]);

  // Group items by category for rendering
  const itemsByCategory = useMemo(() => {
    const groups = {};
    if (!Array.isArray(filteredItems)) return groups;
    filteredItems.forEach((item) => {
      const catId = item.category?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
      if (!groups[catId]) {
        groups[catId] = [];
      }
      groups[catId].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Calculate dynamic count for sidebar badges
  const categoryCounts = useMemo(() => {
    if (!menuItems) return {};
    const counts = {};
    dynamicCategories.forEach((cat) => {
      counts[cat.id] = menuItems.filter((item) => item.category.toLowerCase().replace(/\s+/g, '-') === cat.id).length;
    });
    return counts;
  }, [dynamicCategories, menuItems]);

  const totalCartPrice = Object.values(cart).reduce(
    (sum, entry) => sum + entry.item.price * entry.quantity,
    0
  );

  const cartDescription = Object.values(cart)
    .map((entry) => `${entry.item.name} (x${entry.quantity})`)
    .join(', ');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareText('Copied!');
    setTimeout(() => setShareText('Share'), 2000);
  };

  const scrollToCategory = (id) => {
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // offset for sticky navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="font-body text-body bg-background antialiased relative min-h-screen">
      <TopNavBar />

      {/* Header Section */}
      <RestaurantHeader 
        handleShare={handleShare}
        shareText={shareText}
        isFavorite={isFavorite}
        setIsFavorite={setIsFavorite}
        restaurant={currentRestaurant}
        loading={restaurantLoading}
      />

      {/* Main Content */}
      <main className="max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg grid grid-cols-1 md:grid-cols-12 gap-gutter relative">
        {/* Sidebar Categories (Desktop) */}
        <CategorySidebar 
          MENU_CATEGORIES={dynamicCategories}
          categoryCounts={categoryCounts}
          activeCategory={activeCategory}
          scrollToCategory={scrollToCategory}
        />

        {/* Menu Items Content */}
        <div className="md:col-span-9 pb-24 md:pb-0">
          {/* Search & Mobile Categories */}
          <div className="mb-stack_lg">
            <div className="relative mb-stack_md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-secondary-container">
                search
              </span>
              <input
                className="w-full h-12 pl-12 pr-4 rounded-12 border border-surface-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body text-body transition-shadow"
                placeholder="Search in this menu..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile Categories Scrollbar */}
            <MobileCategoryNav 
              MENU_CATEGORIES={dynamicCategories}
              activeCategory={activeCategory}
              scrollToCategory={scrollToCategory}
            />
          </div>

          {/* Menu Sections & Empty State */}
          {menuLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 w-48 bg-surface-variant rounded-md mb-4"></div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-32 bg-surface-container rounded-xl w-full"></div>
                    <div className="h-32 bg-surface-container rounded-xl w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (!menuItems || menuItems.length === 0) ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-6xl text-surface-variant mb-4">menu_book</span>
              <h3 className="text-h3 font-h3 mb-2 text-on-surface">Menu Unavailable</h3>
              <p className="text-body font-body text-secondary max-w-md mx-auto">This restaurant hasn't added any menu items yet or is currently updating their offerings.</p>
            </div>
          ) : (
            <MenuSection 
              MENU_CATEGORIES={dynamicCategories}
              itemsByCategory={itemsByCategory}
              searchQuery={searchQuery}
              cart={cart}
              addToCart={handleAddToCart}
              removeFromCart={handleRemoveFromCart}
              filteredItems={filteredItems}
            />
          )}

          {/* Customer Reviews */}
          <ReviewsSection restaurantId={id} />
        </div>
      </main>

      {/* Floating Cart Summary */}
      <FloatingCartSummary 
        totalCartCount={totalCartCount}
        cartDescription={cartDescription}
        totalCartPrice={totalCartPrice}
      />

      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;
