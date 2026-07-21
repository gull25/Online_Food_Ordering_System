import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import StatCard from './components/StatCard';

const INITIAL_RESTAURANTS = [
  {
    id: '#RE-4012',
    name: 'Artisan Pizza Co.',
    cuisine: 'Italian',
    location: 'Downtown District, NYC',
    rating: 4.9,
    status: 'Online',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8NbdeshpmXujgSsDJjZfyeJvp95VXx_eveBbHlaOrLZoAaaf3EaIfplAtYO7kUoiPTwt2aKdifaTw0Tq-1Zj97Jxo__-ja7x35D7s3mdWtPff3uesd0vAWgFN7_JphC45ffK3QTtZlPKZaxVv5V_4cJt7Ja86qyiAuygIWAwoeLWskASEPTymWL7hJHGmuLyPv04bNlftNIx4GteuBr-I6qVGyD3amjpvc0zFi0FGXQihVmufUnUeCQ',
  },
  {
    id: '#RE-4015',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    location: 'Upper East Side, NYC',
    rating: 4.7,
    status: 'Online',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcR2zgbbUBfVXC6dqpyWSN-mIkwc3HljtWIOC7HM_vJ52JA0fViK0WcnLn_rOYtDHv0tcsS2TBzJwTGYAFfsozowKLklqwQpDUcoVoFYynJ16gJCVafBj8e9Pt8cykhSJI58o_24VwljnFmNV9C5WoeMhssyjidqWr3loE8AQXJkNwQwquaatg8x5dNvjF6AzEfqKTLHP_A0w468VmARQVnPp3ToX5fOtj8oPZFlyLm5us8whFeZw8JQ',
  },
  {
    id: '#RE-4019',
    name: 'Green Garden Bowl',
    cuisine: 'Vegan',
    location: 'Brooklyn Heights, NY',
    rating: 4.5,
    status: 'Offline',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj2LfkE3Jm41j2kku2I9gW1IxAJrkR6xKRAcyX9oBLtI5Wte62kP1bBj1Uq3Pab5Y9VD8_M9MowNPbDSMg1UfdN2sqVhUmn1KMofnorGKvPMg2MV6mnC4Adbwoj-jnYb9lthoNMb7gWH4IlweE3tA53MVo34c4hXwKGwZpNxs8Xy2wOrknbIjey73TwarywZgWtA4n3O7RPMPTDwaH3XvC8eZ65QzT_3haU1D6RQ_IzG9FiiIeAP7rwA',
  },
  {
    id: '#RE-4022',
    name: 'The Burger Loft',
    cuisine: 'American',
    location: 'Chelsea District, NYC',
    rating: 4.8,
    status: 'Online',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmHrWO2B8oLuDopl61X1Yupiqu3GF4WkiEuDxLrZLPsLj8bRRwyGGFpsKzRpOVQXizPA5G19GvawhnZmLALVuyTfZDeFZe75yOAH2WaVC5dOeJU5DtEXouk44-eSI9Wslfg8bdB8jTjYDNRQiezalmmoYPmztEqNabPWv23zVHzNRNHF5_sEx2qBc6eA532QzHxGzbOVDvgMYJauX4yzALFqtTakPjFQJi9CqR8bfkRQjm7BpR0_twCA',
  },
  {
    id: '#RE-4023',
    name: 'Bella Cucina',
    cuisine: 'Italian',
    location: 'Soho, NYC',
    rating: 4.8,
    status: 'Online',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGetNiq5A-grFrT7P5I5ItEPizHW1mGULie2XmHLkiLuNgPAmg1jFNOfBVSWVDKqt6Vd_tXngWcGdxqjhqm8g5dyzRp60Pr2J-ZXPxKZUabbCxiyYeyt7R9vrRArTbFXHwNkFHvl8F2bvU7PHBrEbYPFaDWRGBa4L2xpAvjT0kwZLvKha1Xqx7wAUtAaiDWaVQaoxCqrI-Kq1CIAuq3fTfely5J6YiFEyFg9scGh4z7FC6YZddQm9bHg',
  },
  {
    id: '#RE-4024',
    name: 'Taco Fiesta',
    cuisine: 'Mexican',
    location: 'East Village, NYC',
    rating: 4.4,
    status: 'Online',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuliHJnZSMQjZuE_f6BUD7tiE5Ei5WF5GjhmSOI6dp1de7CXKNxtZhiCtYmcd5ecwzFqD0E4GxL1WkHo0V-1xNSj3L0u59fQsE-t_HwnBsvhR9gpE6g8a7OJYeZyklSzQx3p6U_tz8dqprouArg4Q6Za7wrJzUVUD5qpgM39Nm2hIgu4VuGW0I7hU7q1RWfcUc--T0KPQNn79QyIlsLYzYD-qGXLjM5NLX8B3c9eeoIe7gvg_SSlej6Q',
  },
  {
    id: '#RE-4025',
    name: 'Curry House',
    cuisine: 'Indian',
    location: 'Midtown, NYC',
    rating: 4.6,
    status: 'Offline',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7gJU-8rbue0Vlbkm503AErp26ySz58egKGLNlMFlIrl8mhla5my1u45sbyiw-chx_iOx4rE5LK2-0IWp23rKo-oBfmIm6s4xQxq--J4cfBy4Aj6NC8NXW_sVEIMvvxDdJEVChRswoV_019fIWZ8msurh_B5ZYRWXBB0oCBw1B8ImyIPI0Rd0KiTAT9BIh8cpRZi1vIRlyZNFydw8Bz-2oKHuiVagefrfHfi50_phbbxeyN8z_qsh5Nw',
  },
];

