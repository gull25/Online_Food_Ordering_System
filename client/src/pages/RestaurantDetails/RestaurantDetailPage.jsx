import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import FoodCard from '../../components/ui/FoodCard/FoodCard';

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
];

const RestaurantDetailPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState({});
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

  // Cart operations
  const addToCart = (item) => {
    setCart((prevCart) => ({
      ...prevCart,
      [item.id]: {
        item,
        quantity: (prevCart[item.id]?.quantity || 0) + 1,
      },
    }));
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (!newCart[itemId]) return prevCart;
      if (newCart[itemId].quantity <= 1) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = {
          ...newCart[itemId],
          quantity: newCart[itemId].quantity - 1,
        };
      }
      return newCart;
    });
  };

  const totalCartCount = Object.values(cart).reduce((sum, entry) => sum + entry.quantity, 0);
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
      <header className="relative w-full h-[300px] md:h-[400px]">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full px-margin_mobile md:px-margin_desktop pb-stack_lg max-w-container_max mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-stack_md md:gap-gutter text-white relative z-10">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-16 bg-white overflow-hidden shadow-sm border border-surface-variant flex-shrink-0 flex items-center justify-center p-2">
              <img
                className="w-full h-full object-contain"
                alt="Bella Cucina Logo"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr_PgCupy8gxV-xkmlOvxOHL3--utxFavAEg7w4xpJdmfULAzkNMCU2XEJlw99GTagtpQARK95RNrYOtmOnzOUZPkSl6XY9xdJrEptavcuC56K-iuHnLviG1AI9cmZDfV9AFE7yCHJDorUtfmPiydbHfh8GagagsIUJh8raatKdm7B9K_T2arrM4xtwwckZBTCWKTPrv1tYLoXr5tKfv18y2VGSqRh2gVlttcHcAvFoiVpOy8bYyTuDA"
              />
            </div>
            {/* Details */}
            <div className="flex-1">
              <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-white mb-2">
                Bella Cucina Italiana
              </h1>
              <div className="flex items-center gap-3 flex-wrap text-surface-container-lowest font-body text-body opacity-90">
                <span className="flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-lg text-[#FFB59E]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>{' '}
                  4.8 (500+ ratings)
                </span>
                <span className="w-1 h-1 rounded-full bg-surface-container-lowest"></span>
                <span>$$$</span>
                <span className="w-1 h-1 rounded-full bg-surface-container-lowest"></span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">location_on</span> 123
                  Culinary Ave, Milano
                </span>
                <span className="w-1 h-1 rounded-full bg-surface-container-lowest"></span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">schedule</span> 30-45 min
                </span>
              </div>
            </div>
            {/* Actions */}
            <div className="hidden md:flex gap-3">
              <button
                onClick={handleShare}
                className="h-12 px-4 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center gap-2 hover:bg-white/30 transition-colors text-white text-sm font-semibold"
              >
                <span className="material-symbols-outlined text-white">share</span>
                {shareText}
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
                  isFavorite ? 'bg-primary-container text-white' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg grid grid-cols-1 md:grid-cols-12 gap-gutter relative">
        {/* Sidebar Categories (Desktop) */}
        <aside className="md:col-span-3 hidden md:block">
          <div className="sticky top-[100px] bg-surface-container-lowest rounded-16 p-stack_md border border-surface-variant shadow-sm">
            <h3 className="font-h3 text-h3 text-on-surface mb-stack_md">Categories</h3>
            <nav className="flex flex-col gap-2">
              {MENU_CATEGORIES.map((category) => {
                const count = categoryCounts[category.id] || 0;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => scrollToCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-12 transition-all font-button text-button flex justify-between items-center ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-on-surface hover:bg-surface-variant'
                    }`}
                  >
                    <span>
                      {category.name} {category.badge || ''}
                    </span>
                    {count > 0 ? (
                      <span
                        className={`font-label text-label px-2 py-1 rounded-full ${
                          isActive ? 'bg-primary text-white' : 'bg-surface text-on-surface-variant'
                        }`}
                      >
                        {count}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant font-small text-small">-</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

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
            <div className="md:hidden flex overflow-x-auto hide-scrollbar gap-2 pb-2">
              {MENU_CATEGORIES.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => scrollToCategory(category.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full font-button text-button border transition-all ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface-container-lowest border-surface-variant text-on-surface'
                    }`}
                  >
                    {category.name} {category.badge || ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Sections */}
          <div className="flex flex-col gap-stack_lg">
            {MENU_CATEGORIES.map((category) => {
              const categoryItems = itemsByCategory[category.id] || [];
              if (categoryItems.length === 0) {
                // If filtering hides all items, skip this section or show empty
                if (searchQuery.trim()) return null;

                // Otherwise, show standard category but with helper empty state
                return (
                  <section key={category.id} id={category.id} className="scroll-mt-24">
                    <h2 className="font-h2-mobile md:font-h2 text-h2-mobile md:text-h2 text-on-surface mb-stack_md">
                      {category.name} {category.badge || ''}
                    </h2>
                    <div className="bg-surface-container-lowest rounded-16 p-8 text-center border border-surface-variant">
                      <p className="text-secondary">No items available in this category currently.</p>
                    </div>
                  </section>
                );
              }

              return (
                <section key={category.id} id={category.id} className="scroll-mt-24">
                  <h2 className="font-h2-mobile md:font-h2 text-h2-mobile md:text-h2 text-on-surface mb-stack_md">
                    {category.name} {category.badge || ''}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack_md">
                    {categoryItems.map((item) => (
                      <FoodCard
                        key={item.id}
                        item={item}
                        cartQty={cart[item.id]?.quantity || 0}
                        onAdd={addToCart}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Empty search state */}
          {filteredItems.length === 0 && (
            <div className="bg-surface-container-lowest rounded-16 p-12 text-center border border-surface-variant mt-8">
              <span className="material-symbols-outlined text-4xl text-on-secondary-container mb-2">
                search_off
              </span>
              <h3 className="font-h3 text-h3 text-on-surface mb-2">No matching dishes found</h3>
              <p className="text-secondary max-w-md mx-auto">
                We couldn't find any dishes matching "{searchQuery}". Try checking the spelling or
                using different terms.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Summary */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-0 md:bottom-8 left-0 w-full px-margin_mobile md:px-0 md:flex md:justify-center z-50 pointer-events-none mb-4 md:mb-0">
          <div
            onClick={() => navigate('/checkout')}
            className="bg-inverse-surface dark:bg-surface-container-lowest text-on-primary dark:text-primary rounded-16 shadow-[0px_10px_30px_rgba(0,0,0,0.08)] p-4 flex items-center justify-between pointer-events-auto w-full md:w-[400px] hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary-container text-white w-10 h-10 rounded-full flex items-center justify-center font-button text-button animate-bounce">
                {totalCartCount}
              </div>
              <div className="max-w-[200px]">
                <div className="font-button text-button">View Cart</div>
                <div className="font-small text-small text-surface-variant/80 truncate">
                  {cartDescription}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-h3 text-h3 font-bold">€{totalCartPrice.toFixed(2)}</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;
