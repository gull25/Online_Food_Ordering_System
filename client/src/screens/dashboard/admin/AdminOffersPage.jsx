import React, { useState, useEffect } from 'react';
import Icon from '../../../components/common/Icon';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../../../api/axios';
import { AdminPageSkeleton } from '../../../components/common/Skeleton';
import AdminHeader from '../../../components/adminDashboardComponents/AdminHeader';
import { useApiAction } from '../../../hooks/useApiAction';
import { useItemApiAction } from '../../../hooks/useItemApiAction';

const AdminOffersPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PERCENTAGE',
    discountPercentage: 0,
    code: '',
    validUntil: '',
    isActive: true
  });

  useEffect(() => {
    fetchOffers();
  }, [user]);

  const fetchOffers = async () => {
    if (!user?.restaurantId) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/offers/restaurant/${user.restaurantId}`);
      setOffers(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        title: offer.title,
        description: offer.description || '',
        type: offer.type || 'PERCENTAGE',
        discountPercentage: offer.discountPercentage || 0,
        code: offer.code || '',
        validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
        isActive: offer.isActive ?? true
      });
      setImageFile(null);
    } else {
      setEditingOffer(null);
      setFormData({
        title: '',
        description: '',
        type: 'PERCENTAGE',
        discountPercentage: 0,
        code: '',
        validUntil: '',
        isActive: true
      });
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };

  const { execute: handleSubmit, isSubmitting } = useApiAction(async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingOffer) {
        await api.put(`/offers/${editingOffer._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Offer updated successfully');
      } else {
        await api.post('/offers', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Offer created successfully');
      }
      closeModal();
      fetchOffers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    }
  });

  const { execute: handleDelete, isSubmitting: isDeleting } = useItemApiAction(async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await api.delete(`/offers/${id}`);
        toast.success('Offer deleted successfully');
        fetchOffers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete offer');
      }
    }
  });

  if (loading) return <AdminPageSkeleton rows={5} columns={6} />;

  return (
    <div className="bg-surface text-on-surface min-h-screen relative flex">
      <main className="p-margin_desktop flex-1">
        <AdminHeader
          title="Offers & Promotions"
          subtitle="Manage your promotional deals."
        />

        <div className="mt-8 animate-in fade-in">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-primary text-on-primary font-button text-button rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
            >
              <Icon name="add" className="text-[20px]" />
              Add Offer
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-sm overflow-hidden">
            {offers.length === 0 ? (
              <div className="p-12 text-center text-secondary">
                <Icon name="local_offer" className="text-[48px] mb-4" />
                <p>No offers found. Create one to attract more customers.</p>
              </div>
            ) : (
              <table className="w-full text-left font-body text-body">
                <thead className="bg-surface-variant/30 text-on-surface-variant font-label text-label uppercase">
                  <tr>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Image</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Title</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Code</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Type</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Valid Until</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50">Status</th>
                    <th className="px-6 py-4 border-b border-outline-variant/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer._id} className="border-b border-outline-variant/30 hover:bg-surface-variant/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded overflow-hidden bg-surface-container">
                          <img 
                            src={offer.image !== 'no-photo.jpg' ? offer.image : `https://placehold.co/150/dce3f0/555f6f?text=${encodeURIComponent(offer.title?.charAt(0)?.toUpperCase() || 'O')}`} 
                            alt={offer.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://placehold.co/150/dce3f0/555f6f?text=${encodeURIComponent(offer.title?.charAt(0)?.toUpperCase() || 'O')}`;
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-on-surface">{offer.title}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-surface-container rounded text-primary font-mono text-sm">{offer.code}</span></td>
                      <td className="px-6 py-4 font-bold text-secondary">{offer.type}</td>
                      <td className="px-6 py-4 text-secondary">{new Date(offer.validUntil).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${offer.isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                          {offer.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2 items-center h-full">
                        <button onClick={() => openModal(offer)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors mt-2">
                          <Icon name="edit" className="text-[20px]" />
                        </button>
                        <button disabled={isDeleting(offer._id)} onClick={() => handleDelete(offer._id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors mt-2 disabled:opacity-50">
                          {isDeleting(offer._id) ? <Icon name="sync" className="text-[20px] animate-spin" /> : <Icon name="delete" className="text-[20px]" />}
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
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-variant/10">
              <h3 className="font-h3 text-h3 font-bold text-on-surface">
                {editingOffer ? 'Edit Offer' : 'New Offer'}
              </h3>
              <button onClick={closeModal} className="text-secondary hover:text-on-surface transition-colors">
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-label text-label text-on-surface-variant uppercase">Offer Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. 50% Off First Order"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label text-label text-on-surface-variant uppercase">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Applicable on orders above $20"
                />
              </div>

              <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <label className="font-label text-label text-on-surface-variant uppercase">Promo Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none uppercase"
                    placeholder="e.g. WELCOME50"
                  />
                </div>

                <div className="space-y-1 flex-1">
                  <label className="font-label text-label text-on-surface-variant uppercase">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <label className="font-label text-label text-on-surface-variant uppercase">Offer Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FLAT">Flat Discount</option>
                    <option value="BOGO">BOGO (Buy 1 Get 1)</option>
                    <option value="EXCLUSIVE">Exclusive</option>
                  </select>
                </div>

                <div className="space-y-1 flex-1">
                  <label className="font-label text-label text-on-surface-variant uppercase">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    disabled={formData.type !== 'PERCENTAGE'}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label text-label text-on-surface-variant uppercase">Offer Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full h-12 px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label text-label text-on-surface-variant uppercase">Status</label>
                <div className="h-12 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded text-primary focus:ring-primary"
                    />
                    <span className="font-body text-body">Active</span>
                  </label>
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
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-button text-button hover:opacity-90 transition-opacity shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Icon name="sync" className="animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffersPage;
