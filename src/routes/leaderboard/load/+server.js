import { supabase } from '$lib/supabaseClient';
import { SUPABASE_TABLE_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET() {
	if (!supabase) {
		console.error('unable to load leaderboard: missing Supabase client instance');
		return json({leaderboardEntries: []})
	}
	const { data } = await supabase
		.from(SUPABASE_TABLE_NAME)
		.select()
		.order('points', { ascending: false })
		.order('created_at', { ascending: false });

	return new Response(
		JSON.stringify({
			leaderboardEntries: data || [],
			createdAt: new Date().toISOString()
		}),
		{
			headers: {
				'content-type': 'application/json',
				'cache-control': 'no-cache, no-store, must-revalidate',
				pragma: 'no-cache',
				expires: '0'
			}
		}
	);
}
