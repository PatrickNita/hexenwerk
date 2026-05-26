"use client";

import { delay, preloadImages } from "@/lib/preload-images";
import { SITE_LOGO_SRC, SITE_PRELOAD_SRCS } from "@/lib/site-assets";
import Image from "next/image";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const POST_LOAD_HOLD_MS = 500;
const FADE_MS = 200;

type SitePreloadContextValue = {
  ready: boolean;
};

const SitePreloadContext = createContext<SitePreloadContextValue | null>(null);

export function SitePreloadProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    document.body.style.overflow = "hidden";

    preloadImages(SITE_PRELOAD_SRCS)
      .then(() => delay(POST_LOAD_HOLD_MS))
      .then(() => {
        if (cancelled) {
          return;
        }

        setReady(true);
        document.body.style.overflow = "";

        if (reducedMotion) {
          setVisible(false);
          setDone(true);
          return;
        }

        setDone(true);
        window.setTimeout(() => {
          if (!cancelled) {
            setVisible(false);
          }
        }, FADE_MS);
      });

    return () => {
      cancelled = true;
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <SitePreloadContext.Provider value={{ ready }}>
      {visible ? (
        <div
          className={done ? "site-preloader site-preloader--done" : "site-preloader"}
          aria-hidden={done}
        >
          <Image
            src={SITE_LOGO_SRC}
            alt="HEXENWERK"
            width={176}
            height={38}
            priority
            className="site-preloader__logo"
            style={{ width: "auto" }}
          />
        </div>
      ) : null}
      {children}
    </SitePreloadContext.Provider>
  );
}

export function useSitePreload() {
  const context = useContext(SitePreloadContext);

  if (!context) {
    throw new Error("useSitePreload must be used within SitePreloadProvider");
  }

  return context;
}
