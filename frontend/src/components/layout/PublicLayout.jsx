import { Link, Outlet } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';

// Shared frame for the public pages: header, page content, footer.
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link to="/" aria-label="HunarDesk home">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 text-sm text-muted sm:px-6">
          &copy; {new Date().getFullYear()} HunarDesk
        </div>
      </footer>
    </div>
  );
}
