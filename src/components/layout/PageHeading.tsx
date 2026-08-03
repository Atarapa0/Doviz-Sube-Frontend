import type { LucideIcon } from "lucide-react";

type PageHeadingProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export default function PageHeading({ title, description, icon: Icon }: PageHeadingProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-[#0047b3]">
          <Icon className="size-5" />
        </span>
        <h1 className="text-2xl font-bold text-[#0047b3]">{title}</h1>
      </div>
      <p className="max-w-3xl text-sm text-slate-500">{description}</p>
    </div>
  );
}
