<script>
	import {fly, fade} from 'svelte/transition'
	import pic from '$lib/images/Untitled.png'	
	import Svelecte from 'svelecte'

	const mapNames = ["Red", "Yellow", "Green"]
	let choices = ["", "", ""]
	let { choice = $bindable() } = $props();
	let currentTry = $state(0)
	let successfulRounds = $state(0);
	let failedRounds = $state(0);
	let floatingTexts = $state([""]);
	let currentRound = $derived(1 + $state.snapshot(successfulRounds) + $state.snapshot(failedRounds));
	let currentDifficulty = "Easy";
	const MAX_ROUNDS = 15;
	const MEDIUM_START_ROUND = 7;
	const HARD_LIMIT_ROUND = 12;
	const EASY_STRING = "Easy";
	const MEDIUM_STRING = "Medium";
	const HARD_STRING = "Hard";



	const RedMessages = [
		"No", 
		"Nope",
		"Nuh-uh",
		"Nahhh", 
		"Hell no", 
		"What?!", 
		"Ain't no way",
		"Come on...",
		"Oof",
		"Euuuuuugh",
		"What da helly?",
		"You're better than this",
		"You're kidding, right?",
		"Yikes",
	];
	const YellowMessages = [
		"Almost!", 
		"So close...", 
		"Getting warmer...", 
		"Not quite...",
	];
	const GreenMessages = [
		"Wow!", 
		"Good job!", 
		"Good boy!", 
		"You did it!", 
		"The GOAT!", 
		"Splendid!",
		"Nice!!!",
		"Correct!",
		"You're right!"
	];

	function submitGuess(event) {
		console.log($state.snapshot(choices));
		if (!choices[currentTry]) {
			//return;
		}
		
		// submit choices[currentTry]
		// If correct, calculate points according to guess, ++completedRounds,
		// transition to end screen		

		const buttonRect = event.target.getBoundingClientRect();
		const containerRect = event.target.closest('.guess-box').getBoundingClientRect();
		const top = buttonRect.top - containerRect.top;
		console.log(top);
		
		const id = Math.random();
		const floatingText = RedMessages[Math.floor(Math.random() * RedMessages.length)];
		floatingTexts.push({id, top, text: floatingText});		

		setTimeout(() => {
			floatingTexts = floatingTexts.filter(t => t.id !== id);
		}, 10);

		
		document.getElementById("guess" + currentTry).disabled = true;
		if (currentTry < 2) {
			++currentTry;
			document.getElementById("guess" + currentTry).disabled = false;
			return;
		} 

		// We're done, transition to end screen
		++failedRounds;
		//if (currentRound > )
	}
</script>

<svelte:head>
	<title>STRAFTGUESSR ROUND {currentRound}/15</title>
	<meta name="description" content="A STRAFTGUESSR game" />
</svelte:head>

<div class="game-box">
	<h1>WHAT MAP IS THIS?</h1>
	<hr>
	<img src={pic} alt="An alt text" />
	<hr>
	<h2>Round {currentRound}/15<br>Difficulty: {currentDifficulty}</h2>

	<div class="guess-box">		
		<Svelecte class="guess-text" id="guess0" options={mapNames} placeholder="First Guess" />
		<Svelecte class="guess-text" id="guess1" options={mapNames} disabled placeholder="Second Guess" />
		<Svelecte class="guess-text" id="guess2" options={mapNames} disabled placeholder="Third Guess" />
		{#each floatingTexts as t(t.id)}
			<div id="failFly" out:fly={{y: -100, duration: 2500}}>
				<div id="failText" out:fade={{duration: 5000}}>
				{t.text}
				</div>
			</div>
		{/each}
		<button id="guessButton" onclick={submitGuess}>
			LOCK IN
		</button>
	</div>
</div>

<style>	
h1 {
	margin: 1% auto
}

:global(.guess-text) {	
	--sv-bg: var(--black);	
	--sv-disabled-bg: var(--black);
	--sv-control-bg: var(--black);	
	--sv-border: 1px solid var(--straftat-green);
	--sv-dropdown-selected-bg: var(--black);
	--sv-dropdown-border: var(--straftat-green);	
	
}

:global(.guess-text):disabled {
	--sv-border: 10px solid var(--straftat-green);
}

.game-box {
	display: flex;
	max-width: 90%;
	flex: 0.6;
	flex-direction: column;
	justify-content: center;
	margin: 0 auto;
	border-radius: 3%;
	border-color: var(--straftat-green);
	border-style: solid;
	border-width: thin;
}

.guess-box {
	display: flex;
	
	flex-direction: column;
	justify-content: center;
	margin: 1% 30%;
	
}

#failFly {
	position: absolute;
	transform: translateX(-50%);
	left: 50%;
	margin-top: 80px;
	
}

#failText {
	color: red;
	-webkit-text-stroke: 0.05em black;
}


</style>
