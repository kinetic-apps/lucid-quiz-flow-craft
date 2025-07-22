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
import RefundNotificationPage from "./pages/RefundNotificationPage";
import VerifyPhonePage from "./pages/checkout/verify-phone";
import { QuizProvider } from "./context/QuizContext";
import { PostHogProvider } from "./context/PostHogContext";

const queryClient = new QueryClient();

const App = () => {
  const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY as string || '';
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST as string || 'https://app.posthog.com';

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider apiKey={posthogApiKey} hostUrl={posthogHost}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<GenderSelect />} />
              <Route path="/mindfulness" element={<MindfulnessQuiz />} />
              <Route path="/checkout">
                <Route index element={
                  <QuizProvider>
                    <CheckoutPage />
                  </QuizProvider>
                } />
                <Route path="refund-notification" element={<RefundNotificationPage />} />
                <Route path="verify-phone" element={<VerifyPhonePage />} />
                <Route path="*" element={
                  <QuizProvider>
                    <CheckoutPage />
                  </QuizProvider>
                } />
              </Route>
              <Route path="/quiz" element={<QuizLayout />}>
                <Route path=":slug" element={<QuizPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
};

export default App;
