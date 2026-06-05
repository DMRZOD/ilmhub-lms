import type { Metadata } from "next";

import { BlogEditorForm } from "../blog-editor-form";

export const metadata: Metadata = {
  title: "Yangi post",
};

export default function NewBlogPostPage() {
  return <BlogEditorForm />;
}
