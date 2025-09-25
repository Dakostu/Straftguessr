import { supabase } from '$lib/supabaseClient';
import { SUPABASE_TABLE_NAME } from '$env/static/private';

export async function load({setHeaders}) {
    setHeaders({
		'cache-control': 'no-store'
	});
    let newData;
	const { data } = await supabase
		.from(SUPABASE_TABLE_NAME)
		.select()
		.order('points', { ascending: false })
		.order('created_at', { ascending: false });

    newData = data;
	return {
		leaderboardEntries: newData || [],
        createdAt: new Date()
	};
}
