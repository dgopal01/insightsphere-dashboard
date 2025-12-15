import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, Filter } from "lucide-react";

// Mock data
const mockReviews = [
  {
    id: "1",
    logId: "SF-2024-1203-A7K9",
    carrier: "National Auto Care",
    question: "How do I set up auto-pay for my insurance premium?",
    response: "To enroll in our auto-pay program, you can log in to your account through our mobile app or website. Navigate to the 'Billing' section, select 'Payment Options,' and choose 'Set Up Auto-Pay.' From there, you'll be prompted to enter your payment information and select your preferred payment date. If you need assistance, feel free to call our customer service team at 1-800-555-1234, and they'll be happy to help you set it up over the phone.",
    status: "reviewed",
    tags: ["accuracy", "reasoning"],
  },
  {
    id: "2",
    logId: "GC-2024-1203-B3M2",
    carrier: "Route 66",
    question: "What discounts am I eligible for on my policy?",
    response: "Your policy renewal is coming up on December 15th. You may qualify for our safe driver discount if you've maintained a clean driving record for the past three years. Additionally, we offer multi-policy discounts if you bundle your auto insurance with homeowners or renters insurance. I'd be happy to review your account to see which discounts you're eligible for. Would you like me to transfer you to one of our agents?",
    status: "pending",
    tags: ["tone", "safety"],
  },
  {
    id: "3",
    logId: "PG-2024-1203-X8N4",
    carrier: "EFG",
    question: "What is the timeline for processing my insurance claim?",
    response: "Once you file a claim, our team typically processes it within 24-48 hours. You'll receive a claim number via email and text message. An adjuster will be assigned to assess the damage, which usually happens within 3-5 business days. After the assessment, we'll provide you with repair estimates and next steps. The entire process from filing to resolution typically takes 7-14 days, depending on the complexity of the claim.",
    status: "reviewed",
    tags: ["accuracy"],
  },
  {
    id: "4",
    logId: "AL-2024-1203-C5P7",
    carrier: "Mercury",
    question: "What are the different product plans for the carrier?",
    response: "Upgrading your coverage is simple! I can walk you through our available options. We offer comprehensive coverage, collision coverage, and increased liability limits. Based on your current policy, adding comprehensive coverage would increase your monthly premium by approximately $45. I can also provide quotes for other coverage levels. Would you like me to email you a detailed comparison of your current coverage versus the upgraded options?",
    status: "pending",
    tags: ["reasoning", "tone"],
  },
  {
    id: "5",
    logId: "SF-2024-1203-D9R1",
    carrier: "National Auto Care",
    question: "How does insuring multiple vehicles work?",
    response: "Great question! When you insure multiple vehicles with us, you automatically qualify for our multi-car discount, which can save you up to 25% on your total premium. You'll have one policy covering all vehicles, with a single renewal date and consolidated billing. Each vehicle can have different coverage levels based on its value and usage. To get started, I'll need the make, model, year, and VIN for each vehicle you'd like to add.",
    status: "reviewed",
    tags: ["accuracy", "safety"],
  },
  {
    id: "6",
    logId: "GC-2024-1203-F2T6",
    carrier: "Route 66",
    question: "Can you explain accident forgiveness coverage?",
    response: "Our accident forgiveness program is available to drivers who have been claim-free for at least five years. Once enrolled, your first at-fault accident won't cause your rates to increase. The program costs an additional $12 per month and can be added to your policy at any time. Keep in mind that accident forgiveness applies only to your first at-fault accident and doesn't prevent points from being added to your driving record by the DMV.",
    status: "pending",
    tags: ["reasoning"],
  },
  {
    id: "7",
    logId: "PG-2024-1203-H4W8",
    carrier: "EFG",
    question: "What is gap insurance and do I need it?",
    response: "Gap insurance covers the difference between what you owe on your car loan and the vehicle's actual cash value if it's totaled or stolen. For example, if you owe $25,000 on your loan but your car's current value is $20,000, gap insurance would cover that $5,000 difference. This coverage is especially valuable for new cars that depreciate quickly. It typically costs between $20-40 per month and can be canceled once you've paid down enough of your loan.",
    status: "pending",
    tags: ["accuracy", "tone"],
  },
  {
    id: "8",
    logId: "US-2024-1203-J6Y3",
    carrier: "MCare",
    question: "How do I verify my military discount eligibility?",
    response: "Thank you for your service! To verify your military discount eligibility, I'll need a copy of your military ID or DD Form 214. Active duty service members, veterans, and their families qualify for up to 15% off our standard rates. You can upload these documents through our mobile app under 'Account Settings' > 'Military Verification,' or you can email them to military.verification@usaa.com. Once verified, the discount will be applied retroactively to your policy start date.",
    status: "reviewed",
    tags: ["reasoning", "safety"],
  },
];

