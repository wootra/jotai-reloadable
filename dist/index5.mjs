import { atom as c } from "./index4.mjs";
const i = /* @__PURE__ */ new WeakMap(), l = (o, e) => (i.has(e) ? i : i.set(e, o())).get(e), f = { state: "loading" };
function p(o) {
  return l(() => {
    const e = /* @__PURE__ */ new WeakMap(), r = c(0);
    ({ BASE_URL: "/", MODE: "production", DEV: !1, PROD: !0, SSR: !1 } && "production") !== "production" && (r.debugPrivate = !0);
    const u = c(
      (a, { setSelf: s }) => {
        a(r);
        const t = a(o);
        if (!(t instanceof Promise))
          return { state: "hasData", data: t };
        const d = e.get(t);
        return d || (e.set(t, f), t.then(
          (n) => {
            e.set(t, { state: "hasData", data: n });
          },
          (n) => {
            e.set(t, { state: "hasError", error: n });
          }
        ).finally(s), f);
      },
      (a, s) => {
        s(r, (t) => t + 1);
      }
    );
    return ({ BASE_URL: "/", MODE: "production", DEV: !1, PROD: !0, SSR: !1 } && "production") !== "production" && (u.debugPrivate = !0), c((a) => a(u));
  }, o);
}
export {
  p as loadable
};
