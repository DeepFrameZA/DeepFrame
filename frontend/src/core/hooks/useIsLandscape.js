import { useEffect, useState } from "react";

/**
 * useIsLandscape
 *
 * A custom React hook that returns a boolean indicating if the screen orientation is landscape.
 *
 * @function
 * @returns {boolean} `true` if the device is in landscape mode, `false` if in portrait.
 *
 * @example
 * import useIsLandscape from './useIsLandscape';
 *
 * const MyComponent = () => {
 *   const isLandscape = useIsLandscape();
 *
 *   return <p>{isLandscape ? 'Landscape' : 'Portrait'}</p>;
 * };
 *
 * @note Only works in the browser. Avoid using during server-side rendering (SSR).
 */

const useIsLandscape = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: landscape)");

    const handleOrientationChange = (e) => {
      setIsLandscape(e.matches);
    };

    // Initial check
    handleOrientationChange(mediaQuery);

    // Listen to changes
    mediaQuery.addEventListener("change", handleOrientationChange);

    return () => {
      mediaQuery.removeEventListener("change", handleOrientationChange);
    };
  }, []);

  return isLandscape;
};

export default useIsLandscape;
