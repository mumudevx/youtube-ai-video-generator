export function prettyString(str) {
  return str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/^[-]+|[-]+$/g, "");
}
