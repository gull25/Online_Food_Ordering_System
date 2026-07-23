import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileThunk } from '../../features/user/userSlice';
import toast from 'react-hot-toast';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const ProfilePage = () => {
  const dispatch = useDispatch();
  
  // Read from auth state to pre-fill
  const { user } = useSelector(state => state.auth);
  const { loading, error } = useSelector(state => state.user);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfileThunk(formData)).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      // Error is handled by Redux state, but we can log it
      console.error(err);
      toast.error(err || 'Failed to update profile');
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative">
      <TopNavBar />

      <main className="flex-grow w-full max-w-2xl mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-gutter">
          <div className="flex items-center gap-4 mb-stack_lg">
            <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center overflow-hidden border border-outline-variant/30 shadow-sm">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-h3 text-h3 text-on-surface font-bold">Profile Settings</h1>
              <p className="font-body text-body text-on-surface-variant">
                Manage your personal information
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-stack_md mt-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block font-label text-label text-on-surface mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full h-12 bg-surface-variant/30 border border-outline-variant rounded-xl px-4 font-body text-body text-on-surface-variant cursor-not-allowed"
              />
              <p className="text-[11px] text-secondary mt-1 ml-1">Email cannot be changed.</p>
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block font-label text-label text-on-surface mb-2">Account Role</label>
              <input
                type="text"
                value={user?.role?.toUpperCase() || 'USER'}
                disabled
                className="w-full h-12 bg-surface-variant/30 border border-outline-variant rounded-xl px-4 font-body text-body text-on-surface-variant cursor-not-allowed"
              />
            </div>

            <div className="h-px bg-outline-variant/30 my-4"></div>

            {/* Name */}
            <div>
              <label className="block font-label text-label text-on-surface mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full h-12 bg-surface-container-lowest border border-outline rounded-xl px-4 font-body text-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-label text-label text-on-surface mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full h-12 bg-surface-container-lowest border border-outline rounded-xl px-4 font-body text-body text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
              />
            </div>

            <div className="pt-stack_sm">
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 bg-primary text-on-primary font-button text-button rounded-xl shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                {!loading && <span className="material-symbols-outlined text-[18px]">save</span>}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
