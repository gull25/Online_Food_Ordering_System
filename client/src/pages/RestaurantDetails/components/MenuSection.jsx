import React, { useState } from 'react';
import FoodCard from '../../../components/ui/FoodCard/FoodCard';
import MenuItemModal from '../../../components/ui/MenuItemModal/MenuItemModal';

const MenuSection = ({ MENU_CATEGORIES, itemsByCategory, searchQuery, cart, addToCart, removeFromCart, filteredItems }) => {
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  const handleAddClick = (item) => {
    if ((item.sizes && item.sizes.length > 0) || (item.addOns && item.addOns.length > 0)) {
      setSelectedItemForModal(item);
    } else {
      addToCart(item);
    }
  };

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
                {categoryItems.map((item) => {
                  // For a base item in the cart, count total quantity across all variations
                  // This allows the + / - on the food card to still function if there are no variations,
                  // or just show "total in cart" if there are variations.
                  // Actually, for variation items, the FoodCard should probably just show an Add button.
                  // But for now, we'll pass cartQty = 0 so it always shows "+ Add" if it has variations.
                  const hasVariations = (item.sizes && item.sizes.length > 0) || (item.addOns && item.addOns.length > 0);
                  const cartQty = hasVariations ? 0 : (cart[item._id || item.id]?.quantity || 0);
                  
                  return (
                    <FoodCard
                      key={item._id || item.id}
                      item={item}
                      cartQty={cartQty}
                      onAdd={() => handleAddClick(item)}
                      onRemove={() => removeFromCart(item._id || item.id)}
                    />
                  );
                })}
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

      {/* Variation Modal */}
      <MenuItemModal
        item={selectedItemForModal}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onAddToCart={addToCart}
      />
    </>
  );
};

export default MenuSection;
