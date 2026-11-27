import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-[#E8E0D4] bg-white p-10 text-center shadow-xs">
      <h1 className="font-display text-3xl font-bold text-[#1B3B36]">
        Trail Not Found
      </h1>
      <p className="mt-2 text-sm text-[#52635F]">
        This hidden gem or page could not be located.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-[#1B3B36] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#C85A32]"
      >
        Back to Discovery Feed
      </Link>
    </div>
  );
}
