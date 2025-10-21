import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CallToActionSection() {
  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6">
      <div className="text-center">
        <Link href="/app">
          <Button
            variant="outline"
            size="lg"
            className="border-2 bg-white border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-600 px-8 py-3 rounded-xl"
          >
            View Reserve Details
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
