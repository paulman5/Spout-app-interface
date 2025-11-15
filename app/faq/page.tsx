import FaqPage from "@/components/features/faq/faq-page";

export const metadata = {
  title: "FAQ - Spout",
  description:
    "Frequently Asked Questions about Spout's services, features, and offerings. Find answers to common queries and learn more about how Spout can help you achieve your financial goals.",
};

export default function FaqPageRoot() {
  return (
    <>
      <FaqPage />
    </>
  );
}
