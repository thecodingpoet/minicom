const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
];

const SIZE_CLASSES = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-[13px]",
  lg: "w-11 h-11 text-[15px]",
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

export default function Avatar({ name, size = "md" }) {
  const initials = getInitials(name);
  const color = COLORS[hashCode(name || "") % COLORS.length];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 uppercase tracking-wide ${SIZE_CLASSES[size]}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  );
}
