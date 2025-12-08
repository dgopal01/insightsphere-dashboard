import { useState } from "react";
import { AppSidebar } from "./components/app-sidebar";
import { TopBar } from "./components/top-bar";
import { Dashboard } from "./components/screens/dashboard";
import { ReviewQueue } from "./components/screens/review-queue";
import { LogReview } from "./components/screens/log-review";

type Page = "dashboard" | "review";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const handleReviewClick = (id: string) => {
    setSelectedReviewId(id);
  };

  const handleBackFromReview = () => {
    setSelectedReviewId(null);
  };

  const renderContent = () => {
    // Handle detailed review view
    if (selectedReviewId) {
      return <LogReview reviewId={selectedReviewId} onBack={handleBackFromReview} />;
    }

    // Render main pages
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "review":
        return <ReviewQueue onReviewClick={handleReviewClick} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar currentPage={currentPage} onNavigate={(page) => {
        setCurrentPage(page as Page);
        setSelectedReviewId(null);
      }} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto bg-[rgb(249,249,249)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}