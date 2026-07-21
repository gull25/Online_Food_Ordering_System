import React from 'react';

const AppPromotionSection = () => {
  return (
    <section className="py-20 bg-inverse-surface text-on-primary animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="font-h1 text-h2 md:text-h1 mb-stack_md text-white">Take Foodora with you</h2>
                <p className="text-body opacity-80 mb-stack_lg text-white/95">
                  Get the best delivery experience with our mobile app. Track your order in real-time, get exclusive app-only discounts, and order with a single tap.
                </p>
                <div className="flex flex-wrap gap-stack_md items-center">
                  <img
                    className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
                    alt="Apple App Store download badge"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfTOWO1R67QD3aFj5Ato6lsUgwR00HXa5T4RsSufWJ3f3-WhZU3YzX1QVJD11jieY6Y1c0Jcye1J_GgqrVgXf_vygnYZwWuObRMdaKP1ewMpM9cWMpPjgLXIKJY1t6v7hBLNbTxJsH_3nWEl6wkS77qJkWne97F0JvY9TNrl8d1aw1M82cZqQry15WaKu_MQvnQd8Sh4kg-Hzjs0VLn1zw8jVCx5FvzB1rJCUu9SBdplQyTfJzfaW72Q"
                  />
                  <img
                    className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
                    alt="Google Play Store download badge"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdWvnAsryayKXmpO_xrY2QyHMu0fp_ziebDnBK-J9M9bGCmPtFOhbnw2KwBdkTg1fgmSZ0Y3IP9LfSomYnaD4_nuVW_07blTwGbvadET7vKtgmjNy0N6z_eDTofph_i7YzdKBTx1m0Ao7MevNiGgDrWmBl_W5LuBq1MCVThC-CWhCKI2iSlsovHen5WYFsfq3nlfSdHwKy1VbPSFMZQczEpI6CVo6BYb1ZUgiP3w4NLhCt2CCKQ9BOiw"
                  />
                </div>
                <div className="mt-stack_lg p-6 bg-white/10 rounded-2xl inline-flex items-center gap-6 backdrop-blur-sm">
                  <div className="bg-white p-2 rounded-xl">
                    <img
                      className="w-24 h-24"
                      alt="Foodora QR Code"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8i7g1OicgQKRGhM--_VXc4YjwrRleZPHUw8M5kV9GgXjf0bC8F9NV35Enn2E67CaiBCT9raatwB9Nt6KpOf_Djm5bx9dPeyURvOALmr7VZ2NT-iYhcKl4GmgewS26nlvZyASSmolQdgQBHSJ0BwYiQBtB_StSDIcWMGp7QipZFixMZMjKWleIKJKz_028eP1vegP7FxoO5o7isd1MJKtGbKyDBbWzRPxHl8HDqaFqXc1tcSk1z_Csiw"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-body text-white">Scan to download</p>
                    <p className="text-small opacity-70 text-white/80">Available for iOS &amp; Android</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="relative z-10 w-full max-w-sm mx-auto">
                  <img
                    className="w-full drop-shadow-2xl"
                    alt="Smartphone App Mockup"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL663zqzTVmvIMmka4NYhmo9SHL8N7-1-AepZ6_GUFy1z2H06Oc71UwH5b79JujQ6IC-K_e3UY2TGryKJf24K0RE38_Q-bNcKZ1m8wcan7VDo_4jxblVI8qkx91rzWmUVXMfDV6PctMEsH6Ap_gChNc7j1DnqmjBzb8uLQWsGeX0yPAIjZk1mldf9esya391tLOqpbOhBGLSLwULsn2hAghs8AABX1r6GZF6KB3n6eoz3WI_bkcAnEnA"
                  />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-container/20 rounded-full blur-[100px] z-0"></div>
              </div>
            </div>
          </div>
        </section>
  );
};

export default AppPromotionSection;
