import {getPaper} from "@/lib/papers";
import {proxyOriginalPdf} from "@/lib/pdf-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The paper metadata is the only PDF source. No caller-supplied URLs,
 * to avoid exposing the server as an arbitrary download / SSRF proxy.
 */
export async function GET(
  request: Request,
  {params}: {params: Promise<{slug: string}>},
) {
  const {slug} = await params;
  const paper = getPaper(slug);
  if (!paper) {
    return new Response("Không tìm thấy bài nghiên cứu.", {status: 404});
  }
  return proxyOriginalPdf(paper.pdf, {
    filename: paper.slug,
    range: request.headers.get("range"),
  });
}
