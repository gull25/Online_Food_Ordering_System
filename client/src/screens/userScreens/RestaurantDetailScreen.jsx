import React, { useState, useMemo, useCallback } from 'react';
import Icon from '../../components/common/Icon';
import { useNavigate, useParams } from 'react-router-dom';

import RestaurantHeader from '../../components/homeScreen/restaurantDetailComponents/RestaurantHeader';
import CategorySidebar from '../../components/homeScreen/restaurantDetailComponents/CategorySidebar';
import MobileCategoryNav from '../../components/homeScreen/restaurantDetailComponents/MobileCategoryNav';
import MenuSection from '../../components/homeScreen/restaurantDetailComponents/MenuSection';
import FloatingCartSummary from '../../components/homeScreen/restaurantDetailComponents/FloatingCartSummary';
import ReviewsSection from '../../components/homeScreen/restaurantDetailComponents/ReviewsSection';
import RestaurantErrorFallback from '../../components/homeScreen/restaurantDetailComponents/RestaurantErrorFallback';
import MenuSearchBar from '../../components/homeScreen/restaurantDetailComponents/MenuSearchBar';
import MenuEmptyState from '../../components/homeScreen/restaurantDetailComponents/MenuEmptyState';
import { useSelector, useDispatch } from 'react-redux';
import { useDebounce } from '../../helper/useDebounce';
import { addToCart, removeFromCart, resolveRestaurantId } from '../../redux/cartSlice';
import { toggleFavoriteThunk } from '../../redux/wishlistSlice';
import { toast } from 'react-hot-toast';

import { fetchRestaurantDetails, clearCurrentRestaurant } from '../../redux/restaurantSlice';
import { fetchRestaurantMenu, clearMenu } from '../../redux/menuSlice';
import api from '../../api/axios';
import { MenuSectionSkeleton } from '../../components/common/Skeleton';
import { APP_ROUTES } from '../../constants';

const RestaurantDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const dispatch = useDispatch();

  const { currentRestaurant, detailLoading: restaurantLoading, detailError } = useSelector((state) => state.restaurants);
  const { items: menuItems, loading: menuLoading } = useSelector((state) => state.menu);
  const { items: cart, totalQuantity: totalCartCount, restaurantId: cartRestaurantId } = useSelector((state) => state.cart);
  const favorites = useSelector((state) => state.wishlist.items);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleAddToCart = useCallback((item) => {
    const itemRestId = resolveRestaurantId(item);
    if (cartRestaurantId && itemRestId && cartRestaurantId !== itemRestId) {
      toast.error('Your cart contains items from another restaurant. Please clear your cart first.');
      return;
    }
    dispatch(addToCart(item));
    toast.success(`${item.name} added to cart`, { id: `cart-${item._id}` });
  }, [dispatch, cartRestaurantId]);

  const handleRemoveFromCart = useCallback((itemId) => dispatch(removeFromCart(itemId)), [dispatch]);

  const isFavorite = Array.isArray(favorites) && favorites.includes(id);
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add favorites');
      return;
    }
    dispatch(toggleFavoriteThunk(id));
  };
  const [shareText, setShareText] = useState('Share');

  const [categories, setCategories] = useState([]);

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;

    dispatch(fetchRestaurantDetails(id));
    dispatch(fetchRestaurantMenu(id));

    api
      .get(`/categories/restaurant/${id}`)
      .then((res) => {
        if (cancelled) return;
        const sortedCats = (res.data.data || [])
          .filter((c) => c.isActive)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((cat) => ({ id: cat._id, name: cat.name, order: cat.order || 0 }));
        setCategories(sortedCats);
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to fetch categories', err);
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, id]);

  // Drop cached restaurant/menu on unmount so the next restaurant page starts
  // from a clean slate rather than briefly rendering the previous one's menu.
  React.useEffect(
    () => () => {
      dispatch(clearCurrentRestaurant());
      dispatch(clearMenu());
    },
    [dispatch]
  );

  const dynamicCategories = categories;

  const [activeCategory, setActiveCategory] = useState('');

  // Reset the highlighted category whenever the restaurant changes, then
  // default to its first category once they load.
  React.useEffect(() => {
    setActiveCategory('');
  }, [id]);

  React.useEffect(() => {
    if (dynamicCategories.length > 0 && !activeCategory) {
      setActiveCategory(dynamicCategories[0].id);
    }
  }, [dynamicCategories, activeCategory]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!menuItems || !Array.isArray(menuItems)) return [];
    if (!debouncedSearchQuery.trim()) return menuItems;
    return menuItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [debouncedSearchQuery, menuItems]);

  // Group items by category for rendering
  const itemsByCategory = useMemo(() => {
    const groups = {};
    if (!Array.isArray(filteredItems)) return groups;
    filteredItems.forEach((item) => {
      const catId = item.category?._id || 'unknown';
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
      counts[cat.id] = menuItems.filter((item) => item.category?._id === cat.id).length;
    });
    return counts;
  }, [dynamicCategories, menuItems]);

  const totalCartPrice = useMemo(
    () =>
      Object.values(cart).reduce((sum, entry) => {
        const item = entry.item;
        const itemPrice =
          Number(item.price || 0) +
          Number(item.selectedSize?.additionalPrice || 0) +
          (item.selectedAddOns?.reduce((s, a) => s + Number(a.price || 0), 0) || 0);
        return sum + itemPrice * entry.quantity;
      }, 0),
    [cart]
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

  // A bad/stale restaurant id previously rendered an endless shell of empty
  // sections. Surface it explicitly with a way back.
  if (detailError && !restaurantLoading && !currentRestaurant) {
    return <RestaurantErrorFallback detailError={detailError} />;
  }

  return (
    <div className="font-body text-body bg-background antialiased relative min-h-screen">


      {/* Header Section */}
      <RestaurantHeader
        handleShare={handleShare}
        shareText={shareText}
        isFavorite={isFavorite}
        setIsFavorite={handleToggleFavorite}
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
            <MenuSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {/* Mobile Categories Scrollbar */}
            <MobileCategoryNav
              MENU_CATEGORIES={dynamicCategories}
              activeCategory={activeCategory}
              scrollToCategory={scrollToCategory}
            />
          </div>

          {/* Menu Sections & Empty State */}
          {menuLoading ? (
            <MenuSectionSkeleton sections={2} itemsPerSection={4} />
          ) : (!menuItems || menuItems.length === 0) ? (
            <MenuEmptyState />
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

          </div>
  );
};

export default RestaurantDetailPage;
