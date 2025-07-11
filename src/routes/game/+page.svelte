<script>
	import {fly, fade} from 'svelte/transition'
	import pic from '$lib/images/Untitled.png'	
	import Svelecte from 'svelecte'

	const mapNames = ["Red", "Yellow", "Green"]
	let guesses = $state(["", "", ""]);
	let test = $state("");
	let floatingTexts = $state([]);
	const MAX_ROUNDS = 15;
	const MEDIUM_START_ROUND = 7;
	const HARD_LIMIT_ROUND = 12;
	const EASY_STRING = "Easy";
	const MEDIUM_STRING = "Medium";
	const HARD_STRING = "Hard";
	const INCORRECT = "incorrect";
	const ALMOST_CORRECT = "almost_correct";
	const CORRECT = "correct";
	
	let gameInfo = $state({
		currentRound : 1,
		currentTry : 0,
		successfulRounds : 0,
		failedRounds : 0,
		currentDifficulty : EASY_STRING,
		currentScore : 0
	});

	const responses = {
		[INCORRECT] : [
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
		],
		[ALMOST_CORRECT] : [
			"Almost!", 
			"So close...", 
			"Getting warmer...", 
			"Not quite...",
		],
		[CORRECT] : [
			"Wow!", 
			"Good job!", 
			"Good boy!", 
			"You did it!", 
			"The GOAT!", 
			"Splendid!",
			"Nice!!!",
			"Correct!",
			"You're right!",
		]
	}

	
	function createFloatingText(guessCategory, event) {		
		const buttonRect = event.target.getBoundingClientRect();
		const containerRect = event.target.closest('.guess-box').getBoundingClientRect();
		const top = buttonRect.top - containerRect.top;
		console.log(top);
		
		const id = Math.random();
		const possibleTexts = responses[guessCategory];

		const floatingText = possibleTexts[Math.floor(Math.random() * possibleTexts.length)];
		floatingTexts.push({id, top, text: floatingText});		

		setTimeout(() => {
			floatingTexts = floatingTexts.filter(t => t.id !== id);
			let failText = document.getElementById("failText");
			if (!failText) {
				return;
			}
			if (guessCategory === INCORRECT) {
				failText.style.color = "red";
			} else if (guessCategory === ALMOST_CORRECT) {
				failText.style.color = "yellow";
			} else if (guessCategory === CORRECT) {
				failText.style.color = "green";
			}
		}, 10);
	}

	function submitGuess(event) {
		console.log($state.snapshot(guesses));
		if (!guesses[gameInfo.currentTry]) {
			return;
		}
		
		// submit choices[currentTry]
		// If correct, calculate points according to guess, ++completedRounds,
		// transition to end screen

		if (guesses[gameInfo.currentTry] === "Red") {
			createFloatingText(INCORRECT, event);			
		} else if (guesses[gameInfo.currentTry] === "Yellow") {
			createFloatingText(ALMOST_CORRECT, event);
		} else if (guesses[gameInfo.currentTry] === "Green") {
			createFloatingText(CORRECT, event);
			gameInfo.currentScore += 3 - gameInfo.currentTry;
		}
		//document.getElementById("guess" + gameInfo.currentTry).disabled = true;
		if (gameInfo.currentTry < 2) {
			++gameInfo.currentTry;
			//document.getElementById("guess" + gameInfo.currentTry).disabled = false;
			return;
		}

		// We're done, transition to end screen
		++gameInfo.failedRounds;
		++gameInfo.currentRound;
		if (gameInfo.currentRound > MAX_ROUNDS) {
			// End the game!
			return;
		}
		gameInfo.currentTry = 0;		
		if (gameInfo.currentRound >= HARD_LIMIT_ROUND) {
			gameInfo.currentDifficulty = HARD_STRING;
		} else if (gameInfo.currentRound >= MEDIUM_START_ROUND) {
			gameInfo.currentDifficulty = MEDIUM_STRING;
		} else {
			// Load easy diff pic, then reset round UI
		}
	}
</script>

<svelte:head>
	<title>STRAFTGUESSR ROUND {gameInfo.currentRound}/15</title>
	<meta name="description" content="A STRAFTGUESSR game" />
</svelte:head>

<div class="game-box">
	<h1>WHAT MAP IS THIS?</h1>
	<hr>
	<img src={pic} alt="An alt text" />
	<hr>
	<h2>Round {gameInfo.currentRound}/15<br>Difficulty: {gameInfo.currentDifficulty}</h2>

	<div class="guess-box">
		<Svelecte class="guess-text" options={mapNames} bind:value={guesses[0]} placeholder="First Guess" />
		<Svelecte class="guess-text" options={mapNames} bind:value={guesses[1]} placeholder="Second Guess" />
		<Svelecte class="guess-text" options={mapNames} bind:value={guesses[2]} placeholder="Third Guess" />
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
	font-size: larger;
	-webkit-text-stroke: 0.02em black;
}

</style>
