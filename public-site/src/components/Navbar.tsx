import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/shop', label: 'Shop' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer group">
              <img 
                src="/verihealth-logo.png" 
                alt="VeriHealth" 
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    isActive(link.href)
                      ? 'text-medical-blue-600'
                      : 'text-gray-600 hover:text-medical-blue-600'
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <Link href="/portal">
              <button className="px-5 py-2 bg-medical-blue-600 text-white rounded-lg text-sm font-medium hover:bg-medical-blue-700 transition-colors">
                Clinician Portal
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-900" />
            ) : (
              <Menu className="h-6 w-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`block px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                      isActive(link.href)
                        ? 'bg-medical-blue-50 text-medical-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
              <Link href="/portal">
                <button
                  className="w-full mt-2 px-4 py-2 bg-medical-blue-600 text-white rounded-lg text-sm font-medium hover:bg-medical-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Clinician Portal
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
