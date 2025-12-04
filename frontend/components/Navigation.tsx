"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navigation = ({ isConnected, userAddress }: { isConnected: boolean; userAddress?: string }) => {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: "🏠" },
    { href: "/submit", label: "Submit", icon: "💧" },
    { href: "/records", label: "Records", icon: "📝" },
    { href: "/achievements", label: "Achievements", icon: "🏅" },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">💧</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ChainWaterSave
              </h1>
            </div>
            
            <div className="hidden md:flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.href
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-1">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected && userAddress && (
              <div className="hidden md:block px-4 py-2 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600">Connected</p>
                <p className="text-sm font-mono font-semibold text-green-600">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

