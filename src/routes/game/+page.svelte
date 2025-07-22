<script>
	import { draggable } from "@neodrag/svelte"
	import { fly, fade } from 'svelte/transition'
	import { Lightbox } from 'svelte-lightbox'
	import Svelecte from 'svelecte'
	import { MAX_ROUNDS, MEDIUM_START_ROUND, HARD_LIMIT_ROUND,
		EASY_STRING, MEDIUM_STRING, HARD_STRING,
		INCORRECT_STRING, ALMOST_CORRECT_STRING, CORRECT_STRING,
		RESPONSE_STRINGS} from '$lib/constants'
	import { MAP_LIST } from '$lib/map_list'

	let floatingTexts = $state([]);
	let currentImg = $state("");
	let revealSolution = $state(false);
	let loading = $state(true);
	let loadingStringDots = $state("");
	const incrLoadingStringDots = () => (
		(loadingStringDots.length === 4) ? loadingStringDots = "" : loadingStringDots += '.'
	);
	let dots;
	$derived: {
		clearInterval(dots);
		setInterval(incrLoadingStringDots, 150);
	}
		
	let gameInfo = $state({});	
	function startNewGame() {
		gameInfo = {
			currentRound : 1,
			currentTry : 0,
			successfulRounds : 0,
			failedRounds : 0,
			currentDifficulty : EASY_STRING,
			currentScore : 0,
			fileURICache : [],
			roundOver : false,
			gameOver : false,
			guesses : (["", "", ""]),
			completedQuestions : {},
			currentQuestion: {}
		};

		resetGuessBoxes();
		loadPic();
	}

	async function loadPic() {
		loading = true;
		if (gameInfo.fileURICache.length === 0) {
			const urlsObj = await fetch('/fetch/jsons?diff=' + gameInfo.currentDifficulty);
			if (!urlsObj.ok) {
				console.error(urlsObj.statusText);
				return;
			}
			gameInfo.fileURICache = await urlsObj.json();
		}

		let fileURI = "";
		
		do {
			fileURI = gameInfo.fileURICache[Math.floor(Math.random() * Object.keys(gameInfo.fileURICache).length)];
		} while (fileURI in gameInfo.completedQuestions);
		let fileName = fileURI.substring(fileURI.lastIndexOf('/'));
		let imgURL = fileName.substring(0, fileName.lastIndexOf('.')) + ".jpg";
		let fullImgURL = await fetch('/fetch/pic?url=' + imgURL);
		currentImg = await fullImgURL.json();
		let json = await fetch('/fetch/json?url=' + fileURI);
		gameInfo.currentQuestion = await json.json();
		gameInfo.currentQuestion.fileURI = fileURI;
		loading = false;
	}
	
	function createFloatingText(guessCategory, event) {		
		const buttonRect = event.target.getBoundingClientRect();
		const containerRect = event.target.closest('.guess-box').getBoundingClientRect();
		const top = buttonRect.top - containerRect.top;
		
		const id = Math.random();
		const possibleTexts = RESPONSE_STRINGS[guessCategory];

		const floatingText = possibleTexts[Math.floor(Math.random() * possibleTexts.length)];
		floatingTexts.push({id, top, text: floatingText});		

		setTimeout(() => {
			floatingTexts = floatingTexts.filter(t => t.id !== id);
			let failText = document.getElementById("failText");
			if (!failText) {
				return;
			}
			if (guessCategory === INCORRECT_STRING) {
				failText.style.color = "var(--incorrect)";
			} else if (guessCategory === ALMOST_CORRECT_STRING) {
				failText.style.color = "var(--almost-correct)";
			} else if (guessCategory === CORRECT_STRING) {
				failText.style.color = "var(--correct)";
			}
		}, 10);
	}

	function submitGuessKeyDown(event) {
		if (!gameInfo.guesses[gameInfo.currentTry]) {
			return;
		}
		submitGuess(event);
		// WTF???
		// TODO: Move on to next guessbox upon pressing Enter
		// let guessboxes = document.getElementById("guess" + gameInfo.currentTry);
		// guessboxes.focus();
	}

	function submitGuess(event) {
		let guess = gameInfo.guesses[gameInfo.currentTry];
		if (!guess) {
			return;
		}
		
		let guessboxes = document.getElementsByClassName("svelecte");		
		if (gameInfo.currentQuestion.correct.includes(guess)) {
			createFloatingText(CORRECT_STRING, event);
			guessboxes[gameInfo.currentTry].style = "--sv-disabled-bg: var(--correct);";
			gameInfo.currentScore += 3 - gameInfo.currentTry;
			gameInfo.roundOver = true;
			setTimeout(() => {revealSolution = true}, 500);
			gameInfo.completedQuestions[gameInfo.currentQuestion.fileURI] = null;
			++gameInfo.successfulRounds;
			return;
		} else if (gameInfo.currentQuestion.correct.some((correctMap) => correctMap.indexOf(guess.substring(0, guess.indexOf('_'))) == 0)) {
			createFloatingText(ALMOST_CORRECT_STRING, event);
			guessboxes[gameInfo.currentTry].style = "--sv-disabled-bg: var(--almost-correct);";
		} else {
			createFloatingText(INCORRECT_STRING, event);
			guessboxes[gameInfo.currentTry].style = "--sv-disabled-bg: var(--incorrect);";
		}
		if (gameInfo.currentTry < 2) {
			++gameInfo.currentTry;
			return;
		}
		gameInfo.roundOver = true;
		setTimeout(() => {revealSolution = true}, 500);
		gameInfo.completedQuestions[gameInfo.currentQuestion.fileURI] = null;
		++gameInfo.failedRounds;
	}

	function startNextRound() {
		revealSolution = false;
		if (gameInfo.currentRound + 1 > MAX_ROUNDS) {
			setTimeout(() => {
				gameInfo.gameOver = true;
			}, 200);
			return;
		}
		gameInfo.roundOver = false;
		++gameInfo.currentRound;
		gameInfo.currentTry = 0;		
		if (gameInfo.currentRound >= HARD_LIMIT_ROUND) {
			gameInfo.currentDifficulty = HARD_STRING;
			gameInfo.fileURICache = [];
		} else if (gameInfo.currentRound >= MEDIUM_START_ROUND) {
			gameInfo.currentDifficulty = MEDIUM_STRING;
			gameInfo.fileURICache = [];
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
	<h1>WHAT STRAFTAT MAP IS THIS?</h1>
	<hr>
	{#if loading}
		<h2>Loading screenshot{loadingStringDots}</h2>
	{:else if !loading}
		<Lightbox enableClickToClose={true} showCloseButton={false}>
			<img src={currentImg} alt="Game screenshot" />
		</Lightbox>
	{/if}
	<hr>
	<h2>Round {gameInfo.currentRound}/{MAX_ROUNDS}<br>Difficulty: {gameInfo.currentDifficulty}</h2>

	<div class="guess-box">
		<Svelecte inputId="guess0" options={MAP_LIST} bind:value={gameInfo.guesses[0]} onEnterKey={submitGuessKeyDown} disabled={gameInfo.currentTry!=0 || gameInfo.roundOver || gameInfo.gameOver} placeholder="1st Guess" />
		<Svelecte inputId="guess1" options={MAP_LIST} bind:value={gameInfo.guesses[1]} onEnterKey={submitGuessKeyDown} disabled={gameInfo.currentTry!=1 || gameInfo.roundOver || gameInfo.gameOver} placeholder="2nd Guess" />
		<Svelecte inputId="guess2" options={MAP_LIST} bind:value={gameInfo.guesses[2]} onEnterKey={submitGuessKeyDown} disabled={gameInfo.currentTry!=2 || gameInfo.roundOver || gameInfo.gameOver} placeholder="3rd Guess" />
		{#each floatingTexts as t(t.id)}
			<div id="failFly" out:fly={{y: -100, duration: 2500}}>
				<div id="failText" out:fade={{duration: 7000}}>
				{t.text}
				</div>
			</div>
		{/each}
		<button id="guessButton" onclick={submitGuess} disabled={!gameInfo.guesses[gameInfo.currentTry] || gameInfo.roundOver || gameInfo.gameOver}>
			LOCK IN
		</button>
	</div>
	{#if revealSolution}
	<div class="game-box" use:draggable id="answer-box" in:fade out:fade>
		<h1>Answer:<br>{gameInfo.currentQuestion.correct}</h1>
		<hr>
		<h2>{gameInfo.currentQuestion.desc}</h2>
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
		<h2>You got {gameInfo.successfulRounds} out of {MAX_ROUNDS} questions right!<br>Your score: {gameInfo.currentScore}</h2>
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
	color-scheme: dark;
}

:global(.svelte-lightbox-main) {
	cursor: zoom-out;
}

h1 {
	margin: 1% 5%;
	font-size: 3rem;
}

@media (max-width: 720px) {
	h1 {
		font-size: 2rem;
	}
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
	font-size: xx-large;
	-webkit-text-stroke: 0.06em black;
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
