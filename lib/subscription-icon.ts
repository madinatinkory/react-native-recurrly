import type { ImageSourcePropType } from "react-native";
import { icons } from "@/constants/icons";

const serviceDomains: Record<string, string> = {
    adobe: "adobe.com",
    amazon: "amazon.com",
    apple: "apple.com",
    canva: "canva.com",
    chatgpt: "openai.com",
    claude: "claude.ai",
    dropbox: "dropbox.com",
    figma: "figma.com",
    github: "github.com",
    google: "google.com",
    hbo: "max.com",
    max: "max.com",
    microsoft: "microsoft.com",
    netflix: "netflix.com",
    notion: "notion.so",
    openai: "openai.com",
    spotify: "spotify.com",
    youtube: "youtube.com",
    zoom: "zoom.us",
};

const bundledIcons: Record<string, ImageSourcePropType> = {
    adobe: icons.adobe,
    canva: icons.canva,
    claude: icons.claude,
    dropbox: icons.dropbox,
    figma: icons.figma,
    github: icons.github,
    notion: icons.notion,
    openai: icons.openai,
    spotify: icons.spotify,
};

export const getSubscriptionIcon = (name: string): ImageSourcePropType => {
    const normalizedName = name.trim().toLowerCase();
    const brand = Object.keys(serviceDomains).find((key) =>
        new RegExp(`(^|[^a-z0-9])${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i").test(normalizedName),
    );

    if (brand && bundledIcons[brand]) return bundledIcons[brand];

    const domain = brand
        ? serviceDomains[brand]
        : `${normalizedName.replace(/[^a-z0-9]/g, "")}.com`;
    return {
        uri: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
    };
};