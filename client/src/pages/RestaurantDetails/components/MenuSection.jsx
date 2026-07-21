import React from 'react';
import FoodCard from '../../../components/ui/FoodCard/FoodCard';

const MenuSection = ({ MENU_CATEGORIES, itemsByCategory, searchQuery, cart, addToCart, removeFromCart, filteredItems }) => {
  return (
    <>
      <div className="flex flex-col gap-stack_lg">
        {MENU_CATEGORIES.map((category) => {
          const categoryItems = itemsByCategory[category.id] || [];
          if (categoryItems.length === 0) {
            // If filtering hides all items, skip this section or show empty
            if (searchQuery.trim()) return null;

            // Otherwise, show standard category but with helper empty state
            return (
              <section key={category.id} id={category.id} className="scroll-mt-24">
                <h2 className="font-h2-mobile md:font-h2 text-h2-mobile md:text-h2 text-on-surface mb-stack_md">
                  {category.name} {category.badge || ''}
                </h2>
                <div className="bg-surface-container-lowest rounded-16 p-8 text-center border border-surface-variant">
                  <p className="text-secondary">No items available in this category currently.</p>
                </div>
              </section>
            );
          }

          return (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <h2 className="font-h2-mobile md:font-h2 text-h2-mobile md:text-h2 text-on-surface mb-stack_md">
                {category.name} {category.badge || ''}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack_md">
                {categoryItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    cartQty={cart[item.id]?.quantity || 0}
                    onAdd={addToCart}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Empty search state */}
      {filteredItems.length === 0 && (
        <div className="bg-surface-container-lowest rounded-16 p-12 text-center border border-surface-variant mt-8">
          <span className="material-symbols-outlined text-4xl text-on-secondary-container mb-2">
            search_off
          </span>
          <h3 className="font-h3 text-h3 text-on-surface mb-2">No matching dishes found</h3>
          <p className="text-secondary max-w-md mx-auto">
            We couldn't find any dishes matching "{searchQuery}". Try checking the spelling or
            using different terms.
          </p>
        </div>
      )}
    </>
  );
};

export default MenuSection;
