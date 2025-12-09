import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface NewLayoutProps {
  children: React.ReactNode;
  productId?: string;
}

const productNames: Record<string, string> = {
  'unity-isa': 'Unity ISA',
};

export const NewLayout: React.FC<NewLayoutProps> = ({ children, productId }) => {
  const navigate = useNavigate();
  const productName = productId ? productNames[productId] : 'EthosAI';

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar productId={productId} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 flex-1">
            {productId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                Back to Products
              </Button>
            )}
            <Separator orientation="vertical" className="h-4" />
            <h1 className="text-lg font-semibold">
              {productName} - Ethical AI Principles
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
