let mapsPromise: Promise<any> | null = null;

export function loadGoogleMaps(apiKey: string) {
  if (!mapsPromise) {
    mapsPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined") return;

      if ((window as any).google?.maps) {
        resolve((window as any).google.maps);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        resolve((window as any).google.maps);
      };
      script.onerror = reject;

      document.head.appendChild(script);
    });
  }
  return mapsPromise;
}
