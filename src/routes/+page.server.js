import { supabase } from '$lib/supabaseClient';
import { SUPABASE_TABLE_NAME } from '$env/static/private';

let refreshLeaderboard = async () => {
	const currentDay = new Date().getDate();
	if (currentDay === 1 || currentDay === 15) {
		let clearLeaderboardResponse = await supabase.from(SUPABASE_TABLE_NAME).delete().neq('id', 0);
		console.log(new Date());
		console.log('leaderboard clear attempted');
		console.log(clearLeaderboardResponse);
	}
};
setInterval(refreshLeaderboard, 1000 * 60 * 60 * 24);
refreshLeaderboard();

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
