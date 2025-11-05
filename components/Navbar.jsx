export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-gemini text-white shadow-gemini
                 flex items-center justify-between px-6 h-14 backdrop-blur-md"
    >
      <h1 className="font-semibold text-lg text-gemini">HomeFix Studio AI</h1>
      <div className="flex items-center gap-3">
        <button className="text-sm hover:scale-105 transition">Dashboard</button>
        <button className="text-sm hover:scale-105 transition">Bookings</button>
      </div>
    </nav>
  );
}
