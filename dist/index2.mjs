import { atom as b } from "./index4.mjs";
const A = "--self-reload--";
function _(r, s = [], a = { forceReload: !1 }) {
  const { statusHolder: e, PromiseWrapper: n } = v(a, r), l = b(n(...s));
  l.debugLabel = "reloadable__reloadablePromiseAtom";
  const t = b(0);
  t.debugLabel = "reloadable__resetAtom";
  const m = A, y = b((i, { setSelf: u }) => {
    const c = e.value, f = i(l);
    return i(t), c.state === "init" && (e.value = { state: "loading" }, f.then((o) => (e.value = o, u(m), o)).catch((o) => {
      e.value = { state: "hasError", error: o }, u(m);
    })), e.value;
  }, (i, u, c) => {
    if (c === A) {
      u(t, i(t) + 1);
      return;
    }
    const f = e.value, { state: o } = f;
    if (o === "loading" || o === "init")
      return;
    const [h, d] = p(c, s, a);
    o === "hasData" ? d != null && d.forceReload && (e.value = { state: "init" }, u(l, n(...h))) : (e.value = { state: "init" }, u(l, n(...h)));
  });
  return y.debugLabel = "reloadable__reloadableAtom", y;
}
function v(r, s) {
  const a = { value: { state: "init" } }, e = { count: r.retry || 0, init: !1 }, n = async (...l) => {
    try {
      return e.init ? e.count-- : (e.init = !0, e.count = r.retry || 0), { state: "hasData", data: await s(...l) };
    } catch (t) {
      return e.count > 0 ? await n(...l) : (e.init = !1, r.printError && console.error(t), t instanceof Error ? { state: "hasError", error: t.message } : { state: "hasError", error: t });
    }
  };
  return { statusHolder: a, PromiseWrapper: n };
}
function p(r, s, a) {
  if (Array.isArray(r))
    return [r, a];
  if (typeof (r == null ? void 0 : r.options) == "object") {
    const e = r;
    return [e.args || s, e.options || a];
  } else
    return E(r), [s, a];
}
function E(r) {
  if (r !== void 0 && !Array.isArray(r) && typeof r != "object")
    throw new Error("reloadable atom should be called with one of the types: array(function's argument), { args?:[], } ");
}
export {
  _ as reloadable
};
