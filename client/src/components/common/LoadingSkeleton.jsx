import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoadingSkeleton = () => {
  return (
    <div className="w-full h-screen flex flex-col p-6 bg-background">
      <div className="flex justify-between items-center mb-8">
        <Skeleton width={150} height={40} borderRadius={20} />
        <Skeleton width={200} height={40} borderRadius={20} />
      </div>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton height={200} borderRadius={16} />
            <Skeleton width="80%" height={24} />
            <Skeleton width="40%" height={20} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
