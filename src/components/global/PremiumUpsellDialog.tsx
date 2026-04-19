"use client";

import React from "react";
import {
  Crown,
  Sparkles,
  Layers,
  Bot,
  Lock,
  Zap,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface PremiumUpsellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

const BENEFITS = [
  { icon: Layers, text: "Access all 50+ premium templates" },
  { icon: Bot, text: "Unlimited AI-powered generation" },
  { icon: Sparkles, text: "Save up to 25 private templates" },
  { icon: Zap, text: "Priority generation speed" },
];

export default function PremiumUpsellDialog({
  isOpen,
  onClose,
  feature = "this template",
}: PremiumUpsellDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden">
        {/* Gradient header */}
        <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-fuchsia-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.08),transparent_50%)]" />

          <div className="relative text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30">
              <Crown className="h-6 w-6 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Upgrade to Pro
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              <Lock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              {feature} requires a Pro subscription.
              Unlock the full power of Verto AI.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5 space-y-3">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-violet-500/10">
                  <Icon className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <span className="text-sm text-foreground/80">
                  {benefit.text}
                </span>
                <Check className="ml-auto h-4 w-4 text-emerald-400" />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="px-6 py-4 border-t border-border/50 space-y-2">
          <Link href="/settings" className="block">
            <Button className="w-full rounded-lg gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold border-0 shadow-lg shadow-amber-500/20">
              <Crown className="h-4 w-4" /> Upgrade Now
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full rounded-lg text-muted-foreground"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
