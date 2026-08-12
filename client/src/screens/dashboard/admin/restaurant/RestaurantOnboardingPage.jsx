import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../../../api/axios';
import { toast } from 'react-hot-toast';
import { loginSuccess } from '../../../../redux/authSlice';

const RestaurantOnboardingPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', phone: '', email: '', website: '',
    address: '', city: '', state: '', zipCode: '', lat: '', lng: '',
    openingTime: '09:00 AM', closingTime: '10:00 PM', deliveryFee: 0,
    minOrder: 10, estimatedDeliveryTime: '30 min', cuisine: '', status: 'Open',
    facebook: '', instagram: '', tiktok: '', whatsapp: '',
    refundPolicy: '', deliveryPolicy: '', privacyPolicy: ''
  });

  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  /*
   * An owner who already has a restaurant does not belong on this form — there
   * is one restaurant per owner, so submitting it would only fail. The request
   * was already being made and its result assigned to state that nothing read;
   * routing on it is what it was fetching for.
   */
  const fetchStatus = async () => {
    try {
      if (user.restaurantId) {
        const res = await api.get(`/restaurants/${user.restaurantId}`);
        if (res.data?.data) {
          navigate('/admin/my-restaurant', { replace: true });
          return;
        }
      }
    } catch {
      // No restaurant yet, or it could not be loaded — fall through to the form.
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'cuisine') {
            data.append('cuisine[0]', formData[key]); // simplistic for now
        } else {
            data.append(key, formData[key]);
        }
      });
      data.append('socialMedia[facebook]', formData.facebook);
      data.append('socialMedia[instagram]', formData.instagram);
      data.append('socialMedia[tiktok]', formData.tiktok);
      data.append('socialMedia[whatsapp]', formData.whatsapp);
      data.append('policies[refund]', formData.refundPolicy);
      data.append('policies[delivery]', formData.deliveryPolicy);
      data.append('policies[privacy]', formData.privacyPolicy);
      
      if (logo) data.append('logo', logo);
      if (banner) data.append('banner', banner);

      const res = await api.post('/restaurants', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newRestaurant = res.data.data;
      
      const updatedUser = { ...user, restaurantId: newRestaurant._id };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      dispatch(loginSuccess(updatedUser));
      
      toast.success('Restaurant created successfully!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create restaurant');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-surface-container-lowest p-8 rounded-3xl shadow-lg border border-outline-variant/30">
        


        <div className="text-center mb-10">
          <h2 className="text-h2 font-h2 text-on-surface font-bold">Partner with Foodora</h2>
          <p className="text-secondary mt-2">Submit your restaurant details to start reaching thousands of customers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="font-label text-label text-secondary block mb-2">Restaurant Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="col-span-1">
              <label className="font-label text-label text-secondary block mb-2">Slug (URL)</label>
              <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. bella-italia" />
            </div>

            <div className="col-span-1">
              <label className="font-label text-label text-secondary block mb-2">Phone</label>
              <input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="col-span-1">
              <label className="font-label text-label text-secondary block mb-2">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="col-span-1">
              <label className="font-label text-label text-secondary block mb-2">Website</label>
              <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="font-label text-label text-secondary block mb-2">Description</label>
              <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none h-24" />
            </div>

            {/* Address fields */}
            <div className="col-span-1 md:col-span-2">
              <label className="font-label text-label text-secondary block mb-2">Address</label>
              <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="col-span-1">
              <label className="font-label text-label text-secondary block mb-2">City</label>
              <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" />
            </div>
            
            <div className="col-span-1 grid grid-cols-2 gap-4">
              <div>
                <label className="font-label text-label text-secondary block mb-2">State</label>
                <input type="text" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="font-label text-label text-secondary block mb-2">Zip Code</label>
                <input type="text" required value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>

            {/* Details */}
            <div className="col-span-1 grid grid-cols-2 gap-4">
              <div>
                <label className="font-label text-label text-secondary block mb-2">Opening Time</label>
                <input type="text" value={formData.openingTime} onChange={(e) => setFormData({...formData, openingTime: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" placeholder="09:00 AM" />
              </div>
              <div>
                <label className="font-label text-label text-secondary block mb-2">Closing Time</label>
                <input type="text" value={formData.closingTime} onChange={(e) => setFormData({...formData, closingTime: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" placeholder="10:00 PM" />
              </div>
            </div>

            <div className="col-span-1 grid grid-cols-2 gap-4">
              <div>
                <label className="font-label text-label text-secondary block mb-2">Delivery Fee ($)</label>
                <input type="number" step="0.01" value={formData.deliveryFee} onChange={(e) => setFormData({...formData, deliveryFee: Number(e.target.value)})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="font-label text-label text-secondary block mb-2">Min Order ($)</label>
                <input type="number" required min="0" value={formData.minOrder} onChange={(e) => setFormData({...formData, minOrder: Number(e.target.value)})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>

            <div className="col-span-1">
              <label className="font-label text-label text-secondary block mb-2">Estimated Delivery Time</label>
              <input type="text" value={formData.estimatedDeliveryTime} onChange={(e) => setFormData({...formData, estimatedDeliveryTime: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 25-35 min" />
            </div>

            <div className="col-span-1">
              <label className="font-label text-label text-secondary block mb-2">Cuisine Type</label>
              <input type="text" required value={formData.cuisine} onChange={(e) => setFormData({...formData, cuisine: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Italian" />
            </div>

            {/* Images */}
            <div className="col-span-1">
              <label className="font-label text-label text-secondary block mb-2">Restaurant Logo</label>
              <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} className="w-full h-12 px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest" />
            </div>

            <div className="col-span-1">
              <label className="font-label text-label text-secondary block mb-2">Restaurant Banner</label>
              <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0])} className="w-full h-12 px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest" />
            </div>

            {/* Policies */}
            <div className="col-span-1 md:col-span-2">
              <label className="font-label text-label text-secondary block mb-2">Refund Policy</label>
              <textarea value={formData.refundPolicy} onChange={(e) => setFormData({...formData, refundPolicy: e.target.value})} className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest h-20" />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="font-label text-label text-secondary block mb-2">Delivery Policy</label>
              <textarea value={formData.deliveryPolicy} onChange={(e) => setFormData({...formData, deliveryPolicy: e.target.value})} className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest h-20" />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full h-14 bg-primary text-on-primary rounded-xl font-button text-button font-bold hover:opacity-90 shadow-md transition-opacity"
            >
              Create Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantOnboardingPage;
