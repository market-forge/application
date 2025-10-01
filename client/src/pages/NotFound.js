export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-center">
      <h1 className="text-9xl font-extrabold text-gray-300">404</h1>
      <p className="mt-4 text-2xl font-semibold text-gray-700">Page not found</p>
      <p className="mt-2 text-gray-500">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <a
        href="/"
        className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 text-white font-medium shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Go back home
      </a>
    </div>
  );
}