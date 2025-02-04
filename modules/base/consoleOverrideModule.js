const originalConsoleLog = console.log;
console.log = function (...args) {
  const modifiedArgs = args.map((arg) => {
    if (typeof arg === "string") {
      return arg + "\n\n";
    }
    return arg;
  });
  originalConsoleLog.apply(console, modifiedArgs);
};

const originalConsoleInfo = console.info;
console.info = function (...args) {
  const modifiedArgs = args.map((arg) => {
    if (typeof arg === "string") {
      return arg + "\n\n";
    }
    return arg;
  });
  originalConsoleInfo.apply(console, modifiedArgs);
};

const originalConsoleError = console.error;
console.error = function (...args) {
  const modifiedArgs = args.map((arg) => {
    if (typeof arg === "string") {
      return arg + "\n\n";
    }
    return arg;
  });
  originalConsoleError.apply(console, modifiedArgs);
};
