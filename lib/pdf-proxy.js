const TRUSTED_PDF_HOSTS = new Set([
  "arxiv.org",
  "www.roboticsproceedings.org",
  "proceedings.mlr.press",
]);

/**
 * Serve the publisher's original PDF from this site's origin so PDF frames
 * aren't blocked by remote X-Frame-Options / frame-ancestors policies.
 * The caller supplies the source URL exclusively from our static paper index.
 *
 * @param {string} sourceUrl
 * @param {{range?: string|null, filename: string, fetcher?: typeof fetch}} options
 * @returns {Promise<Response>}
 */
export async function proxyOriginalPdf(sourceUrl, {range, filename, fetcher = fetch}) {
  let source;
  try {
    source = new URL(sourceUrl);
  } catch {
    return new Response("Đường dẫn PDF không hợp lệ.", {status: 400});
  }
  if (source.protocol !== "https:" || !TRUSTED_PDF_HOSTS.has(source.hostname)
    || (source.username || source.password)) {
    return new Response("Nguồn PDF không được phép.", {status: 400});
  }

  const headers = new Headers({
    "Accept": "application/pdf",
    "User-Agent": "RoboticsAtlas/1.0 (research paper reader)",
  });
  if (range && /^bytes=\d*-\d*(?:,\d*-\d*)*$/.test(range)) {
    headers.set("Range", range);
  }

  let upstream;
  try {
    upstream = await fetcher(source.href, {
      headers,
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return new Response("Chưa tải được PDF từ nguồn phát hành. Hãy mở liên kết bản gốc.", {
      status: 502,
      headers: {"Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store"},
    });
  }
  if (![200, 206].includes(upstream.status) || !upstream.body) {
    return new Response("Nguồn phát hành hiện không cung cấp PDF để xem trực tiếp.", {
      status: 502,
      headers: {"Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store"},
    });
  }
  const contentType = upstream.headers.get("content-type")?.toLowerCase() || "";
  if (contentType && !contentType.includes("application/pdf")
      && !contentType.includes("application/octet-stream")) {
    await upstream.body.cancel();
    return new Response("Nguồn hiện trả về nội dung khác PDF.", {
      status: 502,
      headers: {"Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store"},
    });
  }

  const responseHeaders = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'inline; filename="' + filename.replace(/[^a-z0-9_-]/gi, "-") + '.pdf"',
    "Cache-Control": "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Range",
  });
  for (const key of ["content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const value = upstream.headers.get(key);
    if (value) responseHeaders.set(key, value);
  }
  return new Response(upstream.body, {status: upstream.status, headers: responseHeaders});
}
