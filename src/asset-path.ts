export function assetPath(path: string) {
  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${normalisedPath}`;
}
