import React from 'react';

const DeliveryForm = ({ formData, handleInputChange, handleSubmitOrder, deliveryPreference, setDeliveryPreference }) => {
  return (
    <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant">
      <h2 className="font-h3 text-h3 mb-6 font-bold text-on-surface">Delivery Details</h2>
      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-label text-label text-secondary">First Name *</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full h-12 px-4 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
            placeholder="John"
            type="text"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label text-label text-secondary">Last Name *</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full h-12 px-4 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
            placeholder="Doe"
            type="text"
            required
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label text-label text-secondary">Phone Number *</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full h-12 px-4 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
            placeholder="+1 (555) 000-0000"
            type="tel"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label text-label text-secondary">City *</label>
          <input
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full h-12 px-4 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
            placeholder="New York"
            type="text"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label text-label text-secondary">Street Address *</label>
          <input
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
            className="w-full h-12 px-4 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
            placeholder="123 Gastronomy Lane"
            type="text"
            required
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label text-label text-secondary">Delivery Instructions (Optional)</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
            placeholder="Apartment buzzer, gate code, etc."
            rows="3"
          ></textarea>
        </div>
      </form>

      {/* Delivery Preference */}
      <div className="mt-8">
        <h4 className="font-bold text-body mb-4 text-on-surface">Delivery Preference</h4>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setDeliveryPreference('meet')}
            className={`flex items-center justify-center gap-3 p-4 border-2 rounded-xl transition-all ${
              deliveryPreference === 'meet'
                ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant'
                : 'border-outline-variant bg-surface-container-lowest text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">door_front</span>
            <span className="font-button text-sm font-semibold">Meet at door</span>
          </button>
          <button
            onClick={() => setDeliveryPreference('leave')}
            className={`flex items-center justify-center gap-3 p-4 border-2 rounded-xl transition-all ${
              deliveryPreference === 'leave'
                ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant'
                : 'border-outline-variant bg-surface-container-lowest text-secondary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined">package_2</span>
            <span className="font-button text-sm font-semibold">Leave at door</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default DeliveryForm;
