export type PlatformType = "android" | "ios" | "desktop" | "web";

export function getPlatform(): PlatformType {
  if (typeof window === "undefined") {
    return "web";
  }

  const ua = window.navigator.userAgent || "";

  if (ua.includes("Electron")) {
    return "desktop";
  }

  if (ua.includes("Android")) {
    return "android";
  }

  if (ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iPod")) {
    return "ios";
  }

  return "web";
}

export function isMobilePlatform() {
  const platform = getPlatform();
  return platform === "android" || platform === "ios";
}
