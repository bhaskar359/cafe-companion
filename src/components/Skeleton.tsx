import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      style={style}
      className={`animate-pulse rounded-md bg-[#ebe8e2] dark:bg-[#2A231F] relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
    </div>
  );
};

// Menu Card Skeleton
export const MenuCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#FFFDF9] dark:bg-[#1C1714] rounded-2xl overflow-hidden shadow-sm border border-[#E3DACE]/60 dark:border-[#382F2A] flex flex-col justify-between p-0">
      <div>
        {/* Image skeleton */}
        <div className="relative w-full h-56 bg-[#ebe8e2] dark:bg-[#251F1B] animate-pulse">
          <div className="absolute top-3.5 left-3.5 flex gap-1.5">
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-20 h-5 rounded-full" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="p-6 space-y-3">
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-5/6 rounded-md" />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-[#E3DACE]/30 dark:border-[#382F2A]/60">
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
};

// Hero Pairing Curations Skeleton (for DiscoverView)
export const HeroPairingSkeleton: React.FC = () => {
  return (
    <div className="bg-[#FFFDF9] dark:bg-[#1C1714] rounded-2xl p-6 lg:p-8 shadow-sm border border-[#E3DACE]/60 dark:border-[#382F2A] flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Skeleton className="h-6 w-56 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {[1, 2].map(n => (
            <div
              key={n}
              className="flex items-center gap-4 p-3 rounded-xl bg-[#f6f3ed] dark:bg-[#251F1B] border border-transparent dark:border-[#382F2A]/60"
            >
              <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-[#E3DACE]/60 dark:border-[#382F2A] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <Skeleton className="h-3.5 w-32 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>
    </div>
  );
};

// Category Pills Skeleton
export const CategoryPillsSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
      {[80, 110, 130, 120, 100, 95].map((w, idx) => (
        <Skeleton key={idx} className="h-10 rounded-full" style={{ width: `${w}px` } as React.CSSProperties} />
      ))}
    </div>
  );
};

// AI Concierge Message & Recommendation Skeleton
export const ConciergeLoadingSkeleton: React.FC = () => {
  return (
    <div className="flex items-start gap-3.5 max-w-3xl">
      <div className="w-9 h-9 rounded-full bg-[#38271F] dark:bg-[#E07A5F] flex items-center justify-center shrink-0 shadow-sm mt-0.5 animate-pulse">
        <span className="material-symbols-outlined text-base text-white dark:text-[#14110F]">neurology</span>
      </div>
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
        <div className="bg-[#FFFDF9] dark:bg-[#1C1714] rounded-2xl rounded-tl-sm p-5 shadow-sm border border-[#E3DACE]/60 dark:border-[#382F2A] space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>

          {/* Dual recommendation cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[1, 2].map(n => (
              <div
                key={n}
                className="bg-[#fcf9f3] dark:bg-[#221B17] rounded-xl p-4 border border-[#E3DACE]/80 dark:border-[#382F2A] space-y-3"
              >
                <Skeleton className="w-full h-32 rounded-lg" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-28 rounded-md" />
                  <Skeleton className="h-5 w-12 rounded-md" />
                </div>
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Smart Order Breakdown Skeleton
export const OrderReviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map(n => (
        <div
          key={n}
          className="bg-[#FFFDF9] dark:bg-[#1C1714] rounded-2xl p-5 border border-[#E3DACE]/60 dark:border-[#382F2A] flex flex-col sm:flex-row gap-5 items-start"
        >
          <Skeleton className="w-full sm:w-28 h-28 rounded-xl shrink-0" />
          <div className="flex-1 w-full space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-1/2 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Order Status Live Tracker Skeleton
export const OrderStatusSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 lg:py-12 space-y-10 animate-pulse">
      <div className="bg-[#FFFDF9] dark:bg-[#1C1714] rounded-2xl p-8 lg:p-12 border border-[#E3DACE]/80 dark:border-[#382F2A] space-y-6">
        <Skeleton className="h-7 w-48 rounded-full" />
        <Skeleton className="h-12 w-3/4 rounded-md" />
        <Skeleton className="h-5 w-1/2 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 border-t border-[#E3DACE]/40 dark:border-[#382F2A]">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="flex flex-col items-center space-y-3">
              <Skeleton className="w-14 h-14 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
