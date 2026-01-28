"use client";

import { useEffect, useState } from "react";
import { Subscription, SubscriptionStatus as SubscriptionStatusEnum } from "@/generated/prisma";
import { getSubscription } from "@/actions/subscription";
import { Badge } from "@/components/ui/badge";
import { Crown, AlertTriangle, Clock, Pause } from "lucide-react";

interface SubscriptionStatusProps {
  className?: string;
}

export function SubscriptionStatus({ className }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const result = await getSubscription();
        if (result.status === 200 && result.data) {
          setSubscription(result.data);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <Badge variant="outline" className={`animate-pulse ${className}`}>
        Loading...
      </Badge>
    );
  }

  if (!subscription) {
    return (
      <Badge variant="outline" className={`gap-1 ${className}`}>
        Free Plan
      </Badge>
    );
  }

  const statusConfig: Record<SubscriptionStatusEnum, {
    label: string;
    icon: React.ReactNode;
    className: string;
  }> = {
    ACTIVE: {
      label: "Pro",
      icon: <Crown className="h-3 w-3" />,
      className: "bg-vivid/10 text-vivid border-vivid/30",
    },
    ON_TRIAL: {
      label: "Trial",
      icon: <Clock className="h-3 w-3" />,
      className: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: <AlertTriangle className="h-3 w-3" />,
      className: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    },
    EXPIRED: {
      label: "Expired",
      icon: <AlertTriangle className="h-3 w-3" />,
      className: "bg-red-500/10 text-red-500 border-red-500/30",
    },
    PAST_DUE: {
      label: "Past Due",
      icon: <AlertTriangle className="h-3 w-3" />,
      className: "bg-red-500/10 text-red-500 border-red-500/30",
    },
    PAUSED: {
      label: "Paused",
      icon: <Pause className="h-3 w-3" />,
      className: "bg-gray-500/10 text-gray-500 border-gray-500/30",
    },
    UNPAID: {
      label: "Unpaid",
      icon: <AlertTriangle className="h-3 w-3" />,
      className: "bg-red-500/10 text-red-500 border-red-500/30",
    },
  };

  const config = statusConfig[subscription.status];

  return (
    <Badge className={`gap-1 ${config.className} ${className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
