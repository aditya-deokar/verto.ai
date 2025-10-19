
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
import { Check, Palette, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="flex flex-col h-full max-h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="p-4 border-b space-y-3 flex-shrink-0 bg-muted/50">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Themes
          </h2>
          <Badge variant="outline">
            {themeStats.total} Total
          </Badge>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search themes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              All ({themeStats.total})
            </TabsTrigger>
            <TabsTrigger value="light" className="text-xs">
              Light ({themeStats.light})
            </TabsTrigger>
            <TabsTrigger value="dark" className="text-xs">
              Dark ({themeStats.dark})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* New Themes Badge */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none">
            <Sparkles className="w-3 h-3 mr-1" />
            {themeStats.new} NEW THEMES
          </Badge>
        </div>
      </div>

      {/* Themes Scroll Area */}
      <ScrollArea className="flex-1 min-h-0 bg-background">
        <div className="p-4 flex flex-col space-y-3 pb-20">
          {filteredThemes.map((theme) => {
            const isNew = newThemeNames.includes(theme.name);
            const isActive = currentTheme.name === theme.name;

            return (
              <Button
                onClick={() => handleThemeChange(theme)}
                key={theme.name}
                variant={isActive ? "default" : "outline"}
                className={`
                  relative flex flex-col items-center justify-start px-4 w-full h-auto 
                  transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                  ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}
                `}
                style={{
                  fontFamily: theme.fontFamily,
                  color: theme.fontColor,
                  background: theme.gradientBackground || theme.backgroundColor,
                }}
              >
                {/* New Badge */}
                {isNew && (
                  <Badge 
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-none text-[10px] px-1.5 py-0.5"
                    variant="default"
                  >
                    NEW
                  </Badge>
                )}

                {/* Active Check Mark */}
                {isActive && (
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}

                {/* Theme Name and Accent */}
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xl font-bold">{theme.name}</span>
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-white/50"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>

                {/* Theme Preview */}
                <div className="space-y-1 w-full text-left">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: theme.accentColor }}
                  >
                    Title Preview
                  </div>
                  <div className="text-base opacity-80">
                    Body text with{" "}
                    <span 
                      style={{ 
                        color: theme.accentColor,
                        textDecoration: 'underline'
                      }}
                    >
                      accent link
                    </span>
                  </div>
                  
                  {/* Theme Type Badge */}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] px-2 py-0.5"
                      style={{
                        backgroundColor: theme.type === 'dark' ? '#1f2937' : '#f3f4f6',
                        color: theme.type === 'dark' ? '#fff' : '#000',
                      }}
                    >
                      {theme.type.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] opacity-60">
                      {theme.fontFamily}
                    </span>
                  </div>
                </div>
              </Button>
            );
          })}

          {filteredThemes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No themes found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div 
        className="p-3 border-t text-xs text-center space-y-1 flex-shrink-0 bg-muted/30 text-muted-foreground"
      >
        <p>Showing {filteredThemes.length} of {themeStats.total} themes</p>
        <p className="text-[10px]">Click any theme to apply</p>
      </div>
    </div>
  );
};

export default ThemeChooser;
