"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return <div className={cn("skeleton rounded-full", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-24 mt-2" />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        <div className="flex items-center space-x-3 mb-4">
          <SkeletonCircle className="w-8 h-8" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="text-right">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        
        <div className="flex justify-between items-center text-sm mb-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        
        <div className="flex justify-between items-center text-sm mb-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton className="h-4 w-20" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProfileSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <SkeletonCircle className="w-12 h-12" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
