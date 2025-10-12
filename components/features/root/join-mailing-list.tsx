"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button as JoinButton } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export function JoinMailingList() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Do not set errors while typing to avoid disruptive UX
  };

  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) {
      setError("Please enter a valid email address");
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Thank you for joining!");
        setEmail("");
        setJoined(true);
      } else {
        setError(data.error || data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col sm:flex-row gap-2 w-full max-w-sm items-center"
    >
      {!joined && (
        <Input
          type="email"
          placeholder="Enter your email to join our mailing list"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          autoComplete="email"
          className={`flex-1 w-72 bg-white/80 border-slate-200 focus-visible:ring-emerald-600 ${
            error ? "border-red-300 focus-visible:ring-red-400" : ""
          }`}
          disabled={loading}
        />
      )}
      <AnimatePresence initial={false} mode="wait">
        {!joined ? (
          <motion.div
            key="join"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <JoinButton
              type="submit"
              className="bg-[#DAE5F2] hover:bg-[#DAE5F2] data-[hovered]:bg-[#DAE5F2] border-2 border-[#A7C6ED] text-[#3D5678] px-6 py-2 rounded-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              isDisabled={
                loading || (email.length > 0 && !isValidEmail(email.trim()))
              }
            >
              {loading ? <LoadingSpinner size="sm" /> : "Join"}
            </JoinButton>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {joined && (
        <div className="flex items-center justify-center w-full mt-2 flex-nowrap whitespace-nowrap">
          <CheckCircle className="h-8 w-8 text-emerald-600 mr-2" />
          <span className="text-emerald-700 font-semibold text-lg align-middle">
            {message || "Already joined!"}
          </span>
        </div>
      )}
      {error && !joined && (
        <div className="w-full text-center text-red-500 text-xs mt-2">
          {error}
        </div>
      )}
    </form>
  );
}
