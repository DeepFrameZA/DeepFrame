import { useEffect, useState } from "react";

/**
 * useHasScrolled
 *
 * A custom React hook that detects whether the user has scrolled down from the top of the page.
 *
 * @function
 * @returns {boolean} `true` if the page has been scrolled vertically (scrollY > 0), `false` otherwise.
 *
 * @example
 * import useHasScrolled from './useHasScrolled';
 *
 * const Header = () => {
 *   const hasScrolled = useHasScrolled();
 *
 *   return (
 *     <header className={hasScrolled ? 'header-scrolled' : 'header'}>
 *       My Website
 *     </header>
 *   );
 * };
 *
 * @note This hook depends on the `window` object and should only be used in the browser.
 * It will not work correctly during server-side rendering (SSR) because `window` is undefined on the server.
 *
 * If you're using a framework like Next.js, consider delaying the use of this hook until after the component
 * has mounted on the client side to avoid runtime errors.
 *
 * Example SSR-safe usage:
 *
 * const MyComponent = () => {
 *   const [hasMounted, setHasMounted] = useState(false);
 *   const hasScrolled = hasMounted ? useHasScrolled() : false;
 *
 *   useEffect(() => {
 *     setHasMounted(true);
 *   }, []);
 *
 *   return <p>{hasScrolled ? 'You have scrolled' : 'Top of the page'}</p>;
 * };
 */

const useHasScrolled = () => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    // Initial check
    handleScroll();

    // Listen to scroll changes
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return hasScrolled;
};

export default useHasScrolled;
