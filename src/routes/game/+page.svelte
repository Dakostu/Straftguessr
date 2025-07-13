<script>
	import {fly, fade} from 'svelte/transition'
	import Svelecte from 'svelecte'

	const mapNames = ["Red", "Yellow", "Green"]
	let floatingTexts = $state([]);
	let currentImg = $state("");
	const MAX_ROUNDS = 15;
	const MEDIUM_START_ROUND = 7;
	const HARD_LIMIT_ROUND = 12;
	const EASY_STRING = "Easy";
	const MEDIUM_STRING = "Medium";
	const HARD_STRING = "Hard";
	const INCORRECT = "incorrect";
	const ALMOST_CORRECT = "almost_correct";
	const CORRECT = "correct";
	
	let gameInfo = $state({});

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

	function startNewGame() {
		gameInfo = {
			currentRound : 1,
			currentTry : 0,
			successfulRounds : 0,
			failedRounds : 0,
			currentDifficulty : EASY_STRING,
			currentScore : 0,
			roundOver : false,
			gameOver : false,
			guesses : (["", "", ""]),
			completedQuestions : {},
			currentQuestion: {}
		};

		loadPic();
	}	

	async function loadPic() {
		let rounds;
		switch (gameInfo.currentDifficulty) {
			case EASY_STRING: rounds = import.meta.glob("$lib/images/screens/Easy/*.json"); break;
			case MEDIUM_STRING: rounds = import.meta.glob("$lib/images/screens/Medium/*.json"); break;
			case HARD_STRING: rounds = import.meta.glob("$lib/images/screens/Hard/*.json"); break;
		}
		let fileURI = "";
		do {
			fileURI = Object.keys(rounds)[Math.floor(Math.random() * Object.keys(rounds).length)];
			console.log(fileURI);
			let json = await import(/* @vite-ignore */ fileURI);			
			currentImg = fileURI.substring(0, fileURI.lastIndexOf(".")) + ".jpg";
			gameInfo.currentQuestion = json.default;
			gameInfo.currentQuestion.uri = fileURI;
			console.log(gameInfo.currentQuestion);
		} while (fileURI in gameInfo.completedQuestions);
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
		if (!gameInfo.guesses[gameInfo.currentTry]) {
			return;
		}
		
		// submit choices[currentTry]
		// If correct, calculate points according to guess, ++completedRounds,
		// transition to end screen

		if (gameInfo.guesses[gameInfo.currentTry] === "Red") {
			createFloatingText(INCORRECT, event);			
		} else if (gameInfo.guesses[gameInfo.currentTry] === "Yellow") {
			createFloatingText(ALMOST_CORRECT, event);
		} else if (gameInfo.guesses[gameInfo.currentTry] === "Green") {
			createFloatingText(CORRECT, event);
			gameInfo.currentScore += 3 - gameInfo.currentTry;
		}
		//document.getElementById("guess" + gameInfo.currentTry).disabled = true;
		if (gameInfo.currentTry < 2) {
			++gameInfo.currentTry;
			//document.getElementById("guess" + gameInfo.currentTry).disabled = false;
			return;
		}
		setTimeout(() => {
			gameInfo.roundOver = true;
			// We're done, transition to end screen
			++gameInfo.failedRounds;		
		}, 500);
	}

	function startNextRound() {
		gameInfo.roundOver = false;
		if (gameInfo.currentRound + 1 > MAX_ROUNDS) {
			setTimeout(() => {
				gameInfo.gameOver = true;
			}, 200);
			return;
		}
		++gameInfo.currentRound;
		gameInfo.currentTry = 0;		
		if (gameInfo.currentRound >= HARD_LIMIT_ROUND) {
			gameInfo.currentDifficulty = HARD_STRING;
		} else if (gameInfo.currentRound >= MEDIUM_START_ROUND) {
			gameInfo.currentDifficulty = MEDIUM_STRING;
		} else {
			// Load easy diff pic, then reset round UI
		}

	}

	startNewGame();
</script>

<svelte:head>
	<title>STRAFTGUESSR ROUND {gameInfo.currentRound}/{MAX_ROUNDS}</title>
	<meta name="description" content="A STRAFTGUESSR game" />
</svelte:head>

<div class="game-box">
	<h1>WHAT MAP IS THIS?</h1>
	<hr>
	<img src={currentImg} alt="Game screenshot" />
	<hr>
	<h2>Round {gameInfo.currentRound}/{MAX_ROUNDS}<br>Difficulty: {gameInfo.currentDifficulty}</h2>

	<div class="guess-box">
		<Svelecte class="guess-text" options={mapNames} bind:value={gameInfo.guesses[0]} placeholder="First Guess" />
		<Svelecte class="guess-text" options={mapNames} bind:value={gameInfo.guesses[1]} placeholder="Second Guess" />
		<Svelecte class="guess-text" options={mapNames} bind:value={gameInfo.guesses[2]} placeholder="Third Guess" />
		{#each floatingTexts as t(t.id)}
			<div id="failFly" out:fly={{y: -100, duration: 2500}}>
				<div id="failText" out:fade={{duration: 5000}}>
				{t.text}
				</div>
			</div>
		{/each}
		<button id="guessButton" onclick={submitGuess} disabled={gameInfo.roundOver && !gameInfo.gameOver}>
			LOCK IN
		</button>
	</div>
	{#if gameInfo.roundOver}
	<div class="game-box" id="answer-box" in:fade out:fade>
		<h1>Answer:<br>answer</h1>
		<hr>
		<h2>I'm explaining the answer here.</h2>
		<hr>
		<button id="nextRoundButton" onclick={startNextRound}>
			NEXT ROUND
		</button>
	</div>
	{/if}
	{#if gameInfo.gameOver}
	<div class="game-box" id="answer-box" in:fade out:fade>
		<h1>Finished!</h1>
		<hr>
		<h2>You got {gameInfo.successfulRounds} out of 15 questions right!<br>Your score: {gameInfo.currentScore}</h2>
		<hr>
		<button id="nextRoundButton" onclick={startNewGame}>
			NEW GAME
		</button>
	</div>
	{/if}
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

#answer-box {
	position: fixed;
	transform: translateX(-50%);
	left: 50%;
	width: 40%;
	border-radius: 8%;
	background-color: black;
}

</style>
