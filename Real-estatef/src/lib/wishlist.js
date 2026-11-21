import { useState, useEffect, useCallback } from "react";
import { client } from "../client/store";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "primenest_wishlist";

export function getStoredWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWishlist(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("primenest_wishlist_updated"));
  } catch {
    // Ignore storage errors
  }
}

export function useWishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => getStoredWishlist());

  // Load favorites from DB if user is authenticated
  useEffect(() => {
    if (!user) return;
    client
      .favorites()
      .then((data) => {
        const favs = data?.favorites || [];
        const dbIds = favs.map((p) => p._id || p.id).filter(Boolean);
        if (dbIds.length > 0) {
          const current = getStoredWishlist();
          const merged = Array.from(new Set([...current, ...dbIds]));
          saveWishlist(merged);
          setWishlist(merged);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const handleUpdate = () => {
      setWishlist(getStoredWishlist());
    };
    window.addEventListener("primenest_wishlist_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("primenest_wishlist_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const toggleWishlist = useCallback(
    async (id) => {
      const current = getStoredWishlist();
      const exists = current.includes(id);
      const updated = exists ? current.filter((item) => item !== id) : [...current, id];
      saveWishlist(updated);
      setWishlist(updated);

      // Save to database if user is logged in
      if (user) {
        try {
          await client.toggleFavorite(id);
        } catch (e) {
          console.warn("Favorite DB sync notice:", e.message);
        }
      }

      return !exists;
    },
    [user]
  );

  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);

  return { wishlist, toggleWishlist, isWishlisted, count: wishlist.length, user };
}
