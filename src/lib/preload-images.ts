export function preloadImages(urls: readonly string[]): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
