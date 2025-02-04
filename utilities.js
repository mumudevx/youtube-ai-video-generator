import path from "path";

export function joinPath(...paths) {
  // Use native path.join first
  const joined = path.join(...paths);
  // Replace all backslashes with forward slashes
  return joined.replace(/\\/g, "/");
}
