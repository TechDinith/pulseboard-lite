import type { Member } from "@/types";

const sizes = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
} as const;

export function Avatar({
  member,
  size = "md",
}: {
  member: Member;
  size?: keyof typeof sizes;
}) {
  return (
    <span
      className={`grid shrink-0 select-none place-items-center rounded-full font-semibold text-white ${sizes[size]}`}
      style={{ backgroundColor: member.color }}
      title={member.name}
      aria-label={member.name}
    >
      {member.initials}
    </span>
  );
}
