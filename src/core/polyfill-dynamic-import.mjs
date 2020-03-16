// Following code copy from https://github.com/uupaa/dynamic-import-polyfill
function toAbsoluteURL(url) {
  const a = document.createElement("a");
  a.setAttribute("href", url);
  return a.cloneNode(false).href;
}

export function importModule(url) {
  return new Promise((resolve, reject) => {
    const vector = "$importModule$" + Math.random().toString(32).slice(2);
    const script = document.createElement("script");
    const destructor = () => {
      delete window[vector];
      script.onerror = null;
      script.onload = null;
      script.remove();
      URL.revokeObjectURL(script.src);
      script.src = "";
    };
    script.defer = "defer";
    script.type = "module";
    // For QQBrowser: if send /a/load/xxx, it will drop the cookie
    // to cause session losted.
    // add the "crossOrigin" will force send the cookie
    script.crossOrigin = "use-credentials"
    script.onerror = () => {
      reject(new Error(`Failed to import: ${url}`));
      destructor();
    };
    script.onload = () => {
      resolve(window[vector]);
      destructor();
    };
    const absURL = toAbsoluteURL(url);
    const loader = `import * as m from "${absURL}"; window.${vector} = m;`;
    const blob = new Blob([loader], { type: "text/javascript" });
    script.src = URL.createObjectURL(blob);

    document.head.appendChild(script);
  });
}

export default importModule;