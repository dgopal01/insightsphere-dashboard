/**
 * Products Landing Page
 * Displays tiles for each product with navigation to their review sections
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  ArrowRight,
  BarChart3,
  MessageSquare,
  ThumbsUp,
  LayoutDashboard,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  sections: {
    name: string;
    path: string;
    icon: React.ReactNode;
  }[];
}

const products: Product[] = [
  {
    id: 'unity-isa',
    name: 'Unity ISA',
    description:
      'Unity Intelligent Sales Agent - AI-powered sales assistant for vehicle warranty coverage',
    icon: <MessageSquare className="size-8" />,
    color: 'bg-secondary',
    sections: [
      {
        name: 'AI Metrics',
        path: '/unity-isa/ai-metrics',
        icon: <BarChart3 className="size-5" />,
      },
      {
        name: 'Dashboard',
        path: '/unity-isa/dashboard',
        icon: <LayoutDashboard className="size-5" />,
      },
      {
        name: 'Chat Logs Review',
        path: '/unity-isa/chat-logs-review',
        icon: <MessageSquare className="size-5" />,
      },
      {
        name: 'Feedback Logs Review',
        path: '/unity-isa/feedback-logs-review',
        icon: <ThumbsUp className="size-5" />,
      },
    ],
  },
];

const ProductsLandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleProductClick = (productId: string) => {
    // Navigate to the first section of the product
    const product = products.find((p) => p.id === productId);
    if (product && product.sections.length > 0) {
      navigate(product.sections[0].path);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <img src="/ethosai-logo.png" alt="EthosAI Logo" className="h-12 w-auto" />
            <h1 className="text-4xl font-bold text-foreground">EthosAI Review Portal</h1>
          </div>
          <p className="text-muted-foreground text-lg ml-16">
            Select a product to access its review and analytics dashboards
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleProductClick(product.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${product.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}
                  >
                    {product.icon}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {product.sections.length} Sections
                  </Badge>
                </div>
                <CardTitle className="text-2xl mb-2">{product.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <p className="text-sm font-semibold text-muted-foreground">Available Sections:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.sections.map((section) => (
                      <div
                        key={section.path}
                        className="flex items-center gap-2 text-sm text-foreground bg-muted/50 rounded-md px-3 py-2"
                      >
                        {section.icon}
                        <span className="truncate">{section.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full group-hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product.id);
                  }}
                >
                  Open Product
                  <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State for Future Products */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground bg-muted/30 rounded-lg px-6 py-4">
            <LayoutGrid className="size-5" />
            <p className="text-sm">
              More products coming soon. Contact your administrator to add new products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsLandingPage;
