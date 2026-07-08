interface RichTextContentProps {
  html: string;
  className?: string;
}

export function RichTextContent({ html, className = "" }: RichTextContentProps) {
  if (!html.trim()) return null;

  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(html);

  if (!looksLikeHtml) {
    return <p className={className}>{html}</p>;
  }

  return (
    <div
      className={`prose prose-sm prose-slate max-w-none text-inherit [&_a]:text-primary [&_a]:underline ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
