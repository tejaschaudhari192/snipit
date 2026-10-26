import React, { createContext, useContext, useState, useEffect } from "react";
import { offlineVault } from "../core/vault-storage";

export type UIStyle = "shadcn" | "native";

interface UIStyleContextType {
    uiStyle: UIStyle;
    setUIStyle: (style: UIStyle) => Promise<void>;
}

const UIStyleContext = createContext<UIStyleContextType>({
    uiStyle: "shadcn",
    setUIStyle: async () => {},
});

export function UIStyleProvider({ children }: { children: React.ReactNode }) {
    const [uiStyle, setStyleState] = useState<UIStyle>("shadcn");

    useEffect(() => {
        offlineVault.getUIStyle().then(setStyleState);
        const unsub = offlineVault.onSync(() => {
            offlineVault.getUIStyle().then(setStyleState);
        });
        return () => unsub();
    }, []);

    const setUIStyle = async (newStyle: UIStyle) => {
        setStyleState(newStyle);
        await offlineVault.setUIStyle(newStyle);
    };

    return (
        <UIStyleContext.Provider value={{ uiStyle, setUIStyle }}>
            {children}
        </UIStyleContext.Provider>
    );
}

export function useUIStyle() {
    return useContext(UIStyleContext);
}
