import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const INITIAL_REST_DATA = {
  'The Golden Truffle Bistro': {
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqUPeQHGqIVqUY70C_tkk1jB2sGMs5YCA8a7HI1UjNnko7tIqsvD88m1CCCs91hNVRXXiufbwYW2_hD7Nu_LAYMD8O4m0SRYwje2tmsjR_WiVynWcE1Om4l8eu8YxiIsY5Q2DwalhiTY8lyKHLj-kXdHkBgntZzmkaIk0WqEwhf2fAGs_B2Vj7IAuRw9x6EaPvngxo_xjNYxN7GPudQeFwRPqKb74-ImVWDdbkxKTSQAMR4rtA3JcxBA',
    categories: ['Appetizers', 'Mains', 'Desserts', 'Beverages'],
    items: [
      {
        id: 'gt-1',
        name: 'Crispy Mediterranean Calamari',
        price: 18.50,
        description: 'Lightly battered squid rings with lemon zest, served with a smoked paprika aioli dipping sauce.',
        category: 'Appetizers',
        tags: ['Popular', 'Seafood'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4xVFwxxUkeymzcWVmyypAXbMy8BAVyZUuFVJ2t6TpLjouEQOC0lyVT2l3K3ERtww4uFA8plt8Wj_me1f8mZ5BLqYQIuP44iJLG6dAGvWds8-M0LZxBd3gXnephJql-sKZlK2eW4xMx5qFtPZ8f44E6rjhNloxca5Tau0DMfrokWrglV7eDAhkRsGdwSE069Nwpb12ADJEH74NsgEEjkoDX-WJLrznMLgBQIPR3ZOku4tgXk8WrKrlGg',
      },
      {
        id: 'gt-2',
        name: 'Heirloom Caprese Salad',
        price: 14.00,
        description: 'Buffalo mozzarella, vine-ripened tomatoes, fresh basil, and an aged balsamic reduction.',
        category: 'Appetizers',
        tags: ['Vegetarian', 'Gluten-Free'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJbnsImwXwtuLT3Zavl28vOHEN4C1MuwRo53CssAEHOkrV9AlPYwzWeC6FNAxQf_zl0PlVkJKHqjUbftaXyH-WMusxjSCweTcFUyDe_uK41Z4AmrUvrlfe22eCBuZKsP94g1Cna5YNx_p_RUW9mRVryxw4bcPyD7BjLAX8KomKjIxH9w-4-601ctjgp66qr1Ab0Ml9CXbKcxiqM4wkNfzjLGIspOMqRroB0NRCb4hk3Ce_77XvmMkDkg',
      },
      {
        id: 'gt-3',
        name: 'Signature Wagyu Fillet',
        price: 52.00,
        description: '8oz premium wagyu beef served with truffle potato puree and seasonal glazed vegetables.',
        category: 'Mains',
        tags: ["Chef's Choice"],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-CytaA6fvpsAI9THXHwsBUGAWSFvSyHrjUurSfkOW9774kyBFucPgYVN-BRXi_vpbdMGFi-lAE0yZYOc4Trkw9Mjamz5VXa7DcwtclyYGDceQRrs_afbS_xR6vgfbB9vLRYlLDlcpsYUjRCK6KHz5xrB8PFvJlCiJKGC5CExCb-7_BrmSo0ywYjv8Ey1CwuAMMMtsb3Ud9AsPHpT4ymcaNgGmQbdqMQIAHio72i70qObDCMoouV8ADA',
      },
      {
        id: 'gt-4',
        name: 'Dark Chocolate Melting Heart',
        price: 12.50,
        description: 'Warm 70% cacao cake with a liquid center, served with house-made vanilla bean ice cream.',
        category: 'Desserts',
        tags: ['Sweet'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqao02IWYqCd4xocGAVpVqRTvLEuj7t74Kl9if75TtMRG8kGb9pLJEMXFYUhhdxWbsRmqCWgafb7ZcVkzvPcmxsGeB1w4HifezygObUTr9MRVGgMH_89_lGVHayuBB5JbEtYEuFU3JQCkFbPaL14LYTaeyxWsj1-W_7UHjc3JcgZA-M6V-c-s3S1Qs6oa5NrqsNnkMjPTIElRzJvHv7l9B9KzFdkQIAlfeh-vXU6KeP7u26V1aazsJ6Q',
      },
    ],
  },
  'Spice & Sizzle House': {
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcR2zgbbUBfVXC6dqpyWSN-mIkwc3HljtWIOC7HM_vJ52JA0fViK0WcnLn_rOYtDHv0tcsS2TBzJwTGYAFfsozowKLklqwQpDUcoVoFYynJ16gJCVafBj8e9Pt8cykhSJI58o_24VwljnFmNV9C5WoeMhssyjidqWr3loE8AQXJkNwQwquaatg8x5dNvjF6AzEfqKTLHP_A0w468VmARQVnPp3ToX5fOtj8oPZFlyLm5us8whFeZw8JQ',
    categories: ['Appetizers', 'Mains', 'Drinks'],
    items: [
      {
        id: 'ss-1',
        name: 'Spicy Chicken Wings',
        price: 15.00,
        description: 'Crispy wings tossed in buffalo hot sauce, served with blue cheese.',
        category: 'Appetizers',
        tags: ['Spicy', 'Popular'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmHrWO2B8oLuDopl61X1Yupiqu3GF4WkiEuDxLrZLPsLj8bRRwyGGFpsKzRpOVQXizPA5G19GvawhnZmLALVuyTfZDeFZe75yOAH2WaVC5dOeJU5DtEXouk44-eSI9Wslfg8bdB8jTjYDNRQiezalmmoYPmztEqNabPWv23zVHzNRNHF5_sEx2qBc6eA532QzHxGzbOVDvgMYJauX4yzALFqtTakPjFQJi9CqR8bfkRQjm7BpR0_twCA',
      },
    ],
  },
  'Urban Green Bowls': {
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj2LfkE3Jm41j2kku2I9gW1IxAJrkR6xKRAcyX9oBLtI5Wte62kP1bBj1Uq3Pab5Y9VD8_M9MowNPbDSMg1UfdN2sqVhUmn1KMofnorGKvPMg2MV6mnC4Adbwoj-jnYb9lthoNMb7gWH4IlweE3tA53MVo34c4hXwKGwZpNxs8Xy2wOrknbIjey73TwarywZgWtA4n3O7RPMPTDwaH3XvC8eZ65QzT_3haU1D6RQ_IzG9FiiIeAP7rwA',
    categories: ['Appetizers', 'Mains'],
    items: [
      {
        id: 'ug-1',
        name: 'Hummus & Pita',
        price: 10.00,
        description: 'Creamy chickpea puree served with warm flatbread.',
        category: 'Appetizers',
        tags: ['Vegan'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj2LfkE3Jm41j2kku2I9gW1IxAJrkR6xKRAcyX9oBLtI5Wte62kP1bBj1Uq3Pab5Y9VD8_M9MowNPbDSMg1UfdN2sqVhUmn1KMofnorGKvPMg2MV6mnC4Adbwoj-jnYb9lthoNMb7gWH4IlweE3tA53MVo34c4hXwKGwZpNxs8Xy2wOrknbIjey73TwarywZgWtA4n3O7RPMPTDwaH3XvC8eZ65QzT_3haU1D6RQ_IzG9FiiIeAP7rwA',
      },
    ],
  },
  'Pizzaiolo Authentico': {
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8NbdeshpmXujgSsDJjZfyeJvp95VXx_eveBbHlaOrLZoAaaf3EaIfplAtYO7kUoiPTwt2aKdifaTw0Tq-1Zj97Jxo__-ja7x35D7s3mdWtPff3uesd0vAWgFN7_JphC45ffK3QTtZlPKZaxVv5V_4cJt7Ja86qyiAuygIWAwoeLWskASEPTymWL7hJHGmuLyPv04bNlftNIx4GteuBr-I6qVGyD3amjpvc0zFi0FGXQihVmufUnUeCQ',
    categories: ['Appetizers', 'Mains'],
    items: [
      {
        id: 'pa-1',
        name: 'Garlic Knots',
        price: 8.00,
        description: 'Freshly baked rolls tossed in garlic butter and herbs.',
        category: 'Appetizers',
        tags: ['Vegetarian'],
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8NbdeshpmXujgSsDJjZfyeJvp95VXx_eveBbHlaOrLZoAaaf3EaIfplAtYO7kUoiPTwt2aKdifaTw0Tq-1Zj97Jxo__-ja7x35D7s3mdWtPff3uesd0vAWgFN7_JphC45ffK3QTtZlPKZaxVv5V_4cJt7Ja86qyiAuygIWAwoeLWskASEPTymWL7hJHGmuLyPv04bNlftNIx4GteuBr-I6qVGyD3amjpvc0zFi0FGXQihVmufUnUeCQ',
      },
    ],
  },
};

const AdminMenuPage = () => {
  const navigate = useNavigate();

  // Selected Restaurant State
  const [selectedRest, setSelectedRest] = useState('The Golden Truffle Bistro');
  const [restData, setRestData] = useState(INITIAL_REST_DATA);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals management
  const [isModalOpen, setIsModalOpen] = useState(false); // Add Restaurant modal
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisineType, setCuisineType] = useState('Italian');

  // New Category Management
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Edit Item modal
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddRestaurant = (e) => {
    e.preventDefault();
    if (restaurantName.trim()) {
      showToast(`Restaurant "${restaurantName}" successfully added!`);
      setIsModalOpen(false);
      setRestaurantName('');
    }
  };

  // Add category handler
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      const name = newCategoryName.trim();
      setRestData((prev) => {
        const curRest = prev[selectedRest];
        if (curRest.categories.includes(name)) return prev;
        return {
          ...prev,
          [selectedRest]: {
            ...curRest,
            categories: [...curRest.categories, name],
          },
        };
      });
      showToast(`Category "${name}" created successfully.`);
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
    }
  };

  // Delete food item
  const handleDeleteItem = (itemId) => {
    setRestData((prev) => {
      const curRest = prev[selectedRest];
      return {
        ...prev,
        [selectedRest]: {
          ...curRest,
          items: curRest.items.filter((item) => item.id !== itemId),
        },
      };
    });
    showToast('Menu item deleted successfully.');
  };

  // Open Edit Item modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price);
    setEditCategory(item.category);
    setEditDescription(item.description);
  };

  // Submit edit item form
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setRestData((prev) => {
      const curRest = prev[selectedRest];
      const updatedItems = curRest.items.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            name: editName,
            price: parseFloat(editPrice) || 0,
            category: editCategory,
            description: editDescription,
          };
        }
        return item;
      });
      return {
        ...prev,
        [selectedRest]: {
          ...curRest,
          items: updatedItems,
        },
      };
    });
    showToast(`"${editName}" updated successfully.`);
    setEditingItem(null);
  };

  // Active Category details calculations
  const categoriesList = useMemo(() => {
    return restData[selectedRest].categories;
  }, [restData, selectedRest]);

  const currentItems = useMemo(() => {
    return restData[selectedRest].items;
  }, [restData, selectedRest]);

  // Search filter
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return currentItems;
    return currentItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentItems, searchQuery]);

  // Group items by category to render sections
  const itemsByCategory = useMemo(() => {
    const groups = {};
    categoriesList.forEach((cat) => {
      groups[cat] = [];
    });
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems, categoriesList]);

  // Calculate count counts for category sidebar badges
  const categoryCounts = useMemo(() => {
    const counts = {};
    categoriesList.forEach((cat) => {
      counts[cat] = currentItems.filter((i) => i.category === cat).length;
    });
    return counts;
  }, [currentItems, categoriesList]);

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* Visual stylesheet overrides */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
        }
        .active-nav {
          font-variation-settings: 'FILL' 1;
        }
        .glass-panel {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(229, 231, 235, 0.5);
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
                  placeholder="e.g. Pizza Gourmand"
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
                </select>
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

      {/* Category Creation Form Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-gutter border border-outline-variant/30 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-h3 font-bold text-on-surface">Add New Category</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-secondary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-secondary">Category Name *</label>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body text-body"
                  placeholder="e.g. Appetizers, Mains, Sides..."
                  type="text"
                  required
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 h-12 rounded-xl border border-outline-variant/30 text-secondary font-button text-button hover:bg-surface-variant/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-primary text-white font-button text-button hover:opacity-90 transition-colors shadow-md"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Editing Dialog Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-h3 text-on-surface">Edit Menu Item</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-secondary">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="font-label text-label text-secondary mb-2 block uppercase">Item Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all font-body"
                  type="text"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label text-label text-secondary mb-2 block uppercase">Price ($)</label>
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all font-body"
                    step="0.01"
                    type="number"
                    required
                  />
                </div>
                <div>
                  <label className="font-label text-label text-secondary mb-2 block uppercase">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all appearance-none bg-transparent font-body"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-label text-label text-secondary mb-2 block uppercase">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all h-24 font-body"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3 border border-outline text-outline rounded-xl font-button text-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-button text-button shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SideNavBar Anchor */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant/30 flex flex-col z-40">
        <div className="px-6 py-8">
          <h1 className="font-h3 text-h3 text-primary dark:text-primary-fixed font-bold leading-tight">Foodora Admin</h1>
          <p className="font-label text-label text-on-secondary-container mt-1">Management Suite</p>
        </div>
        <nav className="flex-1 mt-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-secondary dark:text-secondary-fixed-dim flex items-center gap-4 px-6 py-4 hover:bg-surface-variant dark:hover:bg-secondary-fixed-dim/10 transition-all duration-200 w-full text-left font-label text-label cursor-pointer"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-secondary dark:text-secondary-fixed-dim flex items-center gap-4 px-6 py-4 hover:bg-surface-variant dark:hover:bg-secondary-fixed-dim/10 transition-all duration-200 w-full text-left font-label text-label cursor-pointer"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Orders</span>
          </button>
          <button
            onClick={() => navigate('/admin/restaurants')}
            className="text-secondary dark:text-secondary-fixed-dim flex items-center gap-4 px-6 py-4 hover:bg-surface-variant dark:hover:bg-secondary-fixed-dim/10 transition-all duration-200 w-full text-left font-label text-label cursor-pointer"
          >
            <span className="material-symbols-outlined">storefront</span>
            <span>Restaurants</span>
          </button>
          <button
            onClick={() => navigate('/admin/menu')}
            className="text-primary dark:text-primary-fixed font-bold border-r-4 border-primary flex items-center gap-4 px-6 py-4 bg-primary-container/10 transition-all duration-200 w-full text-left font-label text-label cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              restaurant_menu
            </span>
            <span>Menu Management</span>
          </button>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="text-secondary dark:text-secondary-fixed-dim flex items-center gap-4 px-6 py-4 hover:bg-surface-variant dark:hover:bg-secondary-fixed-dim/10 transition-all duration-200 w-full text-left font-label text-label cursor-pointer"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span>Analytics</span>
          </button>
        </nav>
        <div className="p-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-primary text-white font-button text-button py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            Add New Restaurant
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 p-margin_desktop">
        
        {/* Top Navigation / Header */}
        <header className="flex justify-between items-center mb-stack_lg">
          <div>
            <h2 className="font-h2 text-h2 text-on-background font-bold">Menu Management</h2>
            <p className="font-body text-body text-secondary mt-1">
              Configure and update culinary offerings for your partners.
            </p>
          </div>
          <div className="flex items-center gap-stack_md">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-secondary">search</span>
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all w-64 font-body text-small bg-transparent"
                placeholder="Search food items..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-xl border border-outline-variant">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-sm">person</span>
              </div>
              <span className="font-label text-label text-on-surface">Admin User</span>
            </div>
          </div>
        </header>

        {/* Restaurant Selector */}
        <section className="mb-stack_lg">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-gutter">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 bg-surface-container-low">
                <img
                  className="w-full h-full object-cover"
                  alt={selectedRest}
                  src={restData[selectedRest].logo}
                />
              </div>
              <div>
                <p className="font-label text-label text-secondary mb-1">SELECTED RESTAURANT</p>
                <select
                  value={selectedRest}
                  onChange={(e) => setSelectedRest(e.target.value)}
                  className="font-h3 text-h3 bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-primary appearance-none pr-8 font-bold"
                >
                  {Object.keys(restData).map((rest) => (
                    <option key={rest} value={rest}>
                      {rest}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-stack_sm">
              <button
                onClick={() => showToast(`Opening storefront view for ${selectedRest}`)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-outline text-outline font-button text-button hover:bg-outline/5 transition-all cursor-pointer bg-transparent"
              >
                <span className="material-symbols-outlined">preview</span>
                View Storefront
              </button>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-button text-button hover:opacity-90 transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-white">add</span>
                New Category
              </button>
            </div>
          </div>
        </section>

        {/* Menu Categories Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Category Sidebar/Jump Links */}
          <div className="lg:col-span-3">
            <div className="sticky top-margin_desktop bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
              <h3 className="font-label text-label text-secondary px-2 mb-4 uppercase tracking-widest">
                Categories
              </h3>
              <ul className="space-y-1">
                {categoriesList.map((cat) => (
                  <li key={cat}>
                    <a
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-surface-variant/50 transition-all text-secondary"
                      href={`#${cat.toLowerCase()}`}
                    >
                      <span className="font-semibold text-small">{cat}</span>
                      <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {String(categoryCounts[cat] || 0).padStart(2, '0')}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Items List */}
          <div className="lg:col-span-9 space-y-stack_lg">
            {categoriesList.map((cat) => {
              const categoryItems = itemsByCategory[cat] || [];
              return (
                <section key={cat} id={cat.toLowerCase()}>
                  <div className="flex items-center gap-4 mb-stack_md">
                    <h3 className="font-h3 text-h3 text-on-background font-bold">{cat}</h3>
                    <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
                  </div>

                  {categoryItems.length === 0 ? (
                    <div className="py-6 text-center text-secondary text-small bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
                      No items under this category.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className="group bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 hover:shadow-lg transition-all flex items-center gap-6"
                        >
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                            <img
                              className="w-full h-full object-cover"
                              alt={item.name}
                              src={item.image}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-body text-body font-bold text-on-surface">
                                {item.name}
                              </h4>
                              <span className="font-h3 text-h3 text-primary font-bold">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="font-small text-small text-secondary mt-1 max-w-md">
                              {item.description}
                            </p>
                            <div className="flex gap-2 mt-3">
                              {item.tags &&
                                item.tags.map((tg) => (
                                  <span
                                    key={tg}
                                    className="bg-secondary-container/50 text-on-secondary-container px-3 py-1 rounded-full font-label text-[10px] font-bold"
                                  >
                                    {tg}
                                  </span>
                                ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              aria-label="Edit item"
                              className="p-2 rounded-lg bg-surface-container-highest text-secondary hover:text-primary transition-colors border border-outline-variant/30 cursor-pointer"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              aria-label="Delete item"
                              className="p-2 rounded-lg bg-surface-container-highest text-secondary hover:text-error transition-colors border border-outline-variant/30 cursor-pointer"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

        </div>
      </main>

      {/* Footer Anchor */}
      <footer className="ml-64 bg-inverse-surface dark:bg-surface-container-lowest py-stack_lg px-margin_desktop mt-stack_lg">
        <div className="max-w-container_max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-h3 text-h3 text-primary-fixed mb-4 font-bold">Foodora</h3>
            <p className="text-surface-variant/80 font-small text-small">
              Empowering restaurants with premium digital management tools.
            </p>
          </div>
          <div className="col-span-1">
            <h4 className="text-on-primary font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-small text-surface-variant/80">
              <li>
                <a className="hover:text-primary-fixed transition-all" href="#">
                  About Us
                </a>
              </li>
              <li>
                <a className="hover:text-primary-fixed transition-all" href="#">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="text-on-primary font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-small text-surface-variant/80">
              <li>
                <a className="hover:text-primary-fixed transition-all" href="#">
                  Admin Help Center
                </a>
              </li>
              <li>
                <a className="hover:text-primary-fixed transition-all" href="#">
                  Merchant Portal
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="text-on-primary font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-small text-surface-variant/80">
              <li>
                <a className="hover:text-primary-fixed transition-all" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-primary-fixed transition-all" href="#">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-container_max mx-auto mt-stack_lg pt-stack_md border-t border-surface-variant/20">
          <p className="text-surface-variant/60 font-small text-small text-center md:text-left">
            © 2024 Foodora. All rights reserved. Management Console v4.2.1
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminMenuPage;
