
import { updateTheme } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { themes } from "@/lib/constants";
import { Theme } from "@/lib/types";
import { useSlideStore } from "@/store/useSlideStore";
import { useTheme } from "next-themes";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Check, Palette, Sparkles, Search, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ThemeChooser = () => {
  const { currentTheme, setCurrentTheme, project } = useSlideStore();
  const { setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "light" | "dark">("all");

  const handleThemeChange = async (theme: Theme) => {
    if (!project) {
      toast.error("Error", {
        description: "Failed to update theme",
      });
      return;
    }

    setTheme(theme.type);
    setCurrentTheme(theme);
    try {
      const res = await updateTheme(project.id, theme.name);

      if (res.status !== 200) {
        throw new Error("Failed to update theme");
      }

      toast.success("Success", {
        description: `Theme changed to ${theme.name}`,
        icon: <Palette className="w-4 h-4" />,
      });
    } catch (error) {
      console.log(error);
      toast.error("Error", {
        description: "Failed to update theme",
      });
    }
  };

  // New themes from the latest additions
  const newThemeNames = [
    "Crimson Velvet", "Mint Cream", "Midnight Navy", "Peachy Keen",
    "Electric Storm", "Lemon Sorbet", "Forest Twilight", "Strawberry Milk",
    "Graphite Steel", "Buttercup Fields", "Violet Dusk", "Sky Canvas",
    "Burgundy Noir", "Aqua Breeze", "Mocha Luxe", "Blush Rose",
    "Neon Genesis", "Honey Wheat", "Deep Ocean", "Lilac Dream",
    "Slate Carbon", "Tangerine Splash", "Indigo Ink", "Sage Garden",
    "Ruby Passion", "Coconut Cloud", "Teal Depths", "Cotton Candy",
    "Obsidian Flame", "Amber Glow",
  ];

  // Filter and categorize themes
  const filteredThemes = useMemo(() => {
    return themes.filter(theme => {
      const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        theme.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const themeStats = useMemo(() => {
    const stats = {
      total: themes.length,
      light: themes.filter(t => t.type === "light").length,
      dark: themes.filter(t => t.type === "dark").length,
      new: themes.filter(t => newThemeNames.includes(t.name)).length,
    };
    return stats;
  }, []);

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden bg-transparent">
      {/* Header */}
      <div className="p-4 shrink-0 bg-transparent space-y-4">

        {/* Search Bar */}
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
            type="text"
            placeholder="Search premium themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
            />
        </div>

        <div className="flex items-center justify-between gap-2">
            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/40 p-1 rounded-xl">
                <TabsTrigger value="all" className="text-xs rounded-lg active:scale-95 transition-all">
                All
                </TabsTrigger>
                <TabsTrigger value="light" className="text-xs rounded-lg active:scale-95 transition-all">
                Light
                </TabsTrigger>
                <TabsTrigger value="dark" className="text-xs rounded-lg active:scale-95 transition-all">
                Dark
                </TabsTrigger>
            </TabsList>
            </Tabs>
        </div>
      </div>

      {/* Themes Scroll Area */}
      <ScrollArea className="flex-1 min-h-0 bg-transparent">
        <div className="px-4 flex flex-col space-y-4 pb-24">
            <AnimatePresence>
          {filteredThemes.map((theme) => {
            const isNew = newThemeNames.includes(theme.name);
            const isActive = currentTheme.name === theme.name;

            return (
              <motion.button
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleThemeChange(theme)}
                key={theme.name}
                className={cn(
                  "relative flex flex-col items-center justify-start p-4 w-full h-auto rounded-2xl outline-none overflow-hidden",
                  "transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-md hover:shadow-xl",
                  isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "ring-1 ring-border/10 hover:ring-primary/40"
                )}
                style={{
                  fontFamily: theme.fontFamily,
                  color: theme.fontColor,
                  background: theme.gradientBackground || theme.backgroundColor,
                }}
              >
                {/* New Badge */}
                {isNew && (
                  <div className="absolute top-3 left-3 bg-linear-to-r from-orange-500 to-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md shadow-orange-500/20 flex items-center gap-1 border border-white/20">
                    <Sparkles className="w-2.5 h-2.5" />
                    NEW
                  </div>
                )}

                {/* Active Check Mark */}
                {isActive && (
                  <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md rounded-full px-2 py-1 shadow-sm flex items-center gap-1 border border-primary/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-foreground">APPLIED</span>
                  </div>
                )}

                {/* Theme Preview Content */}
                <div className="w-full flex flex-col items-start gap-3 mt-6">
                  {/* Theme Name and Accent */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xl font-bold tracking-tight">{theme.name}</span>
                    <div
                      className="w-5 h-5 rounded-full ring-2 ring-background/50 shadow-sm"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>

                  <div className="w-full text-left space-y-1.5 opacity-90">
                    <div className="text-3xl font-black tracking-tighter" style={{ color: theme.accentColor }}>
                      Title Extra Bold
                    </div>
                    <div className="text-base font-medium opacity-80 leading-snug">
                      Body text displaying typography with an{" "}
                      <span style={{ color: theme.accentColor, borderBottom: `2px solid ${theme.accentColor}80` }}>
                        accent highlight
                      </span>.
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex items-center gap-2 mt-2 w-full">
                    <Badge
                      variant="secondary"
                      className="text-[9px] uppercase font-bold tracking-wider px-2 py-0 border-none shadow-sm"
                      style={{
                        backgroundColor: theme.type === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)',
                        color: theme.type === 'dark' ? '#fff' : '#000',
                      }}
                    >
                      {theme.type}
                    </Badge>
                    <span className="text-[10px] opacity-60 font-medium">
                      {theme.fontFamily.split(',')[0]}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
          </AnimatePresence>

          {filteredThemes.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center gap-3 opacity-50">
              <Palette className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">No themes found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none flex justify-center">
        <div className="bg-background/80 backdrop-blur-md border border-border/50 text-muted-foreground shadow-lg px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 pointer-events-auto">
            Showing {filteredThemes.length} of {themeStats.total}
        </div>
      </div>
    </div>
  );
};

export default ThemeChooser;
