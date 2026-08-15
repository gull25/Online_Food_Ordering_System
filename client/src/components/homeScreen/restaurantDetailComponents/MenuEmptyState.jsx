import React from 'react';
import Icon from '../../common/Icon';

const MenuEmptyState = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center">
      <Icon name="menu_book" className="text-6xl text-surface-variant mb-4" />
      <h3 className="text-h3 font-h3 mb-2 text-on-surface">Menu Unavailable</h3>
      <p className="text-body font-body text-secondary max-w-md mx-auto">
        This restaurant hasn't added any menu items yet or is currently updating their offerings.
      </p>
    </div>
  );
};

export default MenuEmptyState;
