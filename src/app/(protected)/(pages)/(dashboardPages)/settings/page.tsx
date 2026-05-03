"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { themes } from "@/lib/constants";
import { toast } from "sonner";
import { AiConfiguration } from "./_components/AiConfiguration";
import { McpApiKeys } from "./_components/McpApiKeys";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // Account Settings State
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [receiveMarketing, setReceiveMarketing] = useState(false);

  // State for Change Password section
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Placeholder Functions
  const handleRegenerateApiKey = () => {
    // Placeholder for API key regeneration logic
    alert("API Key regeneration requested!");
  };

  const handleDeleteAccount = () => {
    // Placeholder for account deletion logic
    if (confirm("Are you sure you want to delete your account?")) {
      alert("Account deletion requested!");
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-semibold dark:text-primary backdrop-blur-lg">
            Settings
          </h1>
          <p className="text-base font-normal dark:text-secondary">
            All your settings
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="ai-config">AI Configuration</TabsTrigger>
          <TabsTrigger value="mcp-keys">MCP API Keys</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Change Password</h3>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
                <Button onClick={() => toast.success("Password changed successfully!")}>Save Password</Button>
              </div>

              <div className="pt-4">
                <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration */}
        <TabsContent value="ai-config">
          <Card>
            <CardHeader>
              <CardTitle>AI Provider Settings</CardTitle>
              <CardDescription>Configure your custom AI model providers</CardDescription>
            </CardHeader>
            <CardContent>
              <AiConfiguration />
            </CardContent>
          </Card>
        </TabsContent>

        {/* MCP API Keys */}
        <TabsContent value="mcp-keys">
          <Card>
            <CardHeader>
              <CardTitle>MCP API Keys</CardTitle>
              <CardDescription>Manage API keys for MCP client access (Claude Desktop, Cursor, Antigravity)</CardDescription>
            </CardHeader>
            <CardContent>
              <McpApiKeys />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}