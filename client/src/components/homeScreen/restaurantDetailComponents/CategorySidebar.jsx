import React from 'react';

const CategorySidebar = ({ MENU_CATEGORIES, categoryCounts, activeCategory, scrollToCategory }) => {
  return (
    <aside className="md:col-span-3 hidden md:block">
      <div className="sticky top-[100px] bg-surface-container-lowest rounded-16 p-stack_md border border-surface-variant shadow-sm">
        <h3 className="font-h3 text-h3 text-on-surface mb-stack_md">Categories</h3>
        <nav className="flex flex-col gap-2">
          {MENU_CATEGORIES.map((category) => {
            const count = categoryCounts[category.id] || 0;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`w-full text-left px-4 py-3 rounded-12 transition-all font-button text-button flex justify-between items-center ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface hover:bg-surface-variant'
                }`}
              >
                <span>
                  {category.name} {category.badge || ''}
                </span>
                {count > 0 ? (
                  <span
                    className={`font-label text-label px-2 py-1 rounded-full ${
                      isActive ? 'bg-primary text-white' : 'bg-surface text-on-surface-variant'
                    }`}
                  >
                    {count}
                  </span>
                ) : (
                  <span className="text-on-surface-variant font-small text-small">-</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default CategorySidebar;
