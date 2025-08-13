// src/lib/color-utils.ts

/**
 * Convert OKLCH color to RGB values
 * This is a simplified conversion - for production, consider using a proper color library like culori
 */
export function oklchToRgb(
  l: number,
  c: number,
  h: number
): [number, number, number] {
  // Normalize lightness (0-1 range)
  if (l > 1) l = l / 100; // Handle percentage values

  // Convert hue to radians
  const hRad = (h * Math.PI) / 180;

  // Convert OKLCH to OKLab
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // Convert OKLab to Linear RGB (simplified matrix transformation)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let b_rgb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  // Apply gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b_rgb =
    b_rgb > 0.0031308
      ? 1.055 * Math.pow(b_rgb, 1 / 2.4) - 0.055
      : 12.92 * b_rgb;

  // Clamp to 0-255 range
  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(b_rgb * 255))),
  ];
}

/**
 * Parse OKLCH string and convert to hex color
 */
export function oklchToHex(oklchString: string): string {
  try {
    // Handle different OKLCH string formats
    let match;

    // Format: oklch(l c h) or oklch(l% c h) or oklch(l c h / alpha)
    match = oklchString.match(
      /oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*[0-9.]+%?)?\s*\)/i
    );

    if (!match) {
      // Try alternative format: oklch(l, c, h)
      match = oklchString.match(
        /oklch\(\s*([0-9.]+%?)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*[0-9.]+%?)?\s*\)/i
      );
    }

    if (!match) {
      console.warn(`Could not parse OKLCH string: ${oklchString}`);
      return "#3b82f6"; // Fallback to blue
    }

    const [, lStr, cStr, hStr] = match;

    // Parse lightness (handle percentage)
    let l = parseFloat(lStr);
    if (lStr.includes("%")) {
      l = l / 100;
    } else if (l > 1) {
      l = l / 100; // Assume values > 1 are percentages without %
    }

    // Parse chroma and hue
    const c = parseFloat(cStr);
    const h = parseFloat(hStr);

    // Validate ranges
    if (isNaN(l) || isNaN(c) || isNaN(h)) {
      throw new Error("Invalid OKLCH values");
    }

    // Convert to RGB
    const [r, g, b] = oklchToRgb(l, c, h);

    // Convert to hex
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch (error) {
    console.warn(`Failed to convert OKLCH ${oklchString} to hex:`, error);
    return "#3b82f6"; // Fallback color
  }
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g)
    .toString(16)
    .padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
}

/**
 * Get a safe color for html2canvas - converts OKLCH to hex if needed
 */
export function getSafeColor(color: string): string {
  if (color.includes("oklch")) {
    return oklchToHex(color);
  }
  return color;
}

/**
 * Extract all OKLCH colors from a CSS string and return them as a Map
 * with OKLCH strings as keys and hex equivalents as values
 */
export function extractAndConvertOklchColors(
  cssText: string
): Map<string, string> {
  const oklchColors = new Map<string, string>();

  // More comprehensive regex to match OKLCH functions
  const oklchRegex = /oklch\([^)]+\)/gi;
  const matches = cssText.match(oklchRegex);

  if (matches) {
    matches.forEach((match) => {
      if (!oklchColors.has(match)) {
        const hexColor = oklchToHex(match);
        oklchColors.set(match, hexColor);
      }
    });
  }

  return oklchColors;
}

/**
 * Replace all OKLCH colors in a CSS string with hex equivalents
 */
export function replaceOklchWithHex(cssText: string): string {
  const oklchColors = extractAndConvertOklchColors(cssText);

  let result = cssText;
  oklchColors.forEach((hexColor, oklchColor) => {
    // Use a more precise replacement to avoid partial matches
    const regex = new RegExp(
      oklchColor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );
    result = result.replace(regex, hexColor);
  });

  return result;
}
