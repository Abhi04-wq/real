import React from "react";
import { cn } from "../../utils/cn";

export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "grid md:grid-cols-3 gap-6 max-w-7xl mx-auto auto-rows-[24rem]",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-xl transition-all duration-300 shadow-sm p-6 bg-white border border-slate-200 justify-between flex flex-col space-y-4 cursor-pointer relative overflow-hidden",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-1 transition duration-200 z-20 relative">
        <div className="flex items-center gap-2 mb-2">
          {icon}
        </div>
        <div className="font-sans font-black text-gray-200 text-lg mb-1 group-hover/bento:text-white transition-colors">
          {title}
        </div>
        <div className="font-sans font-medium text-gray-300 text-xs leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};