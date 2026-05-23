"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/components/site-header";

export default function ScrollAwareHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = document.getElementById("s2");
    const root = document.querySelector(".snap-root");

    if (!section || !root) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        root,
        threshold: 0.05,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <SiteHeader className={visible ? "site-header--visible" : undefined} />
  );
}
