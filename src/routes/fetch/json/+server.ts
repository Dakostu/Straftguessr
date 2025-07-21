import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({url}) => {
  const urlString = url.searchParams.get('url');
  try {
    const json = await fetch('' + urlString);
    const jsonData = await json.json();
    return new Response(JSON.stringify(jsonData), {
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
