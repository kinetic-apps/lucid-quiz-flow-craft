
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-sm border-b">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          Lucid
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/features"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Pricing
          </Link>
          <Link
            to="/quiz/personality"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Quiz
          </Link>
          <Link
            to="/faq"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            FAQ
          </Link>
          
          <Link to="/login">
            <Button variant="outline">Log In</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-lucid-violet-600 hover:bg-lucid-violet-700 text-white">
              Sign Up
            </Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col mt-8 space-y-4">
                <Link
                  to="/features"
                  className="py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Features
                </Link>
                <Link
                  to="/pricing"
                  className="py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to="/quiz/personality"
                  className="py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Quiz
                </Link>
                <Link
                  to="/faq"
                  className="py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  FAQ
                </Link>
                <div className="pt-4">
                  <Link to="/login" className="block mb-4">
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full bg-lucid-violet-600 hover:bg-lucid-violet-700 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
