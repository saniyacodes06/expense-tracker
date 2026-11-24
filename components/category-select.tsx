import { CATEGORIES } from "@/lib/constants";

type CategorySelectProps = {
  id: string;
  name: string;
  defaultValue?: string;
};

export function CategorySelect({ id, name, defaultValue = CATEGORIES[0] }: CategorySelectProps) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}
