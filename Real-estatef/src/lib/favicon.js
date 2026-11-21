/**
 * Dynamic Favicon Manager
 * Reliably updates the browser tab icon across Chrome, Firefox, Edge, and Safari
 * by removing old links, cache-busting the URL, and appending fresh DOM nodes.
 */

export function applyFavicon(faviconUrl) {
  if (!faviconUrl) return;

  try {
    // 1. Remove all existing icon and apple-touch-icon link tags from <head>
    const existing = document.querySelectorAll(
      "link[rel*='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
    );
    existing.forEach((node) => {
      if (node.parentNode) node.parentNode.removeChild(node);
    });

    // 2. Add cache-busting timestamp to bypass aggressive browser favicon caching
    const separator = faviconUrl.includes("?") ? "&" : "?";
    const cacheBustedUrl = `${faviconUrl}${separator}t=${Date.now()}`;

    // 3. Create fresh shortcut icon link
    const shortcutLink = document.createElement("link");
    shortcutLink.rel = "shortcut icon";
    shortcutLink.type = faviconUrl.endsWith(".ico") ? "image/x-icon" : "image/png";
    shortcutLink.href = cacheBustedUrl;
    document.head.appendChild(shortcutLink);

    // 4. Create standard icon link
    const standardLink = document.createElement("link");
    standardLink.rel = "icon";
    standardLink.type = faviconUrl.endsWith(".ico") ? "image/x-icon" : "image/png";
    standardLink.href = cacheBustedUrl;
    document.head.appendChild(standardLink);

    // 5. Create apple-touch-icon link
    const appleLink = document.createElement("link");
    appleLink.rel = "apple-touch-icon";
    appleLink.href = cacheBustedUrl;
    document.head.appendChild(appleLink);
  } catch (err) {
    console.error("Failed to dynamically update favicon:", err);
  }
}
