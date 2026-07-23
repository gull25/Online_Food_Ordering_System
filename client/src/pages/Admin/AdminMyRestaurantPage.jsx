import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

const AdminMyRestaurantPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    coverImageUrl: '',
    deliveryRadius: 0,
    deliveryTimeEstimate: '',
    minOrderAmount: 0,
    isActive: true,
  });

  useEffect(() => {
    const fetchMyRestaurant = async () => {
      try {
        if (!user?.restaurantId) {
          toast.error('No restaurant linked to this account.');
          setLoading(false);
          return;
        }
        const res = await api.get(`/restaurants/${user.restaurantId}`);
        const data = res.data.data;
        setRestaurant(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          logoUrl: data.logoUrl || '',
          coverImageUrl: data.coverImageUrl || '',
          deliveryRadius: data.deliveryRadius || 0,
          deliveryTimeEstimate: data.deliveryTimeEstimate || '',
          minOrderAmount: data.minOrderAmount || 0,
          isActive: data.isActive ?? true,
        });
      } catch (err) {
        toast.error('Failed to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyRestaurant();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/restaurants/${user.restaurantId}`, formData);
      toast.success('Restaurant updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update restaurant.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!restaurant) return <div className="p-8 text-error ml-64 mt-16">No Restaurant Found.</div>;

  return (
    <div className="bg-surface text-on-surface min-h-screen relative flex">
      {/* Custom Styles to match other admin pages */}
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
      <main className="ml-64 p-margin_desktop flex-1">
        
        {/* Header Section */}
        <AdminHeader 
          title="My Restaurant"
          subtitle="Manage your public profile and delivery settings."
        />

        <div className="animate-in fade-in max-w-4xl mx-auto pb-12 mt-8">
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-sm overflow-hidden">
        {/* Cover Image Preview */}
        <div className="h-48 w-full bg-surface-variant relative overflow-hidden">
          {formData.coverImageUrl ? (
            <img src={formData.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl">storefront</span>
            </div>
          )}
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-full border-4 border-surface-container-lowest bg-surface-variant overflow-hidden shadow-md">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-white">
                  <span className="material-symbols-outlined">image</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-16 space-y-8">
          
          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div>
              <h3 className="font-button text-button font-bold text-on-surface">Store Status</h3>
              <p className="font-small text-small text-secondary">Turn this off to temporarily hide your store from customers.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-3 text-sm font-medium text-on-surface">{formData.isActive ? 'Open' : 'Closed'}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 md:col-span-2">
              <label className="font-label text-label text-on-surface">Restaurant Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full h-12 px-4 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-body bg-surface-container-lowest" />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-label text-label text-on-surface">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full p-4 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-body bg-surface-container-lowest resize-none"></textarea>
            </div>

            <div className="space-y-1">
              <label className="font-label text-label text-on-surface">Logo URL</label>
              <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-body bg-surface-container-lowest" placeholder="https://..." />
            </div>

            <div className="space-y-1">
              <label className="font-label text-label text-on-surface">Cover Image URL</label>
              <input type="url" name="coverImageUrl" value={formData.coverImageUrl} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-body bg-surface-container-lowest" placeholder="https://..." />
            </div>

            <div className="space-y-1">
              <label className="font-label text-label text-on-surface">Delivery Radius (km)</label>
              <input type="number" name="deliveryRadius" value={formData.deliveryRadius} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-body bg-surface-container-lowest" />
            </div>

            <div className="space-y-1">
              <label className="font-label text-label text-on-surface">Min Order Amount ($)</label>
              <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-body bg-surface-container-lowest" />
            </div>

            <div className="space-y-1">
              <label className="font-label text-label text-on-surface">Estimated Delivery Time</label>
              <input type="text" name="deliveryTimeEstimate" value={formData.deliveryTimeEstimate} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body text-body bg-surface-container-lowest" placeholder="e.g., 30-45 mins" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-surface-variant">
            <button
              type="submit"
              disabled={saving}
              className="h-12 px-8 bg-primary text-white font-button text-button rounded-xl shadow-md hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined">save</span>
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
        </div>
      </main>
    </div>
  );
};

export default AdminMyRestaurantPage;
