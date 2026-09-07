import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="data-surface rounded-[1.125rem] p-10 text-center max-w-md">
        <h2 className="text-2xl font-bold">Department not found</h2>
        <p className="mt-2 text-[#54596b]">
          Sorry, that department does not exist or may have been removed.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/departments"
            className="inline-flex min-h-12 items-center rounded-full bg-[#202124] px-6 text-sm font-semibold text-white hover:bg-[#3c4043]"
          >
            Browse departments
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-full font-semibold neu neu-press"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
