import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const CuratedCollectionsSection = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await api.get('/public/collections');
        // Combine offers and categories, take up to 3
        const combined = [...(response.data.data.offers || []), ...(response.data.data.categories || [])].slice(0, 3);
        setCollections(combined);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <section className="py-stack_lg animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <h2 className="font-h2 text-h2 text-on-background mb-stack_lg">Curated Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 bg-surface-container rounded-2xl animate-pulse"></div>
                ))
              ) : collections.length === 0 ? (
                <p className="text-secondary p-4 col-span-3">No collections available right now.</p>
              ) : (
                collections.map((item, index) => {
                  const isOffer = item.discountPercentage !== undefined;
                  const label = isOffer ? 'Offer' : 'Category';
                  const labelClass = isOffer ? 'bg-primary' : 'bg-tertiary';
                  const title = item.title || item.name;
                  const desc = item.description || (isOffer ? `${item.discountPercentage}% OFF` : `Explore ${title}`);
                  const image = item.image && item.image !== 'no-photo.jpg' ? item.image : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';

                  return (
                    <div
                      key={item._id || index}
                      onClick={() => navigate('/auth')}
                      className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
                    >
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                        style={{ backgroundImage: `url('${image}')` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 text-white">
                        <span className={`${labelClass} px-3 py-1 rounded-full text-label font-label mb-2 inline-block`}>{label}</span>
                        <h3 className="font-h2 text-h3 font-bold">{title}</h3>
                        <p className="text-small opacity-80">{desc}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
  );
};

export default CuratedCollectionsSection;
