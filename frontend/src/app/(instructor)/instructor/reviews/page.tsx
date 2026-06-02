import type { Metadata } from "next";

import { ReviewsContent } from "./reviews-content";

export const metadata: Metadata = {
  title: "Sharhlar · IlmHub",
};

export default function ReviewsPage() {
  return <ReviewsContent />;
}
