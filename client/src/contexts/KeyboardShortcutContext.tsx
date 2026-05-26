import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import CommandPalette from "@/components/CommandPalette";
import SmartSearchBar from "@/components/SmartSearchBar";

interface KeyboardShortcutContextType {
  isCommandPaletteOpen: boolean;
  isSearchOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType>({
  isCommandPaletteOpen: false,
  isSearchOpen: false,
  openCommandPalette: () => {},
  closeCommandPalette: () => {},
  openSearch: () => {},
  closeSearch: () => {},
});

export function useKeyboardShortcuts() {
  return useContext(KeyboardShortcutContext);
}

export function KeyboardShortcutProvider({ children }: { children: ReactNode }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openCommandPalette = useCallback(() => {
    setIsSearchOpen(false);
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  const openSearch = useCallback(() => {
    setIsCommandPaletteOpen(false);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K: Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isCommandPaletteOpen) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }
      }

      // Cmd+/ or Ctrl+/: Open search
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        openSearch();
      }

      // Escape: Close modals
      if (e.key === "Escape") {
        if (isCommandPaletteOpen) closeCommandPalette();
        if (isSearchOpen) closeSearch();
      }

      // Cmd+N or Ctrl+N: New record (prevent default browser behavior)
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        // Let the command palette handle this
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, isSearchOpen, openCommandPalette, closeCommandPalette, openSearch, closeSearch]);

  return (
    <KeyboardShortcutContext.Provider
      value={{
        isCommandPaletteOpen,
        isSearchOpen,
        openCommandPalette,
        closeCommandPalette,
        openSearch,
        closeSearch,
      }}
    >
      {children}

      {/* Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        onOpenSearch={openSearch}
      />

      {/* Smart Search */}
      <SmartSearchBar
        open={isSearchOpen}
        onClose={closeSearch}
      />
    </KeyboardShortcutContext.Provider>
  );
}
