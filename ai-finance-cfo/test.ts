let x: unknown = "hello";

try {
  const n = (x as string).length;
  console.log(n);
} catch (e) {
  console.log(e);
}