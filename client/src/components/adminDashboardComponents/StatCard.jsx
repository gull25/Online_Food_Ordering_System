import React from 'react';

const StatCard = ({ icon, trendText, trendUp, title, value, colorClass, iconColorClass }) => {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${colorClass} rounded-xl ${iconColorClass} flex`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trendText && (
          <span className={`flex items-center ${trendUp ? 'text-tertiary' : 'text-primary'} font-label text-label`}>
            {trendUp !== undefined && (
              <span className="material-symbols-outlined !text-sm mr-1">
                {trendUp ? 'trending_up' : 'trending_down'}
              </span>
            )}
            {trendText}
          </span>
        )}
      </div>
      <p className="font-label text-label text-secondary uppercase tracking-tight mb-1">
        {title}
      </p>
      <h3 className="font-h2 text-[28px] text-on-surface font-bold">{value}</h3>
    </div>
  );
};

export default StatCard;
