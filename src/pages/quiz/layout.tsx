import React from 'react';
import { Outlet } from 'react-router-dom';
import { QuizProvider } from '@/context/QuizContext';
import ProgressBar from '@/components/quiz/ProgressBar';

export default function QuizLayout() {
  return (
    <QuizProvider>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-gradient-to-r from-pink-100 to-violet-100 h-16 flex items-center px-4 shadow-sm">
          <div className="container max-w-md mx-auto">
            <ProgressBar />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-md mx-auto py-4 px-4">
            <Outlet />
          </div>
        </main>
      </div>
    </QuizProvider>
  );
}
