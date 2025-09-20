import { useWindowDimensions, Platform } from "react-native";

export function useResponsive() {
    const { width, height, scale: pixelScale, fontScale } = useWindowDimensions();
    const isLandscape = width > height;
    const isTablet = Math.min(width, height) >= 768;

    // Breakpoints: tweak freely
    const bp = { md: 600, lg: 900 };
    const columns = width >= bp.lg ? 3 : width >= bp.md ? 2 : 1;

    // Moderate scaling: base on iPhone 11 width (375)
    const ms = (size: number, factor = 0.5) =>
        size + ((width / 375) * size - size) * factor;

    return {
        width, height, fontScale, pixelScale,
        isLandscape, isTablet, columns, ms,
        isAndroid: Platform.OS === "android", isIOS: Platform.OS === "ios",
    };
}
