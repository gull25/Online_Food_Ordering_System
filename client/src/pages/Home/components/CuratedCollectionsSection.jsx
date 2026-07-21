import React from 'react';
import { useNavigate } from 'react-router-dom';

const CuratedCollectionsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-stack_lg animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <h2 className="font-h2 text-h2 text-on-background mb-stack_lg">Curated Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Collection 1 */}
              <div
                onClick={() => navigate('/auth')}
                className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
              >
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBkcCSQjv9f_t-y4OcqBzDvGVgmbMDcvInqqoyAYPfcM7tGyA3ICj_ysmv1Hs-oVTNWFRToP6vEplT3TzP4J3k89mPSzSgTeaH__Dfs-qa5LaSP-AXs1w4Hn_xZSPbptz0NnIVldaGcS2RFNSfyERNu-cf777fglOShbjHB9BYLCPZ9j48vShsyeeDrnKzPFKFw1DSV3btqTjaFNwJ1dzBPyjlhvfA5bhTY8fOlBqLUuNWJCNqf7tNDPA')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="bg-tertiary px-3 py-1 rounded-full text-label font-label mb-2 inline-block">Healthy</span>
                  <h3 className="font-h2 text-h3 font-bold">Healthy Bites</h3>
                  <p className="text-small opacity-80">Guilt-free delicious options</p>
                </div>
              </div>

              {/* Collection 2 */}
              <div
                onClick={() => navigate('/auth')}
                className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
              >
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4psLLZ6Ng0QAmqWxLchsxJUHBQizAR_zHNhz8DVo7tLxsg0oHSJnHN6MT3f1HiL_HxuGEh8eWz_9c9gIzW1HvCDZCDUEUCgjzS-E_49ugrP_w3Wb570qYiu3Oz91ioEOf77-xLWc0Q_3ZdE22vQNf-6x5yMrOTblMPBZSAGv4hE42JhRSD-FDbOqO2_QQf5rwUAXbZAxhNZ-KY1k9J5JcFRlugu_X3D8Qfx-JZ6WKEMIGYYkTn0PkaQ')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="bg-primary px-3 py-1 rounded-full text-label font-label mb-2 inline-block">Late Night</span>
                  <h3 className="font-h2 text-h3 font-bold">Midnight Cravings</h3>
                  <p className="text-small opacity-80">Open now for your hunger</p>
                </div>
              </div>

              {/* Collection 3 */}
              <div
                onClick={() => navigate('/auth')}
                className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
              >
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB0_z76Zmu2hNW_j3uun1fnWJ_sieOkQXjphvEtOwpQ2aSL8c8Xf6gQuMsHp9-33kTRzy_z9_1CbTzorShV48y1hgBblE3yX1wiZl3xw_fJunrSwY4GABM7sv8eDU-F-dylPnMjVCIxlDbUKtavUTk69mELsNaJqB5HsJQrpvTxUH5e7rZqlJsHPoypO1Zq2QbuomWkIiTVy8aepOHj60GYz0rZDlhQN1iZ_1AftAfCkdSrawc00etKrA')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="bg-secondary px-3 py-1 rounded-full text-label font-label mb-2 inline-block">Premium</span>
                  <h3 className="font-h2 text-h3 font-bold">Top Rated Near You</h3>
                  <p className="text-small opacity-80">Local favorites with 5 stars</p>
                </div>
              </div>
            </div>
          </div>
        </section>
  );
};

export default CuratedCollectionsSection;
