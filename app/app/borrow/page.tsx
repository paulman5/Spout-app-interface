"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BorrowPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-none border border-[#004040]/15 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#004040]">Borrow (Beta)</h1>
        <p className="mt-3 text-sm text-slate-600">
          Borrowing is coming soon. We&apos;re finalizing the vaults and risk controls
          required for compliant access to liquidity.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Want early access or have questions? Reach out to the team and we&apos;ll
          notify you once borrowing is live.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="mailto:team@spoutfinance.xyz">Contact Team</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/app/earn">View Earn Opportunities</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

