import React from 'react';

const MobileCategoryNav = ({ MENU_CATEGORIES, activeCategory, scrollToCategory }) => {
  return (
    <div className="md:hidden flex overflow-x-auto hide-scrollbar gap-2 pb-2">
      {MENU_CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => scrollToCategory(category.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-button text-button border transition-all ${
              isActive
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface-container-lowest border-surface-variant text-on-surface'
            }`}
          >
            {category.name} {category.badge || ''}
          </button>
        );
      })}
    </div>
  );
};

export default MobileCategoryNav;