const ITEMS_PER_PAGE = 4;

const AdminRestaurantsPage = () => {
  const navigate = useNavigate();

  // Selected states
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State for adding new restaurant
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisineType, setCuisineType] = useState('Italian');
  const [restaurantLocation, setRestaurantLocation] = useState('');

  // Selected restaurant details for management drawer/modal
  const [managedRestaurant, setManagedRestaurant] = useState(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Add Restaurant form submission
  const handleAddRestaurant = (e) => {
    e.preventDefault();
    if (restaurantName.trim()) {
      const newId = `#RE-${Math.floor(4000 + Math.random() * 1000)}`;
      const newRestObj = {
        id: newId,
        name: restaurantName,
        cuisine: cuisineType,
        location: restaurantLocation || 'Downtown District, NYC',
        rating: 4.5,
        status: 'Online',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8NbdeshpmXujgSsDJjZfyeJvp95VXx_eveBbHlaOrLZoAaaf3EaIfplAtYO7kUoiPTwt2aKdifaTw0Tq-1Zj97Jxo__-ja7x35D7s3mdWtPff3uesd0vAWgFN7_JphC45ffK3QTtZlPKZaxVv5V_4cJt7Ja86qyiAuygIWAwoeLWskASEPTymWL7hJHGmuLyPv04bNlftNIx4GteuBr-I6qVGyD3amjpvc0zFi0FGXQihVmufUnUeCQ',
      };
      setRestaurants((prev) => [newRestObj, ...prev]);
      showToast(`Restaurant "${restaurantName}" successfully added!`);
      setIsModalOpen(false);
      setRestaurantName('');
      setRestaurantLocation('');
      setCurrentPage(1);
    }
  };

  // Toggle restaurant status
  const handleToggleStatus = (id) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'Online' ? 'Offline' : 'Online';
          showToast(`"${r.name}" is now ${nextStatus}`);
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
    if (managedRestaurant && managedRestaurant.id === id) {
      setManagedRestaurant((prev) => ({
        ...prev,
        status: prev.status === 'Online' ? 'Offline' : 'Online',
      }));
    }
  };

  // Onboarding verification batch simulation
  const handleStartVerification = () => {
    showToast('Starting verification batch... processing licenses...');
    setTimeout(() => {
      showToast('Verification batch completed! 12 restaurants verified.');
    }, 1500);
  };

  // Filters logic
  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return restaurants;
    return restaurants.filter(
      (r) =>
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [restaurants, searchQuery]);

  // Paginated list
  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRestaurants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRestaurants, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE) || 1;
  }, [filteredRestaurants]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = restaurants.length;
    const activeCount = restaurants.filter((r) => r.status === 'Online').length;
    const avgRating = (
      restaurants.reduce((sum, r) => sum + r.rating, 0) / total
    ).toFixed(1);

    return {
      total,
      activeCount,
      avgRating,
    };
  }, [restaurants]);

  return (
    <div className="bg-background text-on-background font-body min-h-screen relative flex">
      {/* CSS custom support styles */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>

      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[70] bg-inverse-surface text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined text-primary-fixed">info</span>
          <span className="font-button text-button text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Restaurant Add Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-gutter border border-outline-variant/30 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-h3 font-bold text-on-surface">Add New Restaurant</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-secondary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddRestaurant} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-secondary">Restaurant Name *</label>
                <input
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body text-body"
                  placeholder="e.g. Pizza Gourmet"
                  type="text"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-secondary">Cuisine Type *</label>
                <select
                  value={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body text-body"
                >
                  <option value="Italian">Italian</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Vegan">Vegan</option>
                  <option value="American">American</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Indian">Indian</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-secondary">Location *</label>
                <input
                  value={restaurantLocation}
                  onChange={(e) => setRestaurantLocation(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body text-body"
                  placeholder="e.g. Soho, NYC"
                  type="text"
                  required
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 rounded-xl border border-outline-variant/30 text-secondary font-button text-button hover:bg-surface-variant/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-primary text-white font-button text-button hover:opacity-90 transition-colors shadow-md"
                >
                  Add Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Managed Restaurant detail Drawer */}
      {managedRestaurant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-gutter border border-outline-variant/30 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-h3 font-bold text-on-surface">Manage Partner</h3>
              <button
                onClick={() => setManagedRestaurant(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-secondary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-variant flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt={managedRestaurant.name}
                    src={managedRestaurant.image}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-body text-on-surface">{managedRestaurant.name}</h4>
                  <p className="text-secondary text-small">{managedRestaurant.id}</p>
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-4 space-y-3">
                <div className="flex justify-between text-small">
                  <span className="text-secondary">Cuisine:</span>
                  <span className="font-bold">{managedRestaurant.cuisine}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-secondary">Location:</span>
                  <span className="font-bold text-right">{managedRestaurant.location}</span>
                </div>
                <div className="flex justify-between text-small">
                  <span className="text-secondary">Avg. Rating:</span>
                  <span className="font-bold text-primary">{managedRestaurant.rating} ★</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-secondary text-small">Operating Status:</span>
                  <button
                    onClick={() => handleToggleStatus(managedRestaurant.id)}
                    className={`px-4 py-1.5 rounded-full font-label text-[10px] uppercase font-bold cursor-pointer transition-colors ${
                      managedRestaurant.status === 'Online'
                        ? 'bg-tertiary/10 text-tertiary'
                        : 'bg-error/10 text-error'
                    }`}
                  >
                    {managedRestaurant.status} (Toggle)
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setManagedRestaurant(null)}
                className="w-full h-12 rounded-xl bg-secondary text-on-secondary font-button text-button hover:opacity-90 transition-colors shadow-sm"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Side Bar Shell */}
      <AdminSidebar setIsModalOpen={setIsModalOpen} activeTab="restaurants" />

      {/* Main Content Canvas */}
      <main className="ml-64 min-h-screen p-stack_lg bg-background flex-grow">
        
        {/* Header Section */}
        <AdminHeader 
          title="Restaurant Management"
          subtitle="Configure, monitor, and scale your restaurant partners."
          searchQuery={searchQuery}
          setSearchQuery={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          showToast={showToast}
          actions={
            <button
              onClick={() => setIsModalOpen(true)}
              className="h-12 px-6 bg-primary-container text-white font-button text-button rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-white">add</span>
              Add New Restaurant
            </button>
          }
        />

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack_lg">
          <StatCard
            icon="restaurant"
            colorClass="bg-primary-fixed"
            iconColorClass="text-primary"
            trendText="+4.2%"
            trendUp={true}
            title="Total Restaurants"
            value={stats.total}
          />
          <StatCard
            icon="bolt"
            colorClass="bg-secondary-fixed"
            iconColorClass="text-secondary"
            trendText="Live Now"
            trendUp={undefined}
            title="Active Now"
            value={stats.activeCount}
          />
          <StatCard
            icon="star"
            colorClass="bg-tertiary-fixed"
            iconColorClass="text-tertiary"
            trendText="Top 1%"
            trendUp={undefined}
            title="Avg. Rating"
            value={stats.avgRating}
          />
          <StatCard
            icon="trending_up"
            colorClass="bg-primary-fixed-dim"
            iconColorClass="text-primary-container"
            trendText="Growth"
            trendUp={undefined}
            title="Onboarding"
            value={Math.floor(stats.total * 0.1)}
          />
        </section>

        {/* Restaurant Data Table */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 font-label text-label text-on-secondary-container uppercase tracking-widest">
                    Restaurant
                  </th>
                  <th className="px-6 py-4 font-label text-label text-on-secondary-container uppercase tracking-widest">
                    Cuisine
                  </th>
                  <th className="px-6 py-4 font-label text-label text-on-secondary-container uppercase tracking-widest">
                    Location
                  </th>
                  <th className="px-6 py-4 font-label text-label text-on-secondary-container uppercase tracking-widest">
                    Rating
                  </th>
                  <th className="px-6 py-4 font-label text-label text-on-secondary-container uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 font-label text-label text-on-secondary-container uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {paginatedRestaurants.map((rest) => (
                  <tr key={rest.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-surface-container border border-outline-variant overflow-hidden shrink-0">
                          <img
                            className="w-full h-full object-cover"
                            alt={rest.name}
                            src={rest.image}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{rest.name}</p>
                          <p className="text-small text-on-secondary-container">{rest.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-surface-container text-on-secondary-container rounded-full text-xs font-semibold">
                        {rest.cuisine}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-small text-secondary">{rest.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="font-bold text-on-surface">{rest.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${rest.status === 'Online' ? 'bg-tertiary' : 'bg-error'}`}></div>
                        <span className={`text-small font-semibold ${rest.status === 'Online' ? 'text-tertiary' : 'text-error'}`}>
                          {rest.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setManagedRestaurant(rest)}
                        className="px-4 py-2 border border-outline-variant text-on-surface font-button text-small rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedRestaurants.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-secondary font-body">
                      No matching restaurants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <footer className="p-6 border-t border-outline-variant flex items-center justify-between bg-surface-container-low">
            <p className="text-small text-on-secondary-container">
              Showing <span className="font-bold">
                {filteredRestaurants.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredRestaurants.length)}
              </span> of {filteredRestaurants.length} restaurants
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-secondary hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold cursor-pointer transition-all ${
                    currentPage === pg
                      ? 'bg-primary-container text-white'
                      : 'border border-outline-variant text-secondary hover:bg-surface-container'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-secondary hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </footer>
        </section>

        {/* Secondary Info Section (Bento Style) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mt-stack_lg">
          <div className="lg:col-span-2 bg-inverse-surface text-on-primary p-stack_lg rounded-2xl relative overflow-hidden flex flex-col justify-end min-h-[300px]">
            <div className="relative z-10">
              <span className="font-label text-label uppercase tracking-widest text-primary-fixed mb-2 block font-semibold text-xs">
                System Alert
              </span>
              <h3 className="font-h3 text-h3 mb-4 font-bold text-white">Onboarding High Demand</h3>
              <p className="text-body max-w-lg mb-6 opacity-90 text-surface-variant">
                There are currently 12 new restaurants pending verification in the Downtown District.
                Priority processing is recommended to meet weekend demand.
              </p>
              <button
                onClick={handleStartVerification}
                className="bg-primary-container text-white px-6 py-3 rounded-xl font-button hover:scale-105 transition-transform cursor-pointer shadow-md"
              >
                Start Verification Batch
              </button>
            </div>
          </div>

          <div className="bg-surface-container-low p-stack_lg rounded-2xl border border-outline-variant flex flex-col">
            <h4 className="font-h3 text-h3 mb-6 font-bold">Quick Links</h4>
            <div className="space-y-stack_md">
              <button
                onClick={() => showToast('Downloading licensing templates...')}
                className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-primary-fixed transition-colors group w-full text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <span className="font-bold text-small text-on-surface">Licensing Templates</span>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={() => showToast('Opening partner newsletter archive...')}
                className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-primary-fixed transition-colors group w-full text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">campaign</span>
                  <span className="font-bold text-small text-on-surface">Partner Newsletter</span>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={() => showToast('Redirecting to Merchant Support line...')}
                className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-primary-fixed transition-colors group w-full text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">support_agent</span>
                  <span className="font-bold text-small text-on-surface">Merchant Support</span>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-stack_lg pt-stack_lg border-t border-outline-variant grid grid-cols-1 md:grid-cols-4 gap-gutter pb-10">
          <div className="md:col-span-2">
            <h3 className="font-h3 text-h3 text-primary-fixed mb-4 font-bold">Foodora</h3>
            <p className="text-secondary max-w-sm text-small">
              A premium digital concierge for the world's finest culinary experiences. Efficiently managing
              the ecosystem from end to end.
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-4 uppercase text-xs tracking-widest text-on-secondary-container">
              Admin Help
            </h5>
            <ul className="space-y-2 text-small text-secondary font-semibold">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Documentation
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Support Portal
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  API Keys
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4 uppercase text-xs tracking-widest text-on-secondary-container">
              Legal
            </h5>
            <ul className="space-y-2 text-small text-secondary font-semibold">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </footer>

        <div className="text-center py-6 text-xs text-secondary opacity-60">
          © 2024 Foodora Management Suite. All rights reserved. Build 1.4.2-stable.
        </div>
      </main>
    </div>
  );
};

export default AdminRestaurantsPage;
