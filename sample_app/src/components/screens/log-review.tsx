import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { ArrowLeft, User, Sparkle } from "lucide-react";

// Mock conversation data
const mockConversation = {
  id: "1",
  timestamp: "2024-12-03 2:32 PM",
  carrier: "State Farm",
  summary: "Customer inquiry about comprehensive coverage options",
  messages: [
    {
      role: "user",
      content: "I'm currently looking at my auto insurance policy and wondering if I should add comprehensive coverage. What does it actually cover?",
      timestamp: "2:30 PM",
    },
    {
      role: "assistant",
      content: "Great question! Comprehensive coverage is an important part of auto insurance. Here's what it typically covers:\\n\\n1. Natural disasters - Damage from floods, hurricanes, earthquakes, or hail\\n\\n2. Theft and vandalism - If your vehicle is stolen or vandalized\\n\\n3. Animal collisions - Damage from hitting a deer or other animal\\n\\n4. Falling objects - Damage from tree branches, debris, or other falling items\\n\\n5. Fire damage - Both accidental fires and arson\\n\\n6. Glass damage - Windshield cracks or other glass breakage\\n\\nComprehensive coverage does NOT include:\\n- Collision damage (that's a separate coverage)\\n- Damage to other vehicles or property\\n- Medical expenses\\n- Wear and tear or mechanical breakdowns\\n\\nWould you like to know more about how comprehensive coverage differs from collision coverage?",
      timestamp: "2:32 PM",
    },
    {
      role: "user",
      content: "Yes, what's the difference between comprehensive and collision? And do I need both?",
      timestamp: "2:33 PM",
    },
    {
      role: "assistant",
      content: "Excellent follow-up question! Here's the key difference:\\n\\n• Comprehensive: Covers damage from events outside your control (theft, weather, animals)\\n• Collision: Covers damage from hitting another vehicle or object while driving\\n\\nDo you need both? It depends on several factors:\\n\\n1. Vehicle value - If your car is newer or worth a significant amount, both coverages are highly recommended\\n2. Loan/lease requirements - Lenders typically require both if you're financing\\n3. Financial situation - Can you afford to repair/replace your vehicle out of pocket?\\n4. Deductible options - Both coverages have deductibles you can adjust\\n\\nFor most drivers with newer vehicles or car loans, having both comprehensive and collision coverage provides the best protection. However, if you have an older vehicle with low value, you might consider liability-only coverage to save on premiums.",
      timestamp: "2:34 PM",
    },
  ],
};

interface LogReviewProps {
  reviewId?: string;
  onBack: () => void;
}

export function LogReview({ reviewId, onBack }: LogReviewProps) {
  const [comment, setComment] = useState("");
  const [correction, setCorrection] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const availableTags = [
    { id: "accuracy", label: "Accuracy Issue" },
    { id: "tone", label: "Tone/Style Issue" },
    { id: "safety", label: "Safety Concern" },
    { id: "reasoning", label: "Reasoning Quality" },
    { id: "completeness", label: "Incomplete Response" },
    { id: "hallucination", label: "Hallucination/Fabrication" },
  ];

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert("Feedback submitted successfully!");
      onBack();
    }, 1000);
  };

  const handleSaveDraft = () => {
    alert("Draft saved!");
  };

  return (
    <div className="p-8 max-w-[1600px]">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 -ml-2 hover:bg-muted"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Queue
        </Button>
        <h1 className="text-primary mb-2">Review Log</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>ID: {mockConversation.id}</span>
          <span>•</span>
          <span>{mockConversation.timestamp}</span>
          <span>•</span>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {mockConversation.carrier}
          </Badge>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Left Panel: Chat Transcript */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-primary mb-4 font-bold">Conversation Transcript</h3>
          
          <div className="space-y-4">
            {mockConversation.messages.slice(0, 2).map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.role === "user"
                    ? "bg-muted"
                    : "bg-secondary/5 border border-secondary/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {message.role === "user" ? (
                    <User size={16} className="text-muted-foreground" />
                  ) : (
                    <Sparkle size={16} className="text-secondary" />
                  )}
                  <span className="text-sm font-bold">
                    {message.role === "user" ? "Question" : "Response"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {message.timestamp}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Feedback Form */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-primary mb-4 font-bold">Submit Feedback</h3>
          
          <div className="space-y-6">
            {/* Reviewer Comment */}
            <div>
              <label className="text-sm mb-2 block">
                Reviewer Comments
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your observations and feedback about this conversation..."
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Corrected Response */}
            <div>
              <label className="text-sm mb-2 block">
                Corrected/Ground Truth Response
              </label>
              <Textarea
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                placeholder="Provide the ideal response or correction (optional)..."
                className="min-h-[150px] resize-none"
              />
            </div>

            {/* Tag Selection */}
            <div>
              <label className="text-sm mb-3 block">
                Issue Tags
              </label>
              <div className="space-y-3">
                {availableTags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2">
                    <Checkbox
                      id={tag.id}
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                    />
                    <label
                      htmlFor={tag.id}
                      className="text-sm cursor-pointer"
                    >
                      {tag.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Selected Tags:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tagId) => {
                    const tag = availableTags.find((t) => t.id === tagId);
                    return (
                      <Badge key={tagId} variant="outline">
                        {tag?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                {isSaving ? "Submitting..." : "Submit Feedback"}
              </Button>
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                className="flex-1"
              >
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}