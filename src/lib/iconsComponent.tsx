import React from "react";

export function BlankCardIcon() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-3/4 h-2 bg-white rounded" />
        </div>
    );
}

export function ImageAndTextIcon() {
    return (
        <div className="w-full h-full flex gap-2">
            <div className="w-1/2 bg-white rounded" />
            <div className="w-1/2 flex flex-col gap-1">
                <div className="h-2 bg-white rounded w-full" />
                <div className="h-2 bg-white rounded w-2/3" />
            </div>
        </div>
    );
}

export function TextAndImageIcon() {
    return (
        <div className="w-full h-full flex gap-2">
            <div className="w-1/2 flex flex-col gap-1">
                <div className="h-2 bg-white rounded w-full" />
                <div className="h-2 bg-white rounded w-2/3" />
            </div>
            <div className="w-1/2 bg-white rounded" />
        </div>
    );
}

export function TwoColumnsIcon() {
    return (
        <div className="w-full h-full flex gap-3 flex-col items-center justify-center">
            <div className="w-full h-4 bg-white rounded" />
            <div className="w-full h-full flex gap-2">
                {Array.from({ length: 2 }, (_, i) => (
                    <div className="w-1/2 flex flex-col gap-1" key={i}>
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-2 bg-white rounded w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ThreeColumnsIcon() {
    return (
        <div className="w-full h-full flex gap-3 flex-col items-center justify-center">
            <div className="w-full h-4 bg-white rounded" />
            <div className="w-full h-full flex gap-2">
                {Array.from({ length: 3 }, (_, i) => (
                    <div className="w-1/2 flex flex-col gap-1" key={i}>
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-2 bg-white rounded w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function FourColumnsIcon() {
    return (
        <div className="w-full h-full flex gap-3 flex-col items-center justify-center">
            <div className="w-full h-4 bg-white rounded" />
            <div className="w-full h-full flex gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                    <div className="w-1/2 flex flex-col gap-1" key={i}>
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-2 bg-white rounded w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TwoColumnsWithHeadingsIcon() {
    return (
        <div className="w-full h-full flex gap-3 flex-col items-center justify-center">
            <div className="w-full h-4 bg-white rounded" />
            <div className="w-full h-full flex gap-2">
                {Array.from({ length: 2 }, (_, i) => (
                    <div className="w-1/2 flex flex-col gap-1" key={i}>
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ThreeColumnsWithHeadingsIcon() {
    return (
        <div className="w-full h-full flex gap-3 flex-col items-center justify-center">
            <div className="w-full h-4 bg-white rounded" />
            <div className="w-full h-full flex gap-2">
                {Array.from({ length: 2 }, (_, i) => (
                    <div className="w-1/2 flex flex-col gap-1" key={i}>
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function BulletsIcon() {
    return (
        <div className="w-full h-full flex flex-col gap-1">
            <div className="h-3 bg-gray-300 rounded w-3/4 mb-1" />
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <div className="h-2 bg-white rounded flex-1" />
                </div>
            ))}
        </div>
    );
}

export function TwoImageColumnsIcon() {
    return (
        <div className="w-full h-full flex flex-col gap-1">
            <div className="w-full h-3 bg-white rounded" />
            <div className="w-full h-8 bg-white rounded flex justify-center items-center"></div>
            <div className="w-full h-full flex gap-2">
                {Array.from({ length: 2 }, (_, i) => (
                    <div className="w-1/2 flex flex-col gap-1" key={i}>
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ThreeImageColumnsIcon() {
    return (
        <div className="w-full h-full flex flex-col gap-1">
            <div className="w-full h-3 bg-white rounded" />
            <div className="w-full h-8 bg-white rounded flex justify-center items-center"></div>
            <div className="w-full h-full flex gap-2">
                {Array.from({ length: 3 }, (_, i) => (
                    <div className="w-1/2 flex flex-col gap-1" key={i}>
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function FourImageColumnsIcon() {
    return (
        <div className="w-full h-full flex flex-col gap-1">
            <div className="w-full h-3 bg-white rounded" />
            <div className="w-full h-8 bg-white rounded flex justify-center items-center"></div>
            <div className="w-full h-full flex gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                    <div className="w-1/2 flex flex-col gap-1" key={i}>
                        <div className="h-2 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-full" />
                        <div className="h-1 bg-white rounded w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// NEW LAYOUT ICONS

export function TitleAndContentIcon() {
    return (
        <div className="w-full h-full flex flex-col gap-2 p-1">
            <div className="h-3 bg-white rounded w-3/4" />
            <div className="flex flex-col gap-1">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="h-1 bg-white rounded flex-1" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SplitContentImageIcon() {
    return (
        <div className="w-full h-full flex gap-2">
            <div className="w-1/2 flex flex-col gap-1 p-1">
                <div className="h-2 bg-white rounded w-full" />
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-1 items-center">
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="h-1 bg-white rounded flex-1" />
                    </div>
                ))}
            </div>
            <div className="w-1/2 bg-white rounded" />
        </div>
    );
}

export function BigNumberIcon() {
    return (
        <div className="w-full h-full flex gap-2">
            <div className="w-1/3 flex items-center justify-center bg-white/20 rounded">
                <div className="text-white font-bold text-xs">42%</div>
            </div>
            <div className="flex-1 flex flex-col gap-1 justify-center">
                <div className="h-2 bg-white rounded w-3/4" />
                <div className="h-1 bg-white rounded w-full" />
                <div className="h-1 bg-white rounded w-5/6" />
            </div>
        </div>
    );
}

export function ComparisonIcon() {
    return (
        <div className="w-full h-full flex flex-col gap-1">
            <div className="h-2 bg-white rounded w-2/3 mx-auto" />
            <div className="flex gap-2 flex-1">
                <div className="w-1/2 border-2 border-white/30 rounded p-1">
                    <div className="h-1 bg-white rounded w-full mb-1" />
                    <div className="h-1 bg-white/50 rounded w-3/4" />
                </div>
                <div className="w-1/2 border-2 border-white/30 rounded p-1">
                    <div className="h-1 bg-white rounded w-full mb-1" />
                    <div className="h-1 bg-white/50 rounded w-3/4" />
                </div>
            </div>
        </div>
    );
}

export function QuoteIcon() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
            <div className="text-white/40 text-xl">"</div>
            <div className="h-1 bg-white rounded w-4/5" />
            <div className="h-1 bg-white rounded w-3/5" />
            <div className="h-1 bg-white/50 rounded w-1/2 mt-1" />
        </div>
    );
}

export function TimelineIcon() {
    return (
        <div className="w-full h-full flex flex-col gap-1 p-1">
            <div className="h-2 bg-white rounded w-2/3 mx-auto mb-1" />
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-1 items-center">
                    <div className="w-1 h-full bg-white/50" />
                    <div className="flex-1">
                        <div className="h-1 bg-white rounded w-1/2 mb-0.5" />
                        <div className="h-0.5 bg-white/50 rounded w-3/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function FullImageIcon() {
    return (
        <div className="w-full h-full relative bg-white/20 rounded">
            <div className="absolute inset-0 flex flex-col justify-center items-center p-2">
                <div className="h-2 bg-white rounded w-3/4 mb-1" />
                <div className="h-1 bg-white/80 rounded w-1/2" />
            </div>
        </div>
    );
}

export function IconGridIcon() {
    return (
        <div className="w-full h-full flex flex-col gap-1">
            <div className="h-2 bg-white rounded w-2/3 mx-auto" />
            <div className="grid grid-cols-2 gap-1 flex-1">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-white/30 rounded flex flex-col items-center justify-center p-0.5">
                        <div className="text-white/60 text-xs mb-0.5">✓</div>
                        <div className="h-0.5 bg-white rounded w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SectionDividerIcon() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-white/10 rounded">
            <div className="text-white/30 text-lg font-bold">02</div>
            <div className="h-2 bg-white rounded w-3/4" />
        </div>
    );
}

export function ProcessFlowIcon() {
    return (
        <div className="w-full h-full flex flex-col gap-1 p-1">
            <div className="h-2 bg-white rounded w-2/3 mx-auto" />
            <div className="flex items-center gap-1 flex-1">
                <div className="flex-1 bg-white/20 rounded flex items-center justify-center">
                    <div className="text-white text-xs">1</div>
                </div>
                <div className="text-white text-xs">→</div>
                <div className="flex-1 bg-white/20 rounded flex items-center justify-center">
                    <div className="text-white text-xs">2</div>
                </div>
                <div className="text-white text-xs">→</div>
                <div className="flex-1 bg-white/20 rounded flex items-center justify-center">
                    <div className="text-white text-xs">3</div>
                </div>
            </div>
        </div>
    );
}

export function CallToActionIcon() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
            <div className="h-2 bg-white rounded w-3/4" />
            <div className="h-1 bg-white/60 rounded w-4/5" />
            <div className="h-2 bg-white rounded-lg w-1/2 mt-1" />
        </div>
    );
}

export function BentoGridIcon() {
    return (
        <div className="w-full h-full flex gap-1 p-1">
            <div className="w-1/3 flex flex-col gap-1">
                <div className="h-1/2 bg-white rounded" />
                <div className="h-1/2 bg-white/50 rounded" />
            </div>
            <div className="w-2/3 flex flex-col gap-1">
                <div className="h-2/3 bg-white rounded" />
                <div className="flex gap-1 h-1/3">
                    <div className="w-1/2 bg-white/50 rounded" />
                    <div className="w-1/2 bg-white rounded" />
                </div>
            </div>
        </div>
    );
}

export function CreativeHeroIcon() {
    return (
        <div className="w-full h-full flex flex-col p-1">
            <div className="flex-1 flex gap-2 items-center">
                <div className="w-1/2 flex flex-col gap-1">
                    <div className="h-3 bg-white rounded w-full" />
                    <div className="h-1 bg-white/50 rounded w-2/3" />
                </div>
                <div className="w-1/2 h-full bg-white rounded-tl-2xl rounded-bl-lg opacity-80" />
            </div>
        </div>
    );
}

export function StatsRowIcon() {
    return (
        <div className="w-full h-full flex flex-col justify-center gap-1 p-1">
            <div className="h-2 bg-white rounded w-1/3 mx-auto mb-1" />
            <div className="flex gap-1 h-1/2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-1 bg-white/20 border border-white/40 rounded flex flex-col items-center justify-center gap-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <div className="h-0.5 bg-white w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TimelineLayoutIcon() {
    return (
        <div className="w-full h-full flex flex-col justify-center p-1">
            <div className="flex gap-1 items-center relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-1 z-10 flex flex-col items-center gap-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <div className="w-full h-4 bg-white/10 rounded border border-white/20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// PREMIUM LAYOUT ICONS
// ============================================================================

export function GradientHeroIcon() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
            <div className="w-8 h-1.5 bg-white rounded-full" />
            <div className="w-6 h-0.5 bg-white/40 rounded-full" />
            <div className="w-4 h-1 bg-white/60 rounded-full mt-1 border border-white/30" />
        </div>
    );
}

export function TeamGridIcon() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
            <div className="w-6 h-0.5 bg-white rounded-full" />
            <div className="flex gap-1.5 mt-1">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                        <div className="w-2.5 h-2.5 bg-white/50 rounded-full" />
                        <div className="w-3 h-0.5 bg-white/30 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MetricDashboardIcon() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
            <div className="w-6 h-0.5 bg-white/60 rounded-full" />
            <div className="flex gap-1 mt-1">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-3 h-4 bg-white/15 rounded border border-white/20 flex flex-col items-center justify-center">
                        <div className="w-1.5 h-0.5 bg-white/50 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TestimonialIcon() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
            <div className="text-[8px] text-white/30 font-serif leading-none">&ldquo;</div>
            <div className="w-8 h-0.5 bg-white/40 rounded-full" />
            <div className="w-6 h-0.5 bg-white/25 rounded-full" />
            <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-white/40 rounded-full" />
                <div className="w-4 h-0.5 bg-white/30 rounded-full" />
            </div>
        </div>
    );
}

export function FeatureShowcaseIcon() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
            <div className="w-6 h-0.5 bg-white rounded-full" />
            <div className="grid grid-cols-2 gap-0.5 mt-1">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-4 h-3 bg-white/10 rounded border border-white/20 flex flex-col items-center justify-center gap-0.5 p-0.5">
                        <div className="w-1 h-1 bg-white/40 rounded-full" />
                        <div className="w-2.5 h-px bg-white/20 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AgendaIcon() {
    return (
        <div className="w-full h-full flex flex-col justify-center gap-1 p-1.5">
            <div className="w-5 h-0.5 bg-white rounded-full mb-0.5" />
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full flex-shrink-0" />
                    <div className="flex-1 h-0.5 bg-white/20 rounded-full" />
                </div>
            ))}
        </div>
    );
}

export function ThankYouIcon() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
            <div className="w-6 h-1 bg-white rounded-full" />
            <div className="w-5 h-0.5 bg-white/30 rounded-full" />
            <div className="w-4 h-px bg-white/20 rounded-full mt-0.5" />
            <div className="w-3 h-0.5 bg-white/20 rounded-full" />
        </div>
    );
}

export function PricingTableIcon() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
            <div className="w-6 h-0.5 bg-white/60 rounded-full" />
            <div className="flex gap-0.5 mt-1">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`w-3 h-5 rounded border flex flex-col items-center justify-center gap-0.5 ${i === 1 ? 'bg-white/20 border-white/40 scale-110' : 'bg-white/5 border-white/15'}`}
                    >
                        <div className="w-1.5 h-0.5 bg-white/40 rounded-full" />
                        <div className="w-1 h-0.5 bg-white/20 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}