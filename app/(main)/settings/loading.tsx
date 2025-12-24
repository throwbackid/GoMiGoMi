import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="page-enter">
      {/* Header Skeleton */}
      <section className="border-b border-border/40 bg-card/30">
        <div className="container px-4 py-8">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="container px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Skeleton */}
          <aside className="lg:w-64 lg:shrink-0">
            <div className="flex flex-row gap-2 lg:flex-col lg:gap-1">
              <Skeleton className="h-11 w-32 lg:w-full rounded-lg" />
              <Skeleton className="h-11 w-32 lg:w-full rounded-lg" />
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-6" />
            <div className="rounded-xl border border-border bg-card p-6">
              <Skeleton className="h-40 w-full" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
