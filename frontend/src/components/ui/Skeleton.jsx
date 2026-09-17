import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx("animate-pulse rounded-md bg-muted/80 dark:bg-muted/40", className)
      )}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="p-5 border border-border bg-card-bg rounded-2xl shadow-sm space-y-4 w-full">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

export const ReportListItemSkeleton = () => (
  <div className="flex flex-col sm:flex-row gap-4 p-4 border border-border bg-card-bg rounded-xl items-center w-full shadow-sm mb-3">
    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2 w-full">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <div className="flex gap-2 w-full sm:w-auto">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  </div>
);

export const KanbanColumnSkeleton = () => (
  <div className="bg-muted/30 rounded-2xl p-4 min-h-[500px] border border-border flex flex-col gap-3 w-full">
    <div className="flex justify-between items-center mb-2">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-8 rounded-full" />
    </div>
    <Skeleton className="h-32 w-full rounded-xl" />
    <Skeleton className="h-32 w-full rounded-xl" />
    <Skeleton className="h-32 w-full rounded-xl" />
  </div>
);
