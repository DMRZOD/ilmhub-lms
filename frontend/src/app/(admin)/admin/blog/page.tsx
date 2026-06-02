import type { Metadata } from "next";

import { BlogListContent } from "./blog-list-content";

export const metadata: Metadata = {
  title: "Blog · IlmHub",
};

export default function AdminBlogPage() {
  return <BlogListContent />;
}
