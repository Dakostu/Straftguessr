import {list} from "@vercel/blob"
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({url}) => {
  try {
    const urlString = url.searchParams.get("url");
    const { blobs } = await list({prefix: "screens" + urlString});
    let singleUrl = blobs.map(imgUrl => imgUrl.url);
    return new Response(JSON.stringify(singleUrl), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  } catch (error) {
    return new Response(String(error), { status: 500 });
  }
};
