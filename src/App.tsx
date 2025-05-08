import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GenderSelect from "./pages/GenderSelect";
import MindfulnessQuiz from "./pages/MindfulnessQuiz";
import NotFound from "./pages/NotFound";
import QuizLayout from "./pages/quiz/layout";
import QuizPage from "./pages/quiz/[slug]/page";
import CheckoutPage from "./pages/checkout/page";
import { QuizProvider } from "./context/QuizContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GenderSelect />} />
          <Route path="/mindfulness" element={<MindfulnessQuiz />} />
          <Route path="/home" element={<Index />} />
          <Route path="/checkout" element={
            <QuizProvider>
              <CheckoutPage />
            </QuizProvider>
          } />
          <Route path="/quiz" element={<QuizLayout />}>
            <Route path=":slug" element={<QuizPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
