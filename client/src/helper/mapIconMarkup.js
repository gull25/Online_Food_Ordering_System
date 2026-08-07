/**
 * SVG markup for Leaflet map pins.
 *
 * Leaflet DivIcons take an HTML string, not JSX, so they cannot use the <Icon>
 * component. These paths are the exact react-icons output for the same icons,
 * extracted at authoring time, so the map pins match the rest of the UI without
 * pulling react-dom/server into the browser bundle just to render three shapes.
 *
 * Previously these were Material Symbols ligature spans, which rendered the raw
 * words "restaurant" and "two_wheeler" inside the map markers until the icon
 * font loaded.
 */
const PATHS = {
  "restaurant": "<path fill=\"none\" d=\"M0 0h24v24H0z\"></path><path d=\"M16 6v8h3v8h2V2c-2.76 0-5 2.24-5 4m-5 3H9V2H7v7H5V2H3v7c0 2.21 1.79 4 4 4v9h2v-9c2.21 0 4-1.79 4-4V2h-2z\"></path>",
  "home": "<path fill=\"none\" d=\"M0 0h24v24H0z\"></path><path d=\"m12 5.69 5 4.5V18h-2v-6H9v6H7v-7.81zM12 3 2 12h3v8h6v-6h2v6h6v-8h3z\"></path>",
  "two_wheeler": "<path fill=\"none\" d=\"M0 0h24v24H0z\"></path><path d=\"M4.17 11H4zm9.24-6H9v2h3.59l2 2H11l-4 2-2-2H0v2h4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4l2 2h3l3.49-6.1 1.01 1.01c-.91.73-1.5 1.84-1.5 3.09 0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4c-.18 0-.36.03-.53.05L17.41 9H20V6l-3.72 1.86zM20 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2M4 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2\"></path>",
  "two_wheeler_filled": "<path fill=\"none\" d=\"M0 0h24v24H0z\"></path><path d=\"M20 11c-.18 0-.36.03-.53.05L17.41 9H20V6l-3.72 1.86L13.41 5H9v2h3.59l2 2H11l-4 2-2-2H0v2h4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4l2 2h3l3.49-6.1 1.01 1.01c-.91.73-1.5 1.84-1.5 3.09 0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4M4 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m16 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2\"></path>",
};

/** Returns an inline <svg> string sized and coloured for a map marker. */
export const iconMarkup = (name, { size = 16, color = 'currentColor' } = {}) => {
  const inner = PATHS[name];
  if (!inner) return '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ` +
    `width="${size}" height="${size}" fill="${color}" aria-hidden="true">${inner}</svg>`
  );
};

export default iconMarkup;
