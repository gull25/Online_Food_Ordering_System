import React from 'react';

const HomeFooter = () => {
  return (
    <footer className="bg-inverse-surface dark:bg-surface-container-lowest w-full py-stack_lg px-margin_desktop">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-container_max mx-auto">
        <div className="flex flex-col gap-stack_md">
          <span className="font-h3 text-h3 text-primary-fixed font-bold">Foodora</span>
          <p className="text-surface-variant/80 text-small">
            Bringing the best flavors to your doorstep since 2014. Quality and speed in every bite.
          </p>
          <div className="flex gap-stack_md">
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary-container transition-all">
              <span className="material-symbols-outlined text-body">face_nod</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary-container transition-all">
              <span className="material-symbols-outlined text-body">photo_camera</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary-container transition-all">
              <span className="material-symbols-outlined text-body">share</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-stack_sm">
          <h4 className="text-white font-bold mb-2">Company</h4>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">About Us</a>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Careers</a>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Partner with us</a>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Ride with us</a>
        </div>
        <div className="flex flex-col gap-stack_sm">
          <h4 className="text-white font-bold mb-2">Support</h4>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Help Center</a>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Safety</a>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Contact Support</a>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Refund Policy</a>
        </div>
        <div className="flex flex-col gap-stack_sm">
          <h4 className="text-white font-bold mb-2">Legal</h4>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Terms of Service</a>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Privacy Policy</a>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Cookie Policy</a>
          <a className="text-surface-variant/80 hover:text-primary-fixed transition-all hover:underline text-small" href="#">Accessibility</a>
        </div>
      </div>
      <div className="max-w-container_max mx-auto mt-stack_lg pt-stack_lg border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-stack_md">
        <p className="text-surface-variant/80 text-small">© 2024 Foodora. All rights reserved.</p>
        <div className="flex gap-stack_lg">
          <span className="text-surface-variant/40 text-small">English (US)</span>
          <span className="text-surface-variant/40 text-small">USD ($)</span>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
