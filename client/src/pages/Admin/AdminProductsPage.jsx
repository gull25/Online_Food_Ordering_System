import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

const AdminProductsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [addOns, setAddOns] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    vegNonVeg: 'N/A',
    isAvailable: true
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.restaurantId) {
      setLoading(false);
      return;
    }
    try {
      const [catsRes, prodsRes] = await Promise.all([
        api.get(`/categories/restaurant/${user.restaurantId}`),
        api.get(`/restaurants/${user.restaurantId}/menu`)
      ]);
      setCategories(catsRes.data.data || []);
      setProducts(prodsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category?._id || product.category,
        vegNonVeg: product.vegNonVeg || 'N/A',
        isAvailable: product.isAvailable ?? true
      });
      setImageFile(null);
      setSizes(product.sizes || []);
      setAddOns(product.addOns || []);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: categories.length > 0 ? categories[0]._id : '',
        vegNonVeg: 'N/A',
        isAvailable: true
      });
      setImageFile(null);
      setSizes([]);
      setAddOns([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Please create a category first!');
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }
      data.append('sizes', JSON.stringify(sizes));
      data.append('addOns', JSON.stringify(addOns));

      if (editingProduct) {
        await api.put(`/restaurants/menu/${editingProduct._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated successfully');
      } else {
        await api.post(`/restaurants/${user.restaurantId}/menu`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created successfully');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/restaurants/menu/${id}`);
        toast.success('Product deleted successfully');
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-surface text-on-surface min-h-screen relative flex">
      <AdminSidebar activeTab="products" />

      <main className="ml-64 p-margin_desktop flex-1">
        <AdminHeader 
          title="Products"
          subtitle="Manage your menu items."
        />

        <div className="mt-8 animate-in fade-in">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-primary text-white font-button text-button rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Product
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-sm overflow-hidden">
            {products.length === 0 ? (
              <div className="p-12 text-center text-secondary">
                <span className="material-symbols-outlined text-[48px] mb-4">fastfood</span>
                <p>No products found. Add your first menu item to get started!</p>
              </div>
            ) : (
              <table className="w-full text-left font-body text-body">
                <thead className="bg-surface-variant/30 text-on-surface-variant font-label text-label uppercase">
                  <tr>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Item</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Category</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Price</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Type</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Status</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod._id} className="border-b border-outline-variant/30 hover:bg-surface-variant/10 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-variant flex-shrink-0">
                          <img src={prod.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-on-surface">{prod.name}</span>
                      </td>
                      <td className="px-6 py-4 text-secondary">{prod.category?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 font-bold text-primary">${prod.price?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-secondary">{prod.vegNonVeg}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${prod.isAvailable ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                          {prod.isAvailable ? 'Available' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal(prod)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => handleDelete(prod._id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-variant/10">
              <h3 className="font-h3 text-h3 font-bold text-on-surface">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h3>
              <button onClick={closeModal} className="text-secondary hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="font-label text-label text-on-surface-variant uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. Classic Margherita Pizza"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label text-label text-on-surface-variant uppercase">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full h-24 p-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Describe the product..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="font-label text-label text-on-surface-variant uppercase">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="9.99"
                  />
                </div>
                
                <div className="flex-1 space-y-1">
                  <label className="font-label text-label text-on-surface-variant uppercase">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="font-label text-label text-on-surface-variant uppercase">Dietary Type</label>
                  <select
                    value={formData.vegNonVeg}
                    onChange={(e) => setFormData({...formData, vegNonVeg: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="N/A">N/A</option>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>

                <div className="flex-1 space-y-1">
                  <label className="font-label text-label text-on-surface-variant uppercase">Status</label>
                  <div className="h-12 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                        className="w-5 h-5 rounded text-primary focus:ring-primary"
                      />
                      <span className="font-body text-body">Available</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-outline-variant/30 pt-4">
                <div className="flex justify-between items-center">
                  <label className="font-label text-label text-on-surface-variant uppercase">Sizes (Optional)</label>
                  <button type="button" onClick={() => setSizes([...sizes, {name: '', additionalPrice: 0}])} className="text-primary text-sm font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">add</span> Add Size</button>
                </div>
                {sizes.map((size, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" placeholder="Size Name" value={size.name} onChange={(e) => { const newSizes = [...sizes]; newSizes[idx].name = e.target.value; setSizes(newSizes); }} className="flex-1 h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" required />
                    <input type="number" step="0.01" min="0" placeholder="+ Price" value={size.additionalPrice} onChange={(e) => { const newSizes = [...sizes]; newSizes[idx].additionalPrice = parseFloat(e.target.value) || 0; setSizes(newSizes); }} className="w-24 h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" required />
                    <button type="button" onClick={() => setSizes(sizes.filter((_, i) => i !== idx))} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-outline-variant/30 pt-4">
                <div className="flex justify-between items-center">
                  <label className="font-label text-label text-on-surface-variant uppercase">Add-ons (Optional)</label>
                  <button type="button" onClick={() => setAddOns([...addOns, {name: '', price: 0}])} className="text-primary text-sm font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">add</span> Add Item</button>
                </div>
                {addOns.map((addon, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" placeholder="Add-on Name" value={addon.name} onChange={(e) => { const newAddOns = [...addOns]; newAddOns[idx].name = e.target.value; setAddOns(newAddOns); }} className="flex-1 h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" required />
                    <input type="number" step="0.01" min="0" placeholder="+ Price" value={addon.price} onChange={(e) => { const newAddOns = [...addOns]; newAddOns[idx].price = parseFloat(e.target.value) || 0; setAddOns(newAddOns); }} className="w-24 h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" required />
                    <button type="button" onClick={() => setAddOns(addOns.filter((_, i) => i !== idx))} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                ))}
              </div>

              <div className="space-y-1 border-t border-outline-variant/30 pt-4">
                <label className="font-label text-label text-on-surface-variant uppercase">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full h-12 px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-12 rounded-xl bg-surface-variant text-on-surface-variant font-button text-button hover:opacity-80 transition-opacity"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-primary text-white font-button text-button hover:opacity-90 transition-opacity shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
