let u = 0;
function y(n, i) {
  const f = `atom${++u}`, t = {
    toString: () => f
  };
  return typeof n == "function" ? t.read = n : (t.init = n, t.read = (o) => o(t), t.write = (o, c, e) => c(
    t,
    typeof e == "function" ? e(o(t)) : e
  )), i && (t.write = i), t;
}
export {
  y as atom
};
