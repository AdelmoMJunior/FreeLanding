export function isContentLengthWithinLimit(headers: Pick<Headers, "get">, maxBytes: number) {
  const contentLength = headers.get("content-length");

  if (!contentLength) {
    return false;
  }

  if (!/^(0|[1-9]\d*)$/.test(contentLength)) {
    return false;
  }

  const parsedContentLength = Number(contentLength);

  return Number.isSafeInteger(parsedContentLength) && parsedContentLength >= 0 && parsedContentLength <= maxBytes;
}
