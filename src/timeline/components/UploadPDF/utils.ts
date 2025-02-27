export function getFileNameAndExtension(fileName) {
  const regex = /^(.*)\.([^.]+)$/;
  const match = fileName.match(regex);
  if (match) {
    return {
      name: match[1].replaceAll(" ", "_"),
      ext: match[2],
    };
  }
  return null;
}