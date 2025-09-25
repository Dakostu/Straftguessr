import { supabase } from '$lib/supabaseClient';
import { SUPABASE_TABLE_NAME } from '$env/static/private';

export const prerender = false;

export async function load({setHeaders}) {
    setHeaders({
        'cache-control': 'no-cache, no-store, must-revalidate',
        pragma: 'no-cache',
        expires: '0'
    });

	const { data } = await supabase
		.from(SUPABASE_TABLE_NAME)
		.select()
		.order('points', { ascending: false })
		.order('created_at', { ascending: false });

	return {
		leaderboardEntries: data || [],
        createdAt: new Date()
	};
}
