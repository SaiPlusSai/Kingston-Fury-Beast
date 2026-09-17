import React from "react";
import { cn } from "../../lib/utils";
import { ArrowUpRight } from "lucide-react";

export function ButtonColorful({
    className,
    label = "Explore Components",
    ...props
}) {
    return (
        <button
            className={cn(
                "relative inline-flex items-center justify-center rounded-xl text-sm font-medium",
                "h-12 px-8 overflow-hidden",
                "bg-[#2C5E53] text-white", // Adaptado a la paleta Forest Green
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C5E53]/40",
                "shadow-lg",
                "group",
                className
            )}
            {...props}
        >
            {/* Gradient background effect - adaptado sutilmente a tonos bosque/esmeralda */}
            <div
                className={cn(
                    "absolute inset-0",
                    "bg-gradient-to-r from-[#2C5E53] via-[#10B981] to-[#047857]",
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-500"
                )}
            />

            {/* Content */}
            <div className="relative flex items-center justify-center gap-2">
                <span className="text-white font-bold tracking-wide">{label}</span>
                <ArrowUpRight className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
        </button>
    );
}
