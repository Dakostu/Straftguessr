import { supabase } from '$lib/supabaseClient';
import { SUPABASE_TABLE_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET() {
	let result = null;

    result = await supabase.from(SUPABASE_TABLE_NAME).delete().neq('id', 0);
    console.log(new Date());
    console.log('leaderboard clear attempted');
    console.log(result);

	return json({ success: true, result });
}