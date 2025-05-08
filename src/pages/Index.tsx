import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/marketing/Hero';
import StatStrip from '@/components/marketing/StatStrip';
import ConsentBar from '@/components/quiz/ConsentBar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <StatStrip />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to begin your wellness journey?</h2>
          <Link to="/gender-select">
            <Button className="bg-lucid-violet-600 hover:bg-lucid-violet-700 text-white text-lg px-8 py-6 h-auto rounded-lg">
              Take the Quiz
            </Button>
          </Link>
        </div>
      </main>
      <footer className="bg-gray-50 border-t py-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2025 Lucid. All rights reserved.</p>
        </div>
      </footer>
      <ConsentBar />
    </div>
  );
};

export default Index;
