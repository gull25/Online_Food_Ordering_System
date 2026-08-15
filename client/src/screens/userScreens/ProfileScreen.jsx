import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/common/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileThunk } from '../../redux/userSlice';
import toast from 'react-hot-toast';
import { useApiAction } from '../../hooks/useApiAction';


const ProfilePage = () => {
  const dispatch = useDispatch();
  
  // Read from auth state to pre-fill
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.user);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      const payload = new FormData();
      payload.append('avatar', file);

      const toastId = toast.loading('Uploading profile picture...');
      try {
        await dispatch(updateProfileThunk(payload)).unwrap();
        toast.success('Profile picture updated!', { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error(err || 'Failed to upload image', { id: toastId });
        setPreviewUrl(null); // Revert on failure
      }
      
      // Reset input to allow selecting the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const { execute: handleSubmit, isSubmitting: isSavingProfile } = useApiAction(async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfileThunk(formData)).unwrap();
      toast.success('Profile settings saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err || 'Failed to update profile');
    }
  });

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative">


      <main id="main-content" tabIndex={-1} className="flex-grow w-full max-w-2xl mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-gutter">
          <div className="flex items-center gap-4 mb-stack_lg">
            <div 
              className="relative group w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center overflow-hidden border border-outline-variant/30 shadow-sm cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={previewUrl || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt="Avatar"
                className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity text-white">
                <Icon name="photo_camera" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
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
              <p className="text-[12px] text-secondary mt-1 ml-1">Email cannot be changed.</p>
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
                disabled={loading || isSavingProfile}
                className={`w-full h-12 bg-primary text-on-primary font-button text-button rounded-xl shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${(loading || isSavingProfile) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSavingProfile && <Icon name="sync" className="animate-spin text-sm" />}
                <span>{isSavingProfile ? 'Saving...' : (loading ? 'Saving...' : 'Save Changes')}</span>
                {!(loading || isSavingProfile) && <Icon name="save" className="text-[18px]" />}
              </button>
            </div>
          </form>
        </div>
      </main>

          </div>
  );
};

export default ProfilePage;
