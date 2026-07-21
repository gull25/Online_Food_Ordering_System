import React from 'react';
import { useNavigate } from 'react-router-dom';

const TrendingSection = () => {
  const navigate = useNavigate();

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
              {/* Dish Card 1 */}
              <div
                onClick={() => navigate('/auth')}
                className="min-w-[280px] bg-white rounded-2xl border border-outline-variant hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="h-48 rounded-t-2xl overflow-hidden relative">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCg7GLVL0BdBOFRo8zKJ8dZw7xYYuNtCr2rc2Mie1tGYfaa0YUcpVzF_jS-XEZLtdc6opZAMih-1Q9f2BED51H7d-Pqmgi5y0wa0TFur-Cf56vo2FSH6DpLi6k4zkWdrn0ovu95H6v2zbczDY6bXrpHDBk0-fUgIeYaB3lbAteeV-Gh2G6igL0hNyGs1rSUse1wrM4Q_UJOT3cCwtwW91sdHUOqzw1dMk_4iGNGCAWyZm_KfBjD-od__g')`,
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/90 glass-effect px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] fill">star</span> 4.9
                  </div>
                </div>
                <div className="p-stack_md">
                  <h3 className="font-h3 text-body font-bold text-on-background">Truffle Umami Burger</h3>
                  <p className="text-small font-small text-secondary mb-3">Burger King • $12.99</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/auth');
                    }}
                    className="w-full py-2 border-2 border-primary-container text-primary-container font-button rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Add to Order
                  </button>
                </div>
              </div>

              {/* Dish Card 2 */}
              <div
                onClick={() => navigate('/auth')}
                className="min-w-[280px] bg-white rounded-2xl border border-outline-variant hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="h-48 rounded-t-2xl overflow-hidden relative">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBGD3nSaowLOXhlZH5JGHYHjvYNe-WBTTCUsZerqJwh75dJJncj6XszCopvXq9eCmxkQd2boHj1tfoWfxJ_BPyU-cjtAjXSlEm8Hi0m9Raa9Nu9MHMVI6sPjabVjeqIwWIV7u7p5yb1v9pBZqkMPA5VsYwwjgH3hVN9t4Mb84yG0kLciapopykryo7lWWkjKRMrjRbbB_c_084lPBCN-S2To1wez5fhj2T3atg7dHdgLgAqsnTQLCKDfQ')`,
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/90 glass-effect px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] fill">star</span> 4.7
                  </div>
                </div>
                <div className="p-stack_md">
                  <h3 className="font-h3 text-body font-bold text-on-background">Spicy Salmon Poke</h3>
                  <p className="text-small font-small text-secondary mb-3">Island Bowls • $15.50</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/auth');
                    }}
                    className="w-full py-2 border-2 border-primary-container text-primary-container font-button rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Add to Order
                  </button>
                </div>
              </div>

              {/* Dish Card 3 */}
              <div
                onClick={() => navigate('/auth')}
                className="min-w-[280px] bg-white rounded-2xl border border-outline-variant hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="h-48 rounded-t-2xl overflow-hidden relative">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB_UGxlISZhdH74fls00N6sv-Xlx6kNCFPr4-z1-rxVP-rMOp8qh4cr_0_kszA8FnY7kFREBxMc3ZYoqqzh0qIFOMHIvVxI4k0Dmek-apzuJBGnj8h0daHs8_z0WO1fzcYt7s-4uVc168rK7Qr3SmrqB9Xt1IzL9ZNQ0MgGeZ-aTPmAoF9VJvYI8u751N4DYYF8Uk20FURXIIMmAGiEWjlLnTZ3BaV5v-gE4a4xEv3SC6_0ECtbKdj0wQ')`,
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/90 glass-effect px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] fill">star</span> 4.8
                  </div>
                </div>
                <div className="p-stack_md">
                  <h3 className="font-h3 text-body font-bold text-on-background">Margherita Verace</h3>
                  <p className="text-small font-small text-secondary mb-3">Pasta & Co • $14.00</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/auth');
                    }}
                    className="w-full py-2 border-2 border-primary-container text-primary-container font-button rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Add to Order
                  </button>
                </div>
              </div>

              {/* Dish Card 4 */}
              <div
                onClick={() => navigate('/auth')}
                className="min-w-[280px] bg-white rounded-2xl border border-outline-variant hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="h-48 rounded-t-2xl overflow-hidden relative">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbxJjE15VsmMJAfJIme5I_nZqbuWLpulyaPW_5NaSWux89uae6w3EERaAupzPD1uZ--CFF_CJPuA_bvSuavbkth70XeLZBpdDnoGwd954cq_rcCcRu8iWjB8X3Q_wkQjGM78-PtV5GzbqZh6BflOHMVBKuTMoOQgw6xcK6BvRn56vn7Mnvnoh_d9eWFw4P2Z_h-Z3q91T557v0lQzNjHuPQyWNUxQuN3zeYW6DvUIdzi2fc2uOuwn-SQ')`,
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/90 glass-effect px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] fill">star</span> 4.9
                  </div>
                </div>
                <div className="p-stack_md">
                  <h3 className="font-h3 text-body font-bold text-on-background">Tonkotsu Special</h3>
                  <p className="text-small font-small text-secondary mb-3">Ramen Ichiraku • $16.20</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/auth');
                    }}
                    className="w-full py-2 border-2 border-primary-container text-primary-container font-button rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
  );
};

export default TrendingSection;
