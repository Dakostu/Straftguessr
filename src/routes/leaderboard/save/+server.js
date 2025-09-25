import { json } from '@sveltejs/kit';
import { SUPABASE_TABLE_NAME } from '$env/static/private';
import { supabase } from '$lib/supabaseClient';

export async function POST({ request }) {
	const { name, points } = await request.json();
	const { error } = await supabase.from(SUPABASE_TABLE_NAME).insert({ name, points });
	if (error) {
		console.log(new Date());
		console.log('LEADERBOARD SUBMISSION FAILED');
		console.log(error);
	}
	return json({ error });
}
