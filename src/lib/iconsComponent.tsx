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