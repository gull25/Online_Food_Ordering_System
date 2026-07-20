import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ addressInput, setAddressInput }) => {
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (addressInput.trim()) {
      navigate('/restaurant/bella-cucina');
    }
  };

  return (
    <section className="relative w-full min-h-[600px] flex items-center overflow-hidden animate-section">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2AkxEVzhnfZ6ds67loIzbblNyQrrPF9RA3p3SAEui2dH4Yam1aYhs1Ybz-IgN3cdRJEdu4i8fhAnIblVbhhhMB3e-Z57oLgLtA2dWGNj3_Utmtm9Rq09Pcy-EiiuijMVOntlPPp03KOjtk2EcqYKbL2KEwIyHHi1rVALDddGu_ifUR0K50uZgE58GvrMabvR_HbRzt0FzobT1DysnHCFTI6rF9eOlz82tY9zc6JSpQwRixPQo7xXxwQ')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
      </div>
      <div className="relative z-10 max-w-container_max mx-auto px-margin_desktop w-full py-stack_lg">
        <div className="max-w-2xl">
          <h1 className="font-h1 text-h1 text-on-background mb-stack_md">
            Delicious meals, <br />
            <span className="text-primary-container">delivered to your door.</span>
          </h1>
          <p className="text-body font-body text-secondary mb-stack_lg max-w-lg">
            Experience the finest culinary delights from your favorite local restaurants. Fast delivery, fresh food, and endless variety.
          </p>
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-0 bg-white p-2 rounded-2xl shadow-lg ring-1 ring-black/5 max-w-xl">
            <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-outline-variant py-3 md:py-0">
              <span className="material-symbols-outlined text-primary-container mr-2">location_on</span>
              <input
                className="w-full border-none focus:ring-0 text-body bg-transparent outline-none"
                placeholder="Enter delivery address"
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary-container text-on-primary-container font-button px-stack_lg py-4 rounded-xl hover:opacity-90 transition-all active:scale-95 m-1"
            >
              Find Food
            </button>
          </form>
          <div className="mt-stack_lg flex items-center gap-stack_md">
            <div className="flex -space-x-3">
              <div
                className="w-10 h-10 rounded-full border-2 border-white bg-surface-container bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC5CsuJYjpv13-lhlNJndSKRXGbmjz8GcbnNCH8sGaCwawA_72IeEonmHtedYKWzYa27JN0nDU7DvpL-Ff35Si704T0LnPYxsJxXpOnxPTFwguhk41Q0-D3HXvdxgI3qnsGNypZXrh_utpAaE_TLzQHxJp730HnUQHy-05BqsJFecDfCCgJNpcS-Tk2VPgTIt9CojLGAoeQqrFIhw0CXPs-f0Ip-aN_aBJ2zLyhzbjBJcCR_i6OUYmTZA')`,
                }}
              ></div>
              <div
                className="w-10 h-10 rounded-full border-2 border-white bg-surface-container bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB3WGnYcQuPMV9i47CjYGaeKl9crM02gR9sG5mmZIH5KXtMRjQr2dKGQEV0nDIYyWRoDZbCYDPz2pgiWdCrswE6AMa10_lHYOJqMSywbyOor_RMoWtTWejDxFErlg9ycYVxmS2jjyBEZq_kEwlnzHFdNJgNXU76D2Vgh9MEzrnrp8GbLQblB7faWMjgADpuXLrIogEFLOlLj0pbYynU03EoJLT8zNeFDianTkKo-40aUdkP218HtxtHqg')`,
                }}
              ></div>
              <div
                className="w-10 h-10 rounded-full border-2 border-white bg-surface-container bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVtUDFDJjz57hMTBppoK6fP0fiCy9luILdYn6OiXcIEcacfJmW3-QAN4huoxXX6BcSY41slhaeNK85O8ggbcAqAnfr96KqdyOCP2ISMa1gVTt8OIacvxbUn6lw5ecRfZ_8PZK46gbdL4Ar8hJ0if7ovjGZ1eYjrEzor6hm5ahGi3rVjlOZWAttcxxymF9cA4D35Fl_2YaXKrlBO243CW7UxiPumTwbFyOnrwikF5wAy-w6x5DsmkF4_A')`,
                }}
              ></div>
            </div>
            <p className="text-small font-small text-secondary">
              <span className="font-bold text-on-background">50k+</span> satisfied foodies near you
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
