import {list} from '@vercel/blob'
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  try {
    const { blobs } = await list({prefix: "screens/"});
    let urls = blobs.map(blob => blob.url).filter((url) => url.endsWith("json"));
    return new Response(JSON.stringify({ urls }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    return new Response(String(error), { status: 500 });
  }
};
