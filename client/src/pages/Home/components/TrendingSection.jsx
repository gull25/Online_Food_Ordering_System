import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const TrendingSection = () => {
  const navigate = useNavigate();
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await api.get('/public/trending');
        setTrendingItems(response.data.data);
      } catch (error) {
        console.error('Failed to fetch trending items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <section className="py-stack_lg bg-surface-bright overflow-hidden animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <div className="flex justify-between items-end mb-stack_lg">
              <div>
                <h2 className="font-h2 text-h2 text-on-background">Trending Now</h2>
                <p className="text-body font-body text-secondary">The most ordered dishes in your area right now</p>
              </div>
              <div className="flex gap-stack_sm">
                <button className="p-2 rounded-full border border-outline hover:bg-surface-container transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 rounded-full border border-outline hover:bg-surface-container transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="flex gap-gutter overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="min-w-[280px] h-80 bg-surface-container rounded-2xl animate-pulse"></div>
                ))
              ) : trendingItems.length === 0 ? (
                <p className="text-secondary p-4">No trending items found right now.</p>
              ) : (
                trendingItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/restaurant/${item.restaurant?._id || item.restaurant}`)}
                    className="min-w-[280px] bg-white rounded-2xl border border-outline-variant hover:shadow-lg transition-all group cursor-pointer flex flex-col"
                  >
                    <div className="h-48 rounded-t-2xl overflow-hidden relative">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{
                          backgroundImage: `url(${item.image && item.image !== 'no-photo.jpg' ? item.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'})`,
                        }}
                      ></div>
                      <div className="absolute top-3 right-3 bg-white/90 glass-effect px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] fill">star</span> {item.restaurant?.rating || '4.5'}
                      </div>
                    </div>
                    <div className="p-stack_md flex flex-col flex-grow">
                      <h3 className="font-h3 text-body font-bold text-on-background line-clamp-1">{item.name}</h3>
                      <p className="text-small font-small text-secondary mb-3 line-clamp-1">{item.restaurant?.name || 'Local Restaurant'} • ${item.price.toFixed(2)}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/restaurant/${item.restaurant?._id || item.restaurant}`);
                        }}
                        className="mt-auto w-full py-2 border-2 border-primary-container text-primary-container font-button rounded-xl hover:bg-primary-container hover:text-white transition-all"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
  );
};

export default TrendingSection;
