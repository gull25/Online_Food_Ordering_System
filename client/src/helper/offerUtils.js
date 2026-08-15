/**
 * Resolves a usable image for an offer card.
 *
 * The API stores 'no-photo.jpg' as its "no image" sentinel and may omit the
 * field entirely. The previous expression (`offer.image !== 'no-photo.jpg'`)
 * was true for `undefined` too, so cards with no image rendered `src={undefined}`
 * and showed a broken-image icon.
 */
export const getOfferImage = (offer) => {
  const candidates = [offer?.image, offer?.restaurantId?.image, offer?.restaurantId?.images?.banner];
  return candidates.find((src) => src && src !== 'no-photo.jpg') || null;
};
