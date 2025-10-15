"use client";
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  NavbarLogo,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
} from "./ui/resizable-navbar";
import React, { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/supabase/auth";
const navItems = [
  { name: "HOME", link: "/" },
  { name: "ABOUT US", link: "/company" },
  { name: "EARN", link: "/app/earn", soon: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ""}`
    : user?.email;

  return (
    <ResizableNavbar>
      <NavBody>
        <NavbarLogo />
        <div className="flex items-center gap-8">
          <NavItems items={navItems} />
          <Link
            href="/app"
            className="px-6 py-2 text-sm bg-[#004040] hover:bg-[#003030] text-white font-semibold transition-colors z-50 relative rounded-md"
          >
            Get Started
          </Link>
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          {/* <MobileNavToggle
            isOpen={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          /> */}
        </MobileNavHeader>
        <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
          <NavItems items={navItems} onItemClick={() => setMobileOpen(false)} />
          <Link
            href="/app"
            className="px-6 py-2 bg-[#004040] hover:bg-[#003030] text-white font-semibold transition-colors block text-center mt-4 rounded-md"
          >
            Get Started
          </Link>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
}
