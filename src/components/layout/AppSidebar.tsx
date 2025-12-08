import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  ThumbsUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
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

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'ai-metrics',
    label: 'AI Metrics',
    icon: BarChart3,
    path: '/ai-metrics',
  },
  {
    id: 'chat-logs',
    label: 'Chat Logs Review',
    icon: MessageSquare,
    path: '/chat-logs-review',
  },
  {
    id: 'feedback-logs',
    label: 'Feedback Logs',
    icon: ThumbsUp,
    path: '/feedback-logs-review',
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

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

      <SidebarFooter className="border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="px-4 py-3 transition-opacity duration-300">
            <div className="text-sidebar-foreground/60 text-sm">
              <p>v1.0.0</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
