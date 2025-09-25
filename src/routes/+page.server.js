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

export async function load() {
	const { data } = await supabase.from(SUPABASE_TABLE_NAME).select();
	data?.sort(function sortEntries(a, b) {
		return a.points > b.points
			? -1
			: a.points < b.points
				? 1
				: a.created_at < b.created_at
					? -1
					: a.created_at > b.crated_at
						? 1
						: 0;
	});
	data?.forEach((entry) => {
		entry.created_at = new Date(entry.created_at).toLocaleString();
	});
	return {
		leaderboardEntries: data ?? []
	};
}
