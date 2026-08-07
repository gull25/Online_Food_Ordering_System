import React from 'react';
import Icon from '../../common/Icon';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../../constants';

const FOOTER_SECTIONS = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: null },
      { label: 'Careers', to: null },
      { label: 'Partner with us', to: null },
      { label: 'Ride with us', to: null },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: null },
      { label: 'Track an order', to: APP_ROUTES.TRACK_ORDER },
      { label: 'My orders', to: APP_ROUTES.ORDERS },
      { label: 'Refund Policy', to: null },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', to: null },
      { label: 'Privacy Policy', to: null },
      { label: 'Cookie Policy', to: null },
      { label: 'Accessibility', to: null },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: 'Foodora on Facebook', icon: 'thumb_up' },
  { label: 'Foodora on Instagram', icon: 'photo_camera' },
  { label: 'Share Foodora', icon: 'share' },
];

/**
 * Site footer.
 *
 * Deliberately dark in both themes: `--color-inverse-surface` is not remapped
 * by the dark palette, so this stays a dark slate panel whether the app is in
 * light or dark mode, and `inverse-on-surface` is its matching light ink.
 *
 * The previous version painted white text over a background that swapped to
 * the lowest surface container under a dark-mode variant. Because Tailwind's
 * dark variant keys off the OS rather than this app's theme class, that
 * background could resolve to white while the text stayed white — an entirely
 * invisible footer. Using a token pair that is correct in both themes removes
 * the possibility rather than patching the symptom.
 */
const HomeFooter = () => {
  const linkClass =
    'text-inverse-on-surface/75 hover:text-primary-fixed hover:underline transition-colors text-small w-fit';

  return (
    <footer className="bg-inverse-surface text-inverse-on-surface w-full py-stack_lg px-margin_mobile md:px-margin_desktop">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter max-w-container_max mx-auto">
        <div className="flex flex-col gap-stack_md">
          <Link
            to={APP_ROUTES.HOME}
            className="font-h3 text-h3 text-primary-fixed font-bold w-fit hover:opacity-90 transition-opacity"
          >
            Foodora
          </Link>
          <p className="text-inverse-on-surface/75 text-small max-w-xs">
            Bringing the best flavors to your doorstep since 2014. Quality and speed in every bite.
          </p>
          <div className="flex gap-stack_sm">
            {SOCIAL_LINKS.map((social) => (
              <button
                key={social.icon}
                type="button"
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-inverse-on-surface/10 flex items-center justify-center text-inverse-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors"
              >
                <Icon name={social.icon} className="text-[20px]" />
              </button>
            ))}
          </div>
        </div>

        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-stack_sm">
            <h4 className="text-inverse-on-surface font-bold mb-2">{section.title}</h4>
            {section.links.map((link) =>
              link.to ? (
                <Link key={link.label} to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href="#" className={linkClass}>
                  {link.label}
                </a>
              )
            )}
          </div>
        ))}
      </div>

      <div className="max-w-container_max mx-auto mt-stack_lg pt-stack_lg border-t border-inverse-on-surface/15 flex flex-col md:flex-row justify-between items-center gap-stack_md">
        <p className="text-inverse-on-surface/75 text-small">
          © {new Date().getFullYear()} Foodora. All rights reserved.
        </p>
        <div className="flex gap-stack_lg">
          <span className="text-inverse-on-surface/50 text-small">English (US)</span>
          <span className="text-inverse-on-surface/50 text-small">USD ($)</span>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
