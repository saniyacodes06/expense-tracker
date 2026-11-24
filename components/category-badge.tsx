export function CategoryBadge({ category }: { category: string }) {
  return <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{category}</span>;
}
