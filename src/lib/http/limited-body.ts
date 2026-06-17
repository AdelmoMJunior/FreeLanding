export class PayloadTooLargeError extends Error {
  constructor() {
    super("Payload muito grande.");
    this.name = "PayloadTooLargeError";
  }
}

function assertContentLengthWithinLimit(request: Request, maxBytes: number) {
  const contentLength = request.headers.get("content-length");

  if (contentLength && Number(contentLength) > maxBytes) {
    throw new PayloadTooLargeError();
  }
}

export async function readLimitedTextBody(request: Request, maxBytes: number) {
  assertContentLengthWithinLimit(request, maxBytes);

  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    receivedBytes += value.byteLength;

    if (receivedBytes > maxBytes) {
      throw new PayloadTooLargeError();
    }

    chunks.push(value);
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;

  chunks.forEach((chunk) => {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  });

  return new TextDecoder().decode(body);
}
