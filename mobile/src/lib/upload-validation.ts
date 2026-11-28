export type DetectedFileKind =
  | { kind: "image"; ext: ".jpg"; contentType: "image/jpeg" }
  | { kind: "image"; ext: ".png"; contentType: "image/png" }
  | { kind: "image"; ext: ".webp"; contentType: "image/webp" }
  | { kind: "image"; ext: ".gif"; contentType: "image/gif" }
  | { kind: "video"; ext: ".mp4"; contentType: "video/mp4" }
  | { kind: "video"; ext: ".webm"; contentType: "video/webm" };

export function detectFileKind(bytes: Uint8Array): DetectedFileKind | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { kind: "image", ext: ".jpg", contentType: "image/jpeg" };
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { kind: "image", ext: ".png", contentType: "image/png" };
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { kind: "image", ext: ".gif", contentType: "image/gif" };
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { kind: "image", ext: ".webp", contentType: "image/webp" };
  }
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    return { kind: "video", ext: ".mp4", contentType: "video/mp4" };
  }
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return { kind: "video", ext: ".webm", contentType: "video/webm" };
  }
  return null;
}
