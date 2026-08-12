import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../common/Icon';
import Modal from '../Modals/Modal';
import api from '../../api/axios';
import { Skeleton, SkeletonCircle } from '../common/Skeleton';

const MenuItemModal = ({ item, isOpen, onClose, onAddToCart }) => {
  const [selectedSizeName, setSelectedSizeName] = useState(null);
  const [selectedAddOnNames, setSelectedAddOnNames] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  /*
   * Selections are keyed on the item and reset when it changes.
   *
   * They used to live in `useState(item?.sizes?.[0])`, which React only
   * evaluates on the first mount. Because this component stays mounted and is
   * driven by `isOpen`, opening a second dish carried over the first dish's
   * size and add-ons — and since those names do not exist on the new item, the
   * server rejected the order with "not an option for <item>". The add-ons also
   * silently kept charging for the previous dish's extras until then.
   */
  useEffect(() => {
    if (!isOpen || !item) return;

    setSelectedSizeName(item.sizes?.[0]?.name ?? null);
    setSelectedAddOnNames([]);
    setQuantity(1);
  }, [isOpen, item?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen || !item?._id) return undefined;

    let cancelled = false;
    setLoadingReviews(true);
    setReviews([]);

    api
      .get(`/reviews/item/${item._id}`, { params: { limit: 10 } })
      .then((response) => {
        // Guarded: opening two items quickly could otherwise land the first
        // request's reviews under the second item.
        if (!cancelled) setReviews(response.data.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingReviews(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, item?._id]);

  const selectedSize = useMemo(
    () => item?.sizes?.find((size) => size.name === selectedSizeName) ?? null,
    [item, selectedSizeName]
  );

  const selectedAddOns = useMemo(
    () => (item?.addOns ?? []).filter((addOn) => selectedAddOnNames.includes(addOn.name)),
    [item, selectedAddOnNames]
  );

  const unitPrice = useMemo(() => {
    if (!item) return 0;
    return (
      item.price +
      (selectedSize?.additionalPrice ?? 0) +
      selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0)
    );
  }, [item, selectedSize, selectedAddOns]);

  if (!isOpen || !item) return null;

  const requiresSize = (item.sizes?.length ?? 0) > 0;
  const canAdd = !requiresSize || Boolean(selectedSize);
  const total = unitPrice * quantity;

  const toggleAddOn = (name) =>
    setSelectedAddOnNames((current) =>
      current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name]
    );

  const handleAddToCart = () => {
    if (!canAdd) return;
    // The cart holds one line per configuration, so a quantity of N is N adds.
    for (let index = 0; index < quantity; index += 1) {
      onAddToCart({ ...item, selectedSize, selectedAddOns });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.name}
      size="xl"
      footer={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-outline-variant bg-surface-container-low p-1">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity === 1}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-40"
            >
              <Icon name="remove" className="text-[18px]" />
            </button>
            <span aria-live="polite" className="w-8 text-center font-button text-button font-bold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(50, value + 1))}
              disabled={quantity === 50}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-40"
            >
              <Icon name="add" className="text-[18px]" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAdd}
            className="flex h-13 flex-1 items-center justify-between gap-2 rounded-xl bg-primary px-6 font-button text-button font-bold text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{canAdd ? 'Add to cart' : 'Choose a size'}</span>
            <span>${total.toFixed(2)}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-stack_lg">
        {/* Artwork. `aspect-video` replaces the fixed h-64, so the frame scales
            with the panel instead of leaving a tall empty box on small phones. */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-high">
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="aspect-video w-full object-contain p-4 drop-shadow-md"
          />
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            {item.numReviews > 0 ? (
              <span className="flex items-center gap-1">
                <Icon name="star" filled className="text-[16px] text-warning" />
                <span className="font-button text-button font-bold text-on-surface">
                  {item.rating?.toFixed(1)}
                </span>
                <span className="font-label text-label text-secondary">
                  ({item.numReviews} rating{item.numReviews === 1 ? '' : 's'})
                </span>
              </span>
            ) : (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-label text-label font-bold text-primary">
                New
              </span>
            )}

            {item.vegNonVeg && item.vegNonVeg !== 'N/A' && (
              <span className="rounded-full border border-outline-variant px-2.5 py-1 font-label text-label text-on-surface-variant">
                {item.vegNonVeg}
              </span>
            )}

            <span className="font-button text-button font-bold text-primary">
              ${item.price.toFixed(2)}
            </span>
          </div>

          <p className="font-body text-body text-secondary">{item.description}</p>
        </div>

        {requiresSize && (
          <fieldset>
            <legend className="mb-3 flex w-full items-center justify-between rounded-lg bg-surface-container-high px-4 py-2 font-h3 text-h3 font-bold text-on-surface">
              <span>Choose size</span>
              <span className="font-label text-label font-semibold text-error">Required</span>
            </legend>

            <div className="space-y-2">
              {item.sizes.map((size) => (
                <label
                  key={size.name}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-outline-variant p-3 transition-all hover:border-primary has-checked:border-primary has-checked:bg-primary/5"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`size-${item._id}`}
                      value={size.name}
                      checked={selectedSizeName === size.name}
                      onChange={() => setSelectedSizeName(size.name)}
                      className="h-5 w-5 accent-primary"
                    />
                    <span className="font-body font-bold text-on-surface">{size.name}</span>
                  </span>
                  {size.additionalPrice > 0 && (
                    <span className="font-body text-small text-secondary">
                      +${size.additionalPrice.toFixed(2)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {item.addOns?.length > 0 && (
          <fieldset>
            <legend className="mb-3 flex w-full items-center justify-between rounded-lg bg-surface-container-high px-4 py-2 font-h3 text-h3 font-bold text-on-surface">
              <span>Add-ons</span>
              <span className="font-label text-label font-normal text-secondary">Optional</span>
            </legend>

            <div className="space-y-2">
              {item.addOns.map((addOn) => (
                <label
                  key={addOn.name}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-outline-variant p-3 transition-all hover:border-primary has-checked:border-primary has-checked:bg-primary/5"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAddOnNames.includes(addOn.name)}
                      onChange={() => toggleAddOn(addOn.name)}
                      className="h-5 w-5 rounded accent-primary"
                    />
                    <span className="font-body text-on-surface">{addOn.name}</span>
                  </span>
                  <span className="font-body text-small text-secondary">
                    +${addOn.price.toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <section className="border-t border-outline-variant pt-stack_md">
          <h3 className="mb-4 flex items-center gap-2 font-h3 text-h3 font-bold text-on-surface">
            <Icon name="chat" className="text-primary" />
            <span>Customer reviews</span>
          </h3>

          {loadingReviews ? (
            /* Skeletons shaped like the rows they replace, rather than the
               centred spinner that gave no sense of what was coming. */
            <div className="space-y-3">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl border border-outline-variant p-4"
                >
                  <SkeletonCircle size={32} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <ul className="space-y-3">
              {reviews.map((review) => (
                <li
                  key={review._id}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {review.user?.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt=""
                          loading="lazy"
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        /* Rendered locally rather than fetched from
                           ui-avatars.com — that placed a third-party request on
                           every review row, leaking who is reading what. */
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-button text-label font-bold text-primary"
                        >
                          {(review.user?.name ?? 'C').charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-button text-small font-bold text-on-surface">
                          {review.user?.name ?? 'Customer'}
                        </p>
                        <p className="font-label text-label text-secondary">
                          {new Date(review.createdAt).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <span className="flex shrink-0 items-center gap-1">
                      <Icon name="star" filled className="text-[14px] text-warning" />
                      <span className="font-button text-small font-bold text-on-surface">
                        {review.rating}
                      </span>
                    </span>
                  </div>

                  {review.comment && (
                    <p className="font-body text-small text-on-surface-variant">{review.comment}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-6 text-center">
              <Icon name="inbox" className="mb-2 text-[32px] text-on-surface-variant" />
              <p className="font-body text-small text-secondary">
                No reviews yet — order it and be the first.
              </p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
};

export default MenuItemModal;
