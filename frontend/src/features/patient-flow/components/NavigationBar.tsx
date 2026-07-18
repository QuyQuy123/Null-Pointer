import { CalendarDays, Map, Bell, HeadphonesIcon } from "lucide-react";

export type NavTab = "today" | "journey" | "notifications" | "support";

interface NavigationBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  notificationCount?: number;
}

const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Hôm nay", icon: <CalendarDays size={22} /> },
  { id: "journey", label: "Hành trình", icon: <Map size={22} /> },
  { id: "notifications", label: "Thông báo", icon: <Bell size={22} /> },
  { id: "support", label: "Hỗ trợ", icon: <HeadphonesIcon size={22} /> },
];

export function NavigationBar({ activeTab, onTabChange, notificationCount = 0 }: NavigationBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom" style={{ maxWidth: 430, margin: "0 auto" }}>
      <div className="flex items-stretch">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 min-h-[64px] relative transition-colors ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground"
            }`}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            <span className="relative">
              {tab.icon}
              {tab.id === "notifications" && notificationCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ fontSize: 10 }}
                  aria-label={`${notificationCount} thông báo mới`}
                >
                  {notificationCount}
                </span>
              )}
            </span>
            <span style={{ fontSize: 11 }} className={activeTab === tab.id ? "text-primary" : "text-muted-foreground"}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
