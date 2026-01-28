"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getCustomerPortalUrl } from "@/actions/subscription";
import { ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManageSubscriptionProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ManageSubscription({
  variant = "outline",
  size = "default",
  className,
}: ManageSubscriptionProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleManage = async () => {
    setLoading(true);
    try {
      const result = await getCustomerPortalUrl();

      if (result.status === 200 && result.url) {
        // Open in new tab
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else if (result.status === 404) {
        toast({
          title: "No Subscription",
          description: "You don't have an active subscription to manage.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to get portal URL",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleManage}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <ExternalLink className="h-4 w-4 mr-2" />
      )}
      Manage Subscription
    </Button>
  );
}
