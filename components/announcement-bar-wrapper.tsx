"use client";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/features/root";

export function AnnouncementBarWrapper() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <AnnouncementBar />;
}
