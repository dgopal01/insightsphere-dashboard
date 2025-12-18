import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  ThumbsUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const getMenuItems = (productId?: string) => {
  const basePath = productId ? `/${productId}` : '';

  return [
    {
      id: 'ai-metrics',
      label: 'AI Metrics',
      icon: BarChart3,
      path: `${basePath}/ai-metrics`,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: `${basePath}/dashboard`,
    },
    {
      id: 'chat-logs',
      label: 'Chat Logs Review',
      icon: MessageSquare,
      path: `${basePath}/chat-logs-review`,
    },
    {
      id: 'feedback-logs',
      label: 'Feedback Logs',
      icon: ThumbsUp,
      path: `${basePath}/feedback-logs-review`,
    },
  ];
};

interface AppSidebarProps {
  productId?: string;
}

export function AppSidebar({ productId }: AppSidebarProps) {
  const menuItems = getMenuItems(productId);
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const { signOut, user } = useAuth();
  const isCollapsed = state === 'collapsed';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-3">
          {!isCollapsed && (
            <h1 className="text-sidebar-foreground font-semibold text-lg transition-opacity duration-300">
              EthosAI
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="text-sidebar-foreground hover:bg-sidebar-accent p-2 rounded-lg transition-all ml-auto hover:scale-110"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={isCollapsed ? item.label : undefined}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2 py-2 bg-sidebar-accent/50 rounded-lg">
              <div className="flex items-center justify-center size-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                <User className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </Button>
            <div className="text-sidebar-foreground/40 text-xs text-center">v1.0.0</div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
