import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-inverse-surface w-full py-stack_lg px-margin_desktop mt-stack_lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-container_max mx-auto">
        {/* Brand Col */}
        <div className="col-span-1 md:col-span-1">
          <div className="font-h3 text-h3 text-primary-fixed font-bold mb-stack_md">Foodora</div>
          <p className="font-small text-small text-surface-variant/80 mb-stack_md">
            Delivering happiness, one meal at a time.
          </p>
          <div className="font-small text-small text-on-primary">
            © 2024 Foodora. All rights reserved.
          </div>
        </div>
        {/* Links */}
        <div className="col-span-1 md:col-span-3 flex flex-col md:flex-row gap-gutter justify-end">
          <div className="flex flex-col gap-2">
            <span className="font-button text-button text-primary-fixed mb-2">Company</span>
            <a className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all cursor-pointer" href="#">Company</a>
            <a className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all cursor-pointer" href="#">Careers</a>
            <a className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all cursor-pointer" href="#">Blog</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-button text-button text-primary-fixed mb-2">Support</span>
            <a className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all cursor-pointer" href="#">Support</a>
            <a className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all cursor-pointer" href="#">Help Center</a>
            <a className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all cursor-pointer" href="#">Contact Us</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-button text-button text-primary-fixed mb-2">Legal</span>
            <a className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all cursor-pointer" href="#">Legal</a>
            <a className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all cursor-pointer" href="#">Privacy Policy</a>
            <a className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all cursor-pointer" href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
