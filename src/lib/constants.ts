export const MAX_ROUNDS = 15;
export const MEDIUM_START_ROUND = 7;
export const HARD_LIMIT_ROUND = 12;
export const EASY_STRING = 'Easy';
export const MEDIUM_STRING = 'Medium';
export const HARD_STRING = 'Hard';
export const INCORRECT_STRING = 'incorrect';
export const ALMOST_CORRECT_STRING = 'almost_correct';
export const CORRECT_STRING = 'correct';
export const HINTS_PER_GAME = 3;
export const MAX_HINTS_PER_ROUND = 2;
export const REVEAL_SOLUTION_WINDOW_TIMEOUT = 500;
export const REVEAL_GAME_OVER_WINDOW_TIMEOUT = 200;
export const LEADERBOARD_STRING_WHITELIST = /^[\w\s\!\?@,_\-]+$/;
export const RESPONSE_STRINGS: Record<string, readonly string[]> = {
	[INCORRECT_STRING]: [
		'No',
		'Nope',
		'Nuh-uh',
		'Nahhh',
		'Hell no',
		'What?!',
		"Ain't no way",
		'Come on...',
		'Oof',
		'Euuuuuugh',
		'What da helly?',
		"You're better than this",
		"You're kidding, right?",
		'Yikes',
		'learn',
		'Yeah... no.',
		'YOU BIG BABY!!!'
	] as const,
	[ALMOST_CORRECT_STRING]: [
		'Almost!',
		'So close...',
		'Getting warmer...',
		'Not quite...',
		"Don't give up!"
	] as const,
	[CORRECT_STRING]: [
		'Wow!',
		'Good job!',
		'Good boy!',
		'You did it!',
		'The GOAT!',
		'Splendid!',
		'Nice!!!',
		'Correct!',
		"You're right!",
		"That's the one!",
		'HOLYYYYYYYY',
		'Brilliant!',
		'Wonderful!',
		'I love you!'
	] as const
};
