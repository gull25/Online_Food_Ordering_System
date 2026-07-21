import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import FoodCard from '../../components/ui/FoodCard/FoodCard';
import RestaurantHeader from './components/RestaurantHeader';
import CategorySidebar from './components/CategorySidebar';
import MobileCategoryNav from './components/MobileCategoryNav';
import MenuSection from './components/MenuSection';
import FloatingCartSummary from './components/FloatingCartSummary';
import { useCart } from '../../context/CartContext';

// Clean data representation of the menu
const MENU_CATEGORIES = [
  { id: 'popular', name: 'Popular', badge: '🔥', count: 2 },
  { id: 'starters', name: 'Starters', count: 0 }, // Placeholder for extra categories in HTML
  { id: 'pizza', name: 'Artisan Pizza', count: 2 },
  { id: 'pasta', name: 'Fresh Pasta', count: 0 },
  { id: 'mains', name: 'Mains', count: 0 },
  { id: 'desserts', name: 'Desserts', count: 0 },
  { id: 'drinks', name: 'Drinks', count: 0 },
];

const MENU_ITEMS = [
  {
    id: 'margherita',
    name: 'Classic Margherita',
    price: 14.00,
    description: 'San Marzano tomato sauce, fresh mozzarella di bufala, basil, extra virgin olive oil.',
    category: 'popular',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGetNiq5A-grFrT7P5I5ItEPizHW1mGULie2XmHLkiLuNgPAmg1jFNOfBVSWVDKqt6Vd_tXngWcGdxqjhqm8g5dyzRp60Pr2J-ZXPxKZUabbCxiyYeyt7R9vrRArTbFXHwNkFHvl8F2bvU7PHBrEbYPFaDWRGBa4L2xpAvjT0kwZLvKha1Xqx7wAUtAaiDWaVQaoxCqrI-Kq1CIAuq3fTfely5J6YiFEyFg9scGh4z7FC6YZddQm9bHg',
    tag: 'Vegetarian',
    rating: '98%',
  },
  {
    id: 'tagliatelle',
    name: 'Truffle Tagliatelle',
    price: 22.50,
    description: 'Handmade ribbon pasta tossed in a rich black truffle cream sauce with aged parmesan.',
    category: 'popular',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWyx19xORr0olvqzkpTOsgj1iCtHpfVD6vQz6JjlpREeTRggobJ44I1ABbhSpEH8VA93PLjnGUl0b2bQ7UQ0tuSFRmi48daAosRpeVsSqY114lW-UjQLtA2xLD18aM0-lI7cn_2L_o3P6gNa2_s6rm2vq-sVhKPxRp2bnvC6Sgk25b5JgdXUf1vwknxxIXAwUSQwS_N6nZdvChZaxPRCOB8HpW-zpXy58m8yU2FpCMfgJvR6SLFexmqQ',
    tag: "Chef's Pick",
  },
  {
    id: 'diavola',
    name: 'Diavola Piccante',
    price: 16.00,
    description: 'Spicy Calabrian salami, tomato sauce, mozzarella, chili oil, and fresh oregano.',
    category: 'pizza',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzYoO7cJRdYgaffgylzFH4EU34H3IYqrCsRpljeUN-cp6nxiQ7h806nQQWdUCNbFulfZA1Zvy_n2-EJtiN-HZTSTBy3mqr0nf5iqnwaWNXwyt6YtF2ijqO5f5mUNMrZlR9EwL1O1E3ncdRJ83OZERKdfgjLGAeltHz8Mg_tbqj1ArTHGKGkD-R_CAYqmk44-NDuPHKsPaCbWkmP157cmTWxuoaWAeb3eUNIA7qbKMu-CCbzp-J2vJlew',
    tag: 'Spicy',
  },
  {
    id: 'quattro',
    name: 'Quattro Formaggi',
    price: 18.50,
    description: 'Mozzarella, gorgonzola, fontina, and parmesan cheese on a white base, finished with truffle honey.',
    category: 'pizza',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuliHJnZSMQjZuE_f6BUD7tiE5Ei5WF5GjhmSOI6dp1de7CXKNxtZhiCtYmcd5ecwzFqD0E4GxL1WkHo0V-1xNSj3L0u59fQsE-t_HwnBsvhR9gpE6g8a7OJYeZyklSzQx3p6U_tz8dqprouArg4Q6Za7wrJzUVUD5qpgM39Nm2hIgu4VuGW0I7hU7q1RWfcUc--T0KPQNn79QyIlsLYzYD-qGXLjM5NLX8B3c9eeoIe7gvg_SSlej6Q',
    tag: 'Vegetarian',
  },
  {
    id: 'garlic_bread',
    name: 'Garlic Bread',
    price: 6.50,
    description: 'Freshly baked ciabatta bread topped with garlic butter and parsley.',
    category: 'starters',
    image: '/garlic_bread.png',
    tag: 'Vegetarian',
  },
  {
    id: 'bruschetta',
    name: 'Tomato Bruschetta',
    price: 8.00,
    description: 'Toasted bread topped with fresh tomatoes, basil, garlic, and balsamic glaze.',
    category: 'starters',
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=1000&q=80',
    tag: 'Vegan',
  },
  {
    id: 'carbonara',
    name: 'Spaghetti Carbonara',
    price: 16.50,
    description: 'Traditional Roman pasta dish with pancetta, egg yolk, pecorino cheese, and black pepper.',
    category: 'pasta',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1000&q=80',
    tag: 'Popular',
  },
  {
    id: 'arrabbiata',
    name: 'Penne Arrabbiata',
    price: 14.50,
    description: 'Penne pasta in a spicy tomato sauce with garlic and fresh parsley.',
    category: 'pasta',
    image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1000&q=80',
    tag: 'Spicy',
  },
  {
    id: 'chicken_parm',
    name: 'Chicken Parmesan',
    price: 24.00,
    description: 'Breaded chicken breast topped with marinara sauce and melted mozzarella, served with a side of spaghetti.',
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'salmon',
    name: 'Grilled Salmon',
    price: 26.50,
    description: 'Fresh grilled salmon fillet served with roasted asparagus and lemon butter sauce.',
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=1000&q=80',
    tag: 'Healthy',
  },
  {
    id: 'tiramisu',
    name: 'Classic Tiramisu',
    price: 9.00,
    description: 'Espresso-soaked ladyfingers layered with mascarpone cream and dusted with cocoa powder.',
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=1000&q=80',
    tag: 'Sweet',
  },
  {
    id: 'panna_cotta',
    name: 'Vanilla Panna Cotta',
    price: 8.50,
    description: 'Creamy vanilla dessert served with a mixed berry coulis.',
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'italian_soda',
    name: 'Italian Soda',
    price: 4.50,
    description: 'Refreshing sparkling water with a choice of raspberry, peach, or lemon syrup.',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'espresso',
    name: 'Espresso',
    price: 3.50,
    description: 'Rich and bold single shot of Italian espresso.',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=1000&q=80',
  }
];

const RestaurantDetailPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, addToCart, removeFromCart, totalItems: totalCartCount } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareText, setShareText] = useState('Share');
  const [activeCategory, setActiveCategory] = useState('popular');

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return MENU_ITEMS;
    return MENU_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Group items by category for rendering
  const itemsByCategory = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Calculate dynamic count for sidebar badges
  const categoryCounts = useMemo(() => {
    const counts = {};
    MENU_CATEGORIES.forEach((cat) => {
      counts[cat.id] = MENU_ITEMS.filter((item) => item.category === cat.id).length;
    });
    return counts;
  }, []);

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
      />

      {/* Main Content */}
      <main className="max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg grid grid-cols-1 md:grid-cols-12 gap-gutter relative">
        {/* Sidebar Categories (Desktop) */}
        <CategorySidebar 
          MENU_CATEGORIES={MENU_CATEGORIES}
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
              MENU_CATEGORIES={MENU_CATEGORIES}
              activeCategory={activeCategory}
              scrollToCategory={scrollToCategory}
            />
          </div>

          {/* Menu Sections & Empty State */}
          <MenuSection 
            MENU_CATEGORIES={MENU_CATEGORIES}
            itemsByCategory={itemsByCategory}
            searchQuery={searchQuery}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            filteredItems={filteredItems}
          />
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
