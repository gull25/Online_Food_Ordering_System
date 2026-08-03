import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../../../../api/axios';
import LoadingSkeleton from '../../../../components/common/LoadingSkeleton';
import AdminSidebar from '../../../../components/adminDashboardComponents/AdminSidebar';
import AdminHeader from '../../../../components/adminDashboardComponents/AdminHeader';

const AdminCategoriesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    if (!user?.restaurantId) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/categories/restaurant/${user.restaurantId}`);
      setCategories(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        order: category.order || 0,
        isActive: category.isActive ?? true
      });
      setImageFile(null);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        order: categories.length,
        isActive: true
      });
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category created successfully');
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? Items in this category will not have a category anymore.')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-surface text-on-surface min-h-screen relative flex">
      <AdminSidebar activeTab="categories" />

      <main className="ml-64 p-margin_desktop flex-1">
        <AdminHeader 
          title="Categories"
          subtitle="Manage your menu groupings."
        />

        <div className="mt-8 animate-in fade-in">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-primary text-white font-button text-button rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Category
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-sm overflow-hidden">
            {categories.length === 0 ? (
              <div className="p-12 text-center text-secondary">
                <span className="material-symbols-outlined text-[48px] mb-4">category</span>
                <p>No categories found. Create one to get started.</p>
              </div>
            ) : (
              <table className="w-full text-left font-body text-body">
                <thead className="bg-surface-variant/30 text-on-surface-variant font-label text-label uppercase">
                  <tr>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Order</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Name</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Status</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id} className="border-b border-outline-variant/30 hover:bg-surface-variant/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">{cat.order}</td>
                      <td className="px-6 py-4 font-bold text-on-surface">{cat.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cat.isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                          {cat.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => openModal(cat)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
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
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-variant/10">
              <h3 className="font-h3 text-h3 font-bold text-on-surface">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={closeModal} className="text-secondary hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-label text-label text-on-surface-variant uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. Starters"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label text-label text-on-surface-variant uppercase">Description (Optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Appetizers to start your meal"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label text-label text-on-surface-variant uppercase">Category Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full h-12 px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="font-label text-label text-on-surface-variant uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                
                <div className="flex-1 space-y-1">
                  <label className="font-label text-label text-on-surface-variant uppercase">Status</label>
                  <div className="h-12 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-5 h-5 rounded text-primary focus:ring-primary"
                      />
                      <span className="font-body text-body">Visible to Customers</span>
                    </label>
                  </div>
                </div>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
