import { useLayoutEffect } from "react";

const useScrollTop = () => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};

export { useScrollTop };
