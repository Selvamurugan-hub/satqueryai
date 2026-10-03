"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Satellite, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  ShieldCheck, 
  Menu, 
  X,
  Sparkles,
  Layers,
  History,
  FileText,
  Settings,
  CheckCircle2,
  Info
} from "lucide-react";
import { useTheme } from "@/lib/theme";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onToggleSidebar, isSidebarOpen }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Engine Ready", desc: "SIH26167 Task Router calibrated & active.", time: "Just now", read: false },
    { id: 2, title: "Report Generated", desc: "Urban Expansion PDF ready for download.", time: "5m ago", read: false },
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/history?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Sidebar Toggle & Branding */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors lg:hidden"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center space-x-3 group select-none">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-md shadow-teal-600/20 border border-teal-500/30 group-hover:scale-105 group-hover:shadow-teal-500/30 transition-all duration-200">
              <Image 
                src="/icon.svg" 
                alt="SatQuery AI Logo" 
                width={40} 
                height={40} 
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 leading-none">
                <span className="font-bold tracking-tight text-lg text-slate-900 dark:text-slate-100">SatQuery</span>
                <span className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-teal-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">AI</span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wide mt-1">Satellite Intelligence Studio</p>
            </div>
          </Link>
        </div>

        {/* Center Section: Global Search Bar */}
        <div ref={searchRef} className="relative hidden md:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search satellite analyses, locations, or sensor types... (Ctrl+K)"
                className="w-full rounded-xl border border-border bg-secondary/50 pl-9 pr-12 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-border/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground border border-border">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Quick Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card p-2 shadow-card-hover z-50 animate-in fade-in slide-in-from-top-1">
              <p className="px-2 py-1 text-[10px] font-mono uppercase text-muted-foreground">Quick Suggestions</p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    router.push("/analyze?preset=urban_expansion");
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-foreground rounded-lg hover:bg-secondary text-left"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Urban Expansion (2020-2024 Change)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">Preset</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    router.push("/analyze?preset=coastal_harbor_sar");
                    setIsSearchOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-foreground rounded-lg hover:bg-secondary text-left"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-cyan-500" />
                    Optical + SAR Radar Harbor Fusion
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">Preset</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Status, Theme Toggle, Notifications, Profile */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Online Engine Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden xl:inline">Engine Online</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/40 shadow-sm transition-all"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-slate-700 hover:text-primary transition-colors" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400 transition-colors" />
            )}
          </button>

          {/* Notification Popover */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/40 shadow-sm transition-all"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-teal-500" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card p-3 shadow-card-hover z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-bold text-foreground">Notifications</span>
                  <span className="text-[10px] font-mono text-primary font-semibold">2 New</span>
                </div>
                <div className="divide-y divide-border/60 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                        <span className="text-[9px] text-muted-foreground font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center space-x-2 pl-1 border-l border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-700 to-cyan-500 text-white font-bold text-xs shadow-sm ring-2 ring-primary/20">
              SQ
            </div>
            <div className="hidden lg:block text-left leading-none">
              <p className="text-xs font-bold text-foreground">Remote Sensing Lead</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">SIH 2026 Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
