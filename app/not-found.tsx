export const dynamic = "force-static";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold mb-2">404 — Not Found</h1>
      <p className="text-sm opacity-70">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
