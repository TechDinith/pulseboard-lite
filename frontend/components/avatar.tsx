import type { Member } from "@/types";

const sizes = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
} as const;

export function Avatar({
  member,
  size = "md",
}: {
  member: Partial<Member> & { name: string; initials?: string };
  size?: keyof typeof sizes;
}) {
  const initials = member.initials || member.name.charAt(0).toUpperCase();
  const color = member.color || "#6366f1";

  return (
    <span
      className={`grid shrink-0 select-none place-items-center rounded-full font-semibold text-white ${sizes[size]}`}
      style={{ backgroundColor: color }}
      title={member.name}
      aria-label={member.name}
    >
      {initials}
    </span>
  );
}
