<script>
	import {draggable} from "@neodrag/svelte"
	import {fly, fade} from 'svelte/transition'
	import Svelecte from 'svelecte'

	const mapNames = ["Red", "Yellow", "Green"]
	let floatingTexts = $state([]);
	let currentImg = $state("");
	let revealEnding = $state(false);
	const MAX_ROUNDS = 15;
	const MEDIUM_START_ROUND = 7;
	const HARD_LIMIT_ROUND = 12;
	const EASY_STRING = "Easy";
	const MEDIUM_STRING = "Medium";
	const HARD_STRING = "Hard";
	const INCORRECT_STRING = "incorrect";
	const ALMOST_CORRECT_STRING = "almost_correct";
	const CORRECT_STRING = "correct";
	
	let gameInfo = $state({});

	const responses = {
		[INCORRECT_STRING] : [
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
			"learn"
		],
		[ALMOST_CORRECT_STRING] : [
			"Almost!", 
			"So close...", 
			"Getting warmer...", 
			"Not quite...",
		],
		[CORRECT_STRING] : [
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
		} while (fileURI in gameInfo.completedQuestions);
		currentImg = fileURI.substring(0, fileURI.lastIndexOf(".")) + ".jpg";
		let json = await import(/* @vite-ignore */ fileURI);						
		gameInfo.currentQuestion = json.default;
		gameInfo.currentQuestion.fileURI = fileURI;
	}
	
	function createFloatingText(guessCategory, event) {		
		const buttonRect = event.target.getBoundingClientRect();
		const containerRect = event.target.closest('.guess-box').getBoundingClientRect();
		const top = buttonRect.top - containerRect.top;
		
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
			if (guessCategory === INCORRECT_STRING) {
				failText.style.color = "red";
			} else if (guessCategory === ALMOST_CORRECT_STRING) {
				failText.style.color = "yellow";
			} else if (guessCategory === CORRECT_STRING) {
				failText.style.color = "green";
			}
		}, 10);
	}

	function submitGuessKeyDown(event) {
		if (!gameInfo.guesses[gameInfo.currentTry]) {
			return;
		}
		submitGuess(event);
		let guessboxes = document.getElementById("guess" + gameInfo.currentTry);
		console.log(guessboxes);
		guessboxes.focus();
	}

	function submitGuess(event) {
		if (!gameInfo.guesses[gameInfo.currentTry]) {
			return;
		}
		
		let guessboxes = document.getElementsByClassName("svelecte");
		if (gameInfo.currentQuestion.almost_correct.includes(gameInfo.guesses[gameInfo.currentTry])) {
			createFloatingText(ALMOST_CORRECT_STRING, event);
			guessboxes[gameInfo.currentTry].style = "--sv-disabled-bg: yellow;";
		} else if (gameInfo.currentQuestion.correct.includes(gameInfo.guesses[gameInfo.currentTry])) {
			createFloatingText(CORRECT_STRING, event);
			guessboxes[gameInfo.currentTry].style = "--sv-disabled-bg: green;";
			gameInfo.currentScore += 3 - gameInfo.currentTry;
			gameInfo.roundOver = true;
			setTimeout(() => {revealEnding = true}, 500);
			gameInfo.completedQuestions[gameInfo.currentQuestion.fileURI] = null;
			++gameInfo.successfulRounds;
			return;
		} else {
			createFloatingText(INCORRECT_STRING, event);
			guessboxes[gameInfo.currentTry].style = "--sv-disabled-bg: red;";
		}
		if (gameInfo.currentTry < 2) {
			++gameInfo.currentTry;
			return;
		}
		gameInfo.roundOver = true;
		setTimeout(() => {revealEnding = true}, 500);
		gameInfo.completedQuestions[gameInfo.currentQuestion.fileURI] = null;
		++gameInfo.failedRounds;
	}

	function startNextRound() {
		revealEnding = false;
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
		}
		resetGuessBoxes();
		loadPic();
	}

	function resetGuessBoxes() {
		gameInfo.guesses= ["", "", ""];
		let guessboxes = document.getElementsByClassName("svelecte");
		for (let box of guessboxes) {
			box.style = "";
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
		<Svelecte inputId="guess0" options={mapNames} bind:value={gameInfo.guesses[0]} onEnterKey={submitGuessKeyDown} disabled={gameInfo.currentTry!=0 || gameInfo.roundOver} placeholder="1st Guess" />
		<Svelecte inputId="guess1" options={mapNames} bind:value={gameInfo.guesses[1]} onEnterKey={submitGuessKeyDown} disabled={gameInfo.currentTry!=1 || gameInfo.roundOver} placeholder="2nd Guess" />
		<Svelecte inputId="guess2" options={mapNames} bind:value={gameInfo.guesses[2]} onEnterKey={submitGuessKeyDown} disabled={gameInfo.currentTry!=2 || gameInfo.roundOver} placeholder="3rd Guess" />
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
	{#if revealEnding}
	<div class="game-box" use:draggable id="answer-box" in:fade out:fade>
		<h1>Answer:<br>{gameInfo.currentQuestion.correct}</h1>
		<hr>
		<h2>{gameInfo.currentQuestion.explanation}</h2>
		<hr>
		<button id="nextRoundButton" onclick={startNextRound} disabled={gameInfo.revealEnding}>
			NEXT ROUND
		</button>
	</div>
	{/if}
	{#if gameInfo.gameOver}
	<div class="game-box" use:draggable id="answer-box" in:fade out:fade>
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

:global(.svelecte) {
	--sv-bg: var(--black);
	--sv-disabled-bg: gray;
	--sv-control-bg: var(--black);
	--sv-border: 1px solid var(--straftat-green);
	--sv-dropdown-selected-bg: var(--black);
	--sv-dropdown-border: var(--straftat-green);
	--sv-dropdown-active-bg: var(--straftat-green);
	--sv-dropdown-active-border: var(--straftat-green);
	--sv-icon-color: var(--straftat-green);
	--sv-item-btn-bg: blue;
	color-scheme: dark;
}

h1 {
	margin: 1% auto
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
	font-size: x-large;
	-webkit-text-stroke: 0.05em black;
}

#answer-box {
	position: fixed;
	transform: translateX(-50%);
	left: 50%;
	width: 40%;
	border-radius: 8%;
	background-color: black;
	cursor: move;
	user-select: none;
}

</style>
