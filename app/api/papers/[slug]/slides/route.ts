import {getPaper} from "@/lib/papers";
import {getResearchSlides} from "@/lib/slides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A slide deck is fetched only after a reader selects the Slides tab. */
export async function GET(
  _request: Request,
  {params}: {params: Promise<{slug: string}>},
) {
  const {slug} = await params;
  if (!getPaper(slug)) {
    return Response.json({error: "Không tìm thấy bài nghiên cứu."}, {status: 404});
  }
  const slides = await getResearchSlides(slug);
  return Response.json(slides, {
    headers: {"Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"},
  });
}
