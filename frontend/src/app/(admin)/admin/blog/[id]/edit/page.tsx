import type { Metadata } from "next";

import { BlogEditorForm } from "../../blog-editor-form";

export const metadata: Metadata = {
  title: "Postni tahrirlash",
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogEditorForm postId={id} />;
}
