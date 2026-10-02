import type { CSSProperties } from "react";

const base = "animate-pulse rounded bg-white/[0.07]";

function Block({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) {
  return <div aria-hidden="true" className={`${base} ${className}`} style={style} />;
}

export function BuilderPageSkeleton() {
  return (
    <div role="status" aria-label="Loading builder" className="min-h-screen bg-[#0a0a0b] p-4">
      <span className="sr-only">Loading builder</span>
      <header className="mx-auto flex h-12 max-w-400 items-center justify-between border-b border-white/10 px-2">
        <Block className="h-7 w-28" />
        <Block className="h-7 w-64 max-w-[40vw]" />
        <Block className="h-8 w-32" />
      </header>
      <main className="mx-auto grid max-w-400 gap-4 py-4 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.4fr)]">
        <section className="space-y-4 rounded-lg border border-white/10 p-4">
          <Block className="h-8 w-40" />
          <Block className="h-4 w-3/4" />
          <div className="space-y-3 pt-4">
            <Block className="h-16 w-4/5" />
            <Block className="ml-auto h-20 w-3/4" />
            <Block className="h-14 w-2/3" />
          </div>
          <Block className="mt-8 h-24 w-full" />
        </section>
        <section className="min-h-[52vh] rounded-lg border border-white/10 p-4">
          <div className="flex h-full min-h-[48vh] items-center justify-center rounded bg-white/2.5">
            <div className="w-3/4 space-y-4">
              <Block className="mx-auto h-10 w-1/2" />
              <Block className="h-40 w-full" />
              <Block className="h-5 w-2/3" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export function PreviewPageSkeleton() {
  return (
    <div role="status" aria-label="Loading preview" className="min-h-screen bg-[#0a0a0b]">
      <span className="sr-only">Loading preview</span>
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Block className="h-7 w-24" />
        <Block className="h-6 w-52 max-w-[40vw]" />
        <Block className="h-8 w-24" />
      </header>
      <main className="h-[calc(100vh-4rem)] p-4 md:p-7">
        <div className="h-full rounded-lg border border-white/10 bg-white/2.5 p-6">
          <Block className="mx-auto mt-12 h-12 w-2/5" />
          <Block className="mx-auto mt-5 h-5 w-1/3" />
          <Block className="mx-auto mt-12 h-2/3 w-full max-w-5xl" />
        </div>
      </main>
    </div>
  );
}

export function ProjectGridSkeleton({ community = false }: { community?: boolean }) {
  return (
    <div
      role="status"
      aria-label={community ? "Loading community projects" : "Loading projects"}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <span className="sr-only">Loading projects</span>
      {Array.from({ length: 6 }, (_, index) => (
        <article key={index} className="overflow-hidden rounded-lg border border-white/10 p-3">
          <Block className="aspect-16/10 w-full rounded-md" />
          <div className="space-y-3 p-2 pt-4">
            <Block className="h-5 w-3/5" />
            <Block className="h-4 w-2/5" />
            <div className="flex gap-2 pt-2">
              <Block className="h-9 flex-1" />
              {community && <Block className="h-9 w-20" />}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function PackageGridSkeleton() {
  return (
    <div role="status" aria-label="Loading packages" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <span className="sr-only">Loading packages</span>
      {Array.from({ length: 3 }, (_, index) => (
        <section key={index} className="space-y-5 rounded-lg border border-white/10 p-6">
          <Block className="h-5 w-2/5" />
          <Block className="h-10 w-3/5" />
          <Block className="h-4 w-4/5" />
          <Block className="h-11 w-full" />
          <div className="space-y-3 pt-2">
            <Block className="h-4 w-full" />
            <Block className="h-4 w-5/6" />
            <Block className="h-4 w-4/6" />
          </div>
        </section>
      ))}
    </div>
  );
}

export function ActivityGraphSkeleton() {
  return (
    <div role="status" aria-label="Loading activity" className="space-y-4 py-3">
      <span className="sr-only">Loading activity</span>
      <div className="flex items-center justify-between">
        <Block className="h-5 w-36" />
        <Block className="h-4 w-24" />
      </div>
      <div className="flex gap-0.75 overflow-hidden">
        {Array.from({ length: 53 }, (_, week) => (
          <div key={week} className="flex shrink-0 flex-col gap-0.75">
            {Array.from({ length: 7 }, (_, day) => (
              <Block key={day} className="h-3 w-3 rounded-[3px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SessionRestoreSkeleton() {
  return (
    <div role="status" aria-label="Restoring session" className="mx-auto flex min-h-[50vh] max-w-sm flex-col justify-center gap-4 px-6">
      <span className="sr-only">Restoring session</span>
      <Block className="mx-auto h-10 w-10 rounded-full" />
      <Block className="mx-auto h-5 w-40" />
      <Block className="mx-auto h-4 w-56 max-w-full" />
    </div>
  );
}
