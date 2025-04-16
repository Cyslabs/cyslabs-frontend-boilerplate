"use client";

import { useColorScheme } from "@mui/material/styles";
import { Button } from "@/components/shadcn-ui/button";
import { Moon, Sun } from "lucide-react";

const ThemeSwitchButton = () => {
  const { colorScheme, setMode } = useColorScheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        setMode(colorScheme === "light" ? "dark" : "light");
      }}
      className="rounded-full"
    >
      {colorScheme === "dark" ? (
        <Sun className="h-[1.4rem] w-[1.4rem]" />
      ) : (
        <Moon className="h-[1.4rem] w-[1.4rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeSwitchButton;
