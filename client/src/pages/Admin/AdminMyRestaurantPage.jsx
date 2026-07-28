import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const AdminMyRestaurantPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Item modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount: 0,
    category: '',
    description: '',
    vegNonVeg: 'N/A',
    ingredients: '',
    sizes: [],
    addOns: []
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!user?.restaurantId) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [restRes, catRes, menuRes] = await Promise.all([
        api.get(`/restaurants/${user.restaurantId}`),
        api.get(`/categories/restaurant/${user.restaurantId}`),
        api.get(`/restaurants/${user.restaurantId}/menu`)
      ]);
      setRestaurant(restRes.data.data);
      setCategories(catRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (categories.length === 0) {
      toast.error('Please create a category first!');
      navigate('/admin/categories');
      return;
    }

    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price,
        discount: item.discount || 0,
        category: item.category?._id || item.category,
        description: item.description,
        vegNonVeg: item.vegNonVeg || 'N/A',
        ingredients: item.ingredients?.join(', ') || '',
        sizes: item.sizes || [],
        addOns: item.addOns || []
      });
      setImageFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        price: '',
        discount: 0,
        category: categories[0]._id,
        description: '',
        vegNonVeg: 'N/A',
        ingredients: '',
        sizes: [],
        addOns: []
      });
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'ingredients') {
          const arr = formData[key].split(',').map(s => s.trim()).filter(Boolean);
          arr.forEach((ing, i) => data.append(`ingredients[${i}]`, ing));
        } else if (key === 'sizes' || key === 'addOns') {
          formData[key].forEach((item, i) => {
             data.append(`${key}[${i}][name]`, item.name);
             data.append(`${key}[${i}][${key === 'sizes' ? 'additionalPrice' : 'price'}]`, key === 'sizes' ? item.additionalPrice : item.price);
          });
        } else {
          data.append(key, formData[key]);
        }
      });
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingItem) {
        await api.put(`/restaurants/menu/${editingItem._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Menu item updated');
      } else {
        await api.post(`/restaurants/${user.restaurantId}/menu`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Menu item created');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await api.delete(`/restaurants/menu/${id}`);
        toast.success('Item deleted successfully');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleToggleFeatured = async () => {
    try {
      const newStatus = !restaurant.isFeatured;
      await api.put(`/restaurants/${restaurant._id}`, { isFeatured: newStatus });
      setRestaurant({ ...restaurant, isFeatured: newStatus });
      toast.success(newStatus ? 'Restaurant is now featured!' : 'Restaurant is no longer featured.');
    } catch (err) {
      toast.error('Failed to update featured status');
    }
  };

  // Search filter
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  // Group items by category to render sections
  const itemsByCategory = useMemo(() => {
    const groups = {};
    categories.forEach((cat) => {
      groups[cat._id] = [];
    });
    filteredItems.forEach((item) => {
      const catId = item.category?._id || item.category;
      if (!groups[catId]) {
        groups[catId] = [];
      }
      groups[catId].push(item);
    });
    return groups;
  }, [filteredItems, categories]);

  if (loading) return <LoadingSkeleton />;

  if (!restaurant) {
    return (
      <div className="bg-background text-on-background min-h-screen flex">
        <AdminSidebar activeTab="my-restaurant" />
        <main className="ml-64 p-margin_desktop flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-[64px] text-secondary mb-4">store_off</span>
            <h2 className="font-h2 text-h2 text-on-surface mb-2">No Restaurant Found</h2>
            <p className="text-secondary font-body">Your account is not linked to any restaurant yet.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* Visual stylesheet overrides */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
        }
      `}</style>

      {/* SideNavBar Anchor */}
      <AdminSidebar activeTab="my-restaurant" />

      {/* Main Content Area */}
      <main className="ml-64 p-margin_desktop">
        
        {/* Top Navigation / Header */}
        <AdminHeader 
          title="Menu Management"
          subtitle="Configure and update culinary offerings for your restaurant."
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Stripe Connect Warning Banner */}
        {!restaurant.stripeOnboardingComplete && (
          <div className="mt-8 bg-error-container text-on-error-container p-6 rounded-2xl border border-error/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-3xl">account_balance</span>
              <div>
                <h3 className="font-h3 text-h3 font-bold mb-1">Action Required: Connect Stripe</h3>
                <p className="text-body font-body text-sm">You must connect your bank account to receive automated payouts before your restaurant can be listed publicly.</p>
              </div>
            </div>
            <button 
              onClick={async () => {
                try {
                  const res = await api.post('/stripe/onboard');
                  window.location.href = res.data.url;
                } catch (err) {
                  toast.error('Failed to initiate Stripe onboarding');
                }
              }}
              className="px-6 py-3 bg-error text-white font-button text-button rounded-xl hover:opacity-90 shadow-md font-bold whitespace-nowrap"
            >
              Connect Bank Account
            </button>
          </div>
        )}

        {/* Restaurant Header */}
        <section className="mb-stack_lg mt-8">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-gutter">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 bg-surface-container-low">
                <img
                  className="w-full h-full object-cover"
                  alt={restaurant.name}
                  src={restaurant.image || 'https://via.placeholder.com/150'}
                />
              </div>
              <div>
                <p className="font-label text-label text-secondary mb-1">RESTAURANT</p>
                <h3 className="font-h3 text-h3 text-primary font-bold">{restaurant.name}</h3>
              </div>
            </div>
            <div className="flex gap-stack_sm items-center">
              <label className="flex items-center gap-2 cursor-pointer bg-surface-variant/30 px-4 py-2 rounded-xl border border-outline-variant/30 mr-2 transition-colors hover:bg-surface-variant/50">
                <input
                  type="checkbox"
                  checked={restaurant.isFeatured || false}
                  onChange={handleToggleFeatured}
                  className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span className="font-label text-label font-bold text-on-surface">Featured</span>
              </label>

              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-button text-button hover:opacity-90 transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-white">add</span>
                Add Item
              </button>
            </div>
          </div>
        </section>

        {/* Menu Categories Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Category Sidebar/Jump Links */}
          <div className="lg:col-span-3">
            <div className="sticky top-margin_desktop bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label text-label text-secondary px-2 uppercase tracking-widest">
                  Categories
                </h3>
                <button onClick={() => navigate('/admin/categories')} className="text-primary hover:bg-primary/10 p-1 rounded-md text-[12px] font-bold">
                  Edit
                </button>
              </div>
              <ul className="space-y-1">
                {categories.length === 0 && (
                  <p className="text-secondary text-sm px-2">No categories yet.</p>
                )}
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <a
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-surface-variant/50 transition-all text-secondary"
                      href={`#${cat._id}`}
                    >
                      <span className="font-semibold text-small">{cat.name}</span>
                      <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {itemsByCategory[cat._id]?.length || 0}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Items List */}
          <div className="lg:col-span-9 space-y-stack_lg">
            {categories.map((cat) => {
              const categoryItems = itemsByCategory[cat._id] || [];
              return (
                <section key={cat._id} id={cat._id}>
                  <div className="flex items-center gap-4 mb-stack_md">
                    <h3 className="font-h3 text-h3 text-on-background font-bold">{cat.name}</h3>
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
                          key={item._id}
                          className="group bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 hover:shadow-lg transition-all flex items-center gap-6"
                        >
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                            <img
                              className="w-full h-full object-cover"
                              alt={item.name}
                              src={item.image || 'https://via.placeholder.com/150'}
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
                          </div>
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openModal(item)}
                              className="p-2 rounded-lg bg-surface-container-highest text-secondary hover:text-primary transition-colors border border-outline-variant/30 cursor-pointer"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
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

      {/* Item Editing Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-h3 text-on-surface">{editingItem ? 'Edit Menu Item' : 'New Menu Item'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined text-secondary">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-label text-label text-secondary mb-2 block uppercase">Item Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all font-body"
                  type="text"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label text-label text-secondary mb-2 block uppercase">Price ($)</label>
                  <input
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all font-body"
                    step="0.01"
                    type="number"
                    required
                  />
                </div>
                <div>
                  <label className="font-label text-label text-secondary mb-2 block uppercase">Discount (%)</label>
                  <input
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all font-body"
                    type="number"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label text-label text-secondary mb-2 block uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all appearance-none bg-transparent font-body"
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-label text-label text-secondary mb-2 block uppercase">Veg / Non-Veg</label>
                  <select
                    value={formData.vegNonVeg}
                    onChange={(e) => setFormData({...formData, vegNonVeg: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all appearance-none bg-transparent font-body"
                  >
                    <option value="N/A">N/A</option>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-label text-label text-secondary mb-2 block uppercase">Ingredients (comma separated)</label>
                <input
                  value={formData.ingredients}
                  onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all font-body"
                  type="text"
                />
              </div>
              <div>
                <label className="font-label text-label text-secondary mb-2 block uppercase">Image</label>
                <input
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all font-body"
                  type="file"
                  accept="image/*"
                />
              </div>
              <div>
                <label className="font-label text-label text-secondary mb-2 block uppercase">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none transition-all h-24 font-body"
                  required
                />
              </div>

              {/* Sizes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-label text-label text-secondary block uppercase">Sizes (Optional)</label>
                  <button type="button" onClick={() => setFormData({...formData, sizes: [...formData.sizes, { name: '', additionalPrice: 0 }]})} className="text-xs text-primary font-bold hover:underline">+ Add Size</button>
                </div>
                {formData.sizes.map((size, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input type="text" placeholder="Size (e.g. Large)" value={size.name} onChange={(e) => { const newSizes = [...formData.sizes]; newSizes[index].name = e.target.value; setFormData({...formData, sizes: newSizes}); }} className="flex-1 px-3 py-2 rounded-lg border border-outline-variant" required />
                    <input type="number" step="0.01" placeholder="Addl. Price" value={size.additionalPrice} onChange={(e) => { const newSizes = [...formData.sizes]; newSizes[index].additionalPrice = parseFloat(e.target.value); setFormData({...formData, sizes: newSizes}); }} className="w-24 px-3 py-2 rounded-lg border border-outline-variant" required />
                    <button type="button" onClick={() => { const newSizes = formData.sizes.filter((_, i) => i !== index); setFormData({...formData, sizes: newSizes}); }} className="text-error"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                ))}
              </div>

              {/* Add-ons */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-label text-label text-secondary block uppercase">Add-ons (Optional)</label>
                  <button type="button" onClick={() => setFormData({...formData, addOns: [...formData.addOns, { name: '', price: 0 }]})} className="text-xs text-primary font-bold hover:underline">+ Add Add-on</button>
                </div>
                {formData.addOns.map((addon, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input type="text" placeholder="Add-on (e.g. Extra Cheese)" value={addon.name} onChange={(e) => { const newAddons = [...formData.addOns]; newAddons[index].name = e.target.value; setFormData({...formData, addOns: newAddons}); }} className="flex-1 px-3 py-2 rounded-lg border border-outline-variant" required />
                    <input type="number" step="0.01" placeholder="Price" value={addon.price} onChange={(e) => { const newAddons = [...formData.addOns]; newAddons[index].price = parseFloat(e.target.value); setFormData({...formData, addOns: newAddons}); }} className="w-24 px-3 py-2 rounded-lg border border-outline-variant" required />
                    <button type="button" onClick={() => { const newAddons = formData.addOns.filter((_, i) => i !== index); setFormData({...formData, addOns: newAddons}); }} className="text-error"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
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
    </div>
  );
};

export default AdminMyRestaurantPage;
