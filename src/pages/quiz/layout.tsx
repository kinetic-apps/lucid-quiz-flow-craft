import React from 'react';
import { Outlet } from 'react-router-dom';
import { QuizProvider } from '@/context/QuizContext';
import ProgressBar from '@/components/quiz/ProgressBar';

export default function QuizLayout() {
  return (
    <QuizProvider>
      <div className="min-h-screen flex flex-col bg-lucid-cream">
        <ProgressBar />
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-md mx-auto py-4 px-4">
            <Outlet />
          </div>
        </main>
      </div>
    </QuizProvider>
  );
}
