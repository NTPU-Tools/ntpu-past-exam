// Polyfill for Promise.withResolvers (needed by pdfjs-dist v4, used by react-pdf v9)
if (typeof Promise.withResolvers === "undefined") {
  // @ts-ignore
  Promise.withResolvers = function <T>() {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}
