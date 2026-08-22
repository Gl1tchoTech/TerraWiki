import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <Compass className="h-10 w-10 text-moss-300" />
      <h1 className="mt-6 font-display text-4xl font-bold text-bark-50">Lost in the caves</h1>
      <p className="mt-3 max-w-md text-bark-300">
        This page doesn't exist — or it hasn't been unearthed yet. Head back to the guide and keep
        exploring.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/wiki" className="btn-gold">
          Back to the Guide
        </Link>
        <Link to="/" className="btn-pixel">
          Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
