
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/marketing/Hero';
import StatStrip from '@/components/marketing/StatStrip';
import ConsentBar from '@/components/quiz/ConsentBar';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <StatStrip />
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