const carrierColors: Record<string, string> = {
  "National Auto Care": "bg-blue-100 text-blue-800 border-blue-200",
  Route66: "bg-purple-100 text-purple-800 border-purple-200",
  EFG: "bg-green-100 text-green-800 border-green-200",
  Mercury: "bg-orange-100 text-orange-800 border-orange-200",
  MCare: "bg-gray-100 text-gray-800 border-gray-200",
};

interface ReviewQueueProps {
  onReviewClick: (id: string) => void;
}

export function ReviewQueue({ onReviewClick }: ReviewQueueProps) {
  const [selectedCarrier, setSelectedCarrier] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const carriers = ["all", "National Auto Care", "Route 66", "EFG", "Mercury", "MCare"];
  const tags = ["all", "accuracy", "tone", "safety", "reasoning"];

  const carrierCounts = {
    "National Auto Care": 24,
    "Route 66": 18,
    EFG: 15,
    Mercury: 12,
    MCare: 18,
  };

  const filteredReviews = mockReviews.filter((review) => {
    if (selectedCarrier !== "all" && review.carrier !== selectedCarrier) return false;
    if (selectedTag !== "all" && !review.tags.includes(selectedTag)) return false;
    if (selectedStatus !== "all" && review.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-8 w-full h-full">
      <div>
        <h1 className="text-primary mb-2">AI Response Review</h1>
        <p className="text-muted-foreground">
          Review and validate chatbot responses requiring human feedback
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[rgb(243,243,243)] rounded-lg border border-border p-4">
          <p className="text-muted-foreground text-sm mb-1 m-[0px]">Total Pending</p>
          <p className="text-2xl text-primary">87</p>
        </div>
        {Object.entries(carrierCounts).map(([carrier, count]) => (
          <div key={carrier} className="bg-[rgb(232,246,248)] rounded-lg border border-border p-4 p-[16px]">
            <p className="text-muted-foreground text-sm mb-1 m-[0px]">{carrier}</p>
            <p className="text-2xl text-primary">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Filter */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input-background pt-[8px] pr-[20px] pb-[8px] pl-[12px]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          {/* Carrier Filter */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Carrier</label>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="w-full px-[12px] py-[8px] border border-border rounded-lg bg-input-background pt-[8px] pr-[22px] pb-[8px] pl-[12px]"
            >
              {carriers.map((car) => (
                <option key={car} value={car}>
                  {car === "all" ? "All Carriers" : car}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Tag Filter</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input-background"
            >
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag === "all" ? "All Tags" : tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Review Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Log ID</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Carrier</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Question</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Response</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Tags</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm align-top">{review.logId}</td>
                  <td className="px-6 py-4 text-sm align-top">
                    {review.carrier}
                  </td>
                  <td className="px-6 py-4 text-sm max-w-md align-top">{review.question}</td>
                  <td className="px-6 py-4 text-sm max-w-md align-top">{review.response}</td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-wrap gap-1">
                      {review.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <Badge 
                      variant="outline" 
                      className={
                        review.status === "reviewed"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-yellow-50 text-yellow-800 border-yellow-200"
                      }
                    >
                      {review.status === "reviewed" ? "Reviewed" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <Button
                      onClick={() => onReviewClick(review.id)}
                      size="sm"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredReviews.length} of 87 reviews
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}