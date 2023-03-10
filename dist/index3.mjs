import { atom as r } from "./index4.mjs";
import { loadable as b } from "./index5.mjs";
function A(o) {
  const a = r(o()), e = b(a);
  return r((t) => t(e), (t, m, l = o) => {
    (l !== o || t(e).state === "hasError") && m(a, l());
  });
}
export {
  A as reloadable
};
