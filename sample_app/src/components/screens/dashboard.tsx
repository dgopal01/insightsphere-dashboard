import { KpiCard } from "../kpi-card";
import { TrendLineChart } from "../charts/line-chart";
import { CarrierBarChart } from "../charts/bar-chart";
import { QualityDonutChart } from "../charts/donut-chart";
import { MessageSquare, ClipboardCheck, CheckCircle2, Heart, ShieldCheck, Calendar, AlertTriangle, Users, ArrowLeft, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

// Mock data
const volumeData = [
  { date: "Nov 27", conversations: 245 },
  { date: "Nov 28", conversations: 312 },
  { date: "Nov 29", conversations: 289 },
  { date: "Nov 30", conversations: 401 },
  { date: "Dec 1", conversations: 378 },
  { date: "Dec 2", conversations: 425 },
  { date: "Dec 3", conversations: 467 },
];

const careerData = [
  { carrier: "State Farm", count: 342 },
  { carrier: "Geico", count: 289 },
  { carrier: "Progressive", count: 234 },
  { carrier: "Allstate", count: 198 },
  { carrier: "USAA", count: 156 },
];

const qualityData = [
  { name: "0.0-0.1", value: 1 },
  { name: "0.1-0.2", value: 1 },
  { name: "0.2-0.3", value: 2 },
  { name: "0.3-0.4", value: 2 },
  { name: "0.4-0.5", value: 3 },
  { name: "0.5-0.6", value: 4 },
  { name: "0.6-0.7", value: 6 },
  { name: "0.7-0.8", value: 10 },
  { name: "0.8-0.9", value: 20 },
  { name: "0.9-1.0", value: 31 },
];

const qualityColors = [
  "#B2EBF2", // Very light teal
  "#80DEEA", // Light teal
  "#4DD0E1", // Light-medium teal
  "#26C6DA", // Medium-light teal
  "#00BCD4", // Medium teal
  "#00ACC1", // Medium teal
  "#0097A7", // Medium-dark teal
  "#00838F", // Dark teal
  "#006064", // Darker teal
  "#004D56", // Very dark teal
];

// Mock conversation data for Vehicle Ancillary products
const conversationData = [
  {
    id: "1",
    conversationInput: "What vehicles are eligible for MMP coverage?",
    aiOutput: "Mechanical Breakdown Protection (MMP) is available for new and used vehicles under 10 years old with less than 100,000 miles. Eligible vehicles include cars, light trucks, SUVs, and minivans. The vehicle must pass our initial inspection and cannot have any pre-existing mechanical issues. Coverage can be purchased within the first 12 months or 12,000 miles of vehicle ownership.",
    retrievedSources: 3,
    groundTruth: "MMP eligible: vehicles <10 years, <100k miles, no pre-existing issues",
    score: 0.92
  },
  {
    id: "2",
    conversationInput: "How does GAP insurance work with total loss claims?",
    aiOutput: "Guaranteed Asset Protection (GAP) insurance covers the difference between your vehicle's actual cash value and the outstanding loan balance in the event of a total loss. For example, if your vehicle is totaled and worth $18,000 but you owe $23,000, GAP covers the $5,000 difference. This coverage includes your insurance deductible up to $1,000 and is valid for the loan term up to 84 months.",
    retrievedSources: 4,
    groundTruth: "GAP covers loan balance minus ACV, includes deductible up to $1,000",
    score: 0.95
  },
  {
    id: "3",
    conversationInput: "What is the difference between tire and wheel protection and regular insurance?",
    aiOutput: "Tire and Wheel Protection is a separate coverage that protects against road hazards like potholes, nails, and debris that damage your tires and wheels. Unlike your regular auto insurance, this coverage has no deductible and covers unlimited repairs during the term. Standard auto insurance typically only covers tire damage from collisions or comprehensive claims, which would be subject to your policy deductible.",
    retrievedSources: 2,
    groundTruth: "T&W Protection: no deductible, road hazard coverage, separate from collision/comp",
    score: 0.88
  },
  {
    id: "4",
    conversationInput: "Can I add paintless dent repair coverage to an existing policy?",
    aiOutput: "Yes, Paintless Dent Repair (PDR) coverage can be added to your existing policy within the first 60 days of vehicle purchase or lease. The coverage costs $15-25 per month depending on your vehicle type and protects against minor dents, dings, and hail damage without affecting your insurance rates. There's a $100 deductible per repair visit, and the coverage includes up to 6 repairs per year.",
    retrievedSources: 3,
    groundTruth: "PDR can be added within 60 days, $100 deductible, max 6 repairs/year",
    score: 0.91
  },
  {
    id: "5",
    conversationInput: "What does windshield protection cover beyond basic glass coverage?",
    aiOutput: "Our Enhanced Windshield Protection covers all glass damage including windshields, side windows, and sunroofs with zero deductible. This goes beyond basic comprehensive coverage by including chips, cracks, and full replacements without any out-of-pocket costs. The coverage also includes advanced driver assistance system (ADAS) recalibration if your vehicle has lane departure or collision warning features, which can cost $200-500 separately.",
    retrievedSources: 5,
    groundTruth: "Enhanced coverage: $0 deductible, includes ADAS recalibration, all glass types",
    score: 0.94
  },
  {
    id: "6",
    conversationInput: "Is key replacement coverage worth it for newer vehicles?",
    aiOutput: "Key Replacement coverage is highly recommended for vehicles with smart keys or proximity fobs, as replacement costs range from $200-600. The coverage costs approximately $8-12 per month and covers lost, stolen, or damaged keys including programming costs. For newer luxury vehicles with advanced key systems, replacement can exceed $1,000, making this coverage valuable. The coverage typically includes up to 2 key replacements per year with no deductible.",
    retrievedSources: 4,
    groundTruth: "Key coverage: includes programming, $0 deductible, 2 replacements/year max",
    score: 0.89
  },
  {
    id: "7",
    conversationInput: "How long does MMP coverage last after purchase?",
    aiOutput: "Mechanical Breakdown Protection can be purchased with terms ranging from 3 to 7 years or up to 100,000 miles, whichever comes first. Coverage begins immediately after your factory warranty expires or can run concurrently if purchased early. The premium is a one-time payment or can be financed into your auto loan. Extended terms are available for newer vehicles with lower mileage at the time of purchase.",
    retrievedSources: 3,
    groundTruth: "MMP terms: 3-7 years or 100k miles max, begins after factory warranty",
    score: 0.93
  },
  {
    id: "8",
    conversationInput: "Does appearance protection cover interior and exterior damage?",
    aiOutput: "Yes, Appearance Protection covers both interior and exterior damage. Exterior coverage includes paint chips, scratches, minor dents, and fading. Interior coverage protects against stains, tears, burns, and odors on seats, carpets, and headliners. The coverage costs $30-45 per month with a $50 deductible per claim. Most plans allow up to 4 claims per year and remain valid for 5 years or 60,000 miles.",
    retrievedSources: 4,
    groundTruth: "Appearance: interior + exterior, $50 deductible, 4 claims/year max",
    score: 0.87
  }
];

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [showTableView, setShowTableView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversationData.filter(conversation =>
    conversation.conversationInput.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.aiOutput.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 w-full h-full">
      <div>
        <h1 className="text-primary m-[0px] font-bold">AI Quality & Responsible Metrics</h1>
        <p className="text-[rgb(60,60,64)]">
          AI chatbot performance metrics and insights
        </p>
      </div>

      {!showTableView ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
            <KpiCard
              title="Total Conversations"
              value="2,319"
              trend={{ value: "12.5% from last week", isPositive: true }}
              onClick={() => onNavigate("review")}
              delay={0}
            />
            <KpiCard
              title="Pending Reviews"
              value="87"
              trend={{ value: "23 new today", isPositive: false }}
              onClick={() => onNavigate("review")}
              delay={0.1}
            />
            <KpiCard
              title="Correctness (Avg.)"
              value="0.89"
              trend={{ value: "0.04 from last week", isPositive: true }}
              delay={0.2}
            />
            <KpiCard
              title="Helpfulness (Avg.)"
              value="0.92"
              trend={{ value: "0.02 improvement", isPositive: true }}
              delay={0.3}
            />
            <KpiCard
              title="Faithfulness (Avg.)"
              value="0.95"
              trend={{ value: "0.01 improvement", isPositive: true }}
              delay={0.4}
            />
            <KpiCard
              title="Harmfulness (Avg.)"
              value="0.08"
              trend={{ value: "0.02 reduction", isPositive: true }}
              delay={0.5}
            />
            <KpiCard
              title="Stereotyping (Avg.)"
              value="0.05"
              trend={{ value: "0.01 reduction", isPositive: true }}
              delay={0.6}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Helpfulness Score Distribution */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-primary font-bold">Helpfulness Score Distribution</h3>
                  <p className="text-muted-foreground text-sm">
                    Distribution of conversations by helpfulness score (0.0 - 1.0 scale)
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowTableView(true)}>
                  See Conversations
                </Button>
              </div>
              <div className="h-[300px]">
                <CarrierBarChart
                  data={[
                    { range: "0.0-0.1", count: 15 },
                    { range: "0.1-0.2", count: 25 },
                    { range: "0.2-0.3", count: 40 },
                    { range: "0.3-0.4", count: 65 },
                    { range: "0.4-0.5", count: 115 },
                    { range: "0.5-0.6", count: 165 },
                    { range: "0.6-0.7", count: 280 },
                    { range: "0.7-0.8", count: 415 },
                    { range: "0.8-0.9", count: 580 },
                    { range: "0.9-1.0", count: 619 },
                  ]}
                  dataKeys={[{ key: "count", name: "Helpfulness Score", color: "#00818F" }]}
                  xAxisKey="range"
                  yAxisLabel="Total Conversations"
                  yAxisMax={700}
                />
              </div>
            </div>

            {/* Carrier Distribution */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-primary font-bold">Correctness Score Distribution</h3>
                  <p className="text-muted-foreground text-sm">
                    Distribution of conversations by correctness score (0.0 - 1.0 scale)
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowTableView(true)}>
                  See Conversations
                </Button>
              </div>
              <div className="h-[300px]">
                <CarrierBarChart
                  data={[
                    { range: "0.0-0.1", count: 16 },
                    { range: "0.1-0.2", count: 26 },
                    { range: "0.2-0.3", count: 50 },
                    { range: "0.3-0.4", count: 83 },
                    { range: "0.4-0.5", count: 125 },
                    { range: "0.5-0.6", count: 182 },
                    { range: "0.6-0.7", count: 300 },
                    { range: "0.7-0.8", count: 430 },
                    { range: "0.8-0.9", count: 562 },
                    { range: "0.9-1.0", count: 545 },
                  ]}
                  dataKeys={[{ key: "count", name: "Correctness Score", color: "#28334A" }]}
                  xAxisKey="range"
                  yAxisLabel="Total Conversations"
                  yAxisMax={700}
                />
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quality Distribution */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-primary font-bold">Faithfulness Scores</h3>
                  <p className="text-muted-foreground text-sm">
                    How closely an AI's answers match the true source facts without inventing information (0.0 - 1.0 scale)
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowTableView(true)}>
                  See Conversations
                </Button>
              </div>
              <div className="h-[300px]">
                <CarrierBarChart
                  data={[
                    { range: "0.0-0.1", count: 13 },
                    { range: "0.1-0.2", count: 20 },
                    { range: "0.2-0.3", count: 40 },
                    { range: "0.3-0.4", count: 66 },
                    { range: "0.4-0.5", count: 110 },
                    { range: "0.5-0.6", count: 165 },
                    { range: "0.6-0.7", count: 272 },
                    { range: "0.7-0.8", count: 415 },
                    { range: "0.8-0.9", count: 596 },
                    { range: "0.9-1.0", count: 622 },
                  ]}
                  dataKeys={[{ key: "count", name: "Faithfulness Score", color: "#7A9A01" }]}
                  xAxisKey="range"
                  yAxisLabel="Total Conversations"
                  yAxisMax={700}
                />
              </div>
            </div>

            {/* Harmfulness Scores */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-primary font-bold">Harmfulness Scores</h3>
                  <p className="text-muted-foreground text-sm">
                    The potential for AI systems to cause physical, psychological, economic, or social harm. (0.0 - 1.0 scale)
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowTableView(true)}>
                  See Conversations
                </Button>
              </div>
              <div className="h-[300px]">
                <CarrierBarChart
                  data={[
                    { range: "0.0-0.1", count: 780 },
                    { range: "0.1-0.2", count: 480 },
                    { range: "0.2-0.3", count: 315 },
                    { range: "0.3-0.4", count: 248 },
                    { range: "0.4-0.5", count: 172 },
                    { range: "0.5-0.6", count: 126 },
                    { range: "0.6-0.7", count: 86 },
                    { range: "0.7-0.8", count: 56 },
                    { range: "0.8-0.9", count: 36 },
                    { range: "0.9-1.0", count: 20 },
                  ]}
                  dataKeys={[{ key: "count", name: "Harmfulness Score", color: "#E57200" }]}
                  xAxisKey="range"
                  yAxisLabel="Total Conversations"
                  yAxisMax={700}
                />
              </div>
            </div>

            {/* Stereotyping Score */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-primary font-bold">Stereotyping Score</h3>
                  <p className="text-muted-foreground text-sm">
                    When AI systems reinforce biased, harmful stereotypes about groups of people. (0.0 - 1.0 scale)
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowTableView(true)}>
                  See Conversations
                </Button>
              </div>
              <div className="h-[300px]">
                <CarrierBarChart
                  data={[
                    { range: "0.0-0.1", count: 812 },
                    { range: "0.1-0.2", count: 513 },
                    { range: "0.2-0.3", count: 338 },
                    { range: "0.3-0.4", count: 232 },
                    { range: "0.4-0.5", count: 159 },
                    { range: "0.5-0.6", count: 109 },
                    { range: "0.6-0.7", count: 70 },
                    { range: "0.7-0.8", count: 46 },
                    { range: "0.8-0.9", count: 30 },
                    { range: "0.9-1.0", count: 10 },
                  ]}
                  dataKeys={[{ key: "count", name: "Stereotyping Score", color: "#9E007E" }]}
                  xAxisKey="range"
                  yAxisLabel="Total Conversations"
                  yAxisMax={700}
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8">
          </div>
        </>
      ) : (
        <>
          {/* Table View */}
          <div className="space-y-6">
            {/* Back Button and Search */}
            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" onClick={() => setShowTableView(false)}>
                <ArrowLeft className="mr-2" size={16} />
                Back to Dashboard
              </Button>
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Conversation Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground">Conversation Input</th>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground">AI Output</th>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground">Retrieved Sources</th>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground">Ground Truth</th>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredConversations.map((conversation) => (
                      <tr key={conversation.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm max-w-md align-top">{conversation.conversationInput}</td>
                        <td className="px-6 py-4 text-sm max-w-md align-top">{conversation.aiOutput}</td>
                        <td className="px-6 py-4 text-sm align-top">{conversation.retrievedSources}</td>
                        <td className="px-6 py-4 text-sm max-w-xs align-top">{conversation.groundTruth}</td>
                        <td className="px-6 py-4 text-sm align-top">
                          <span className="font-medium">{conversation.score.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-border px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredConversations.length} of {conversationData.length} conversations
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}