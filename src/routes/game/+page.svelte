<script lang="ts">
	import { draggable } from "@neodrag/svelte";
	import { fly, fade } from "svelte/transition";
	import { Lightbox } from "svelte-lightbox";
	import { onMount } from "svelte";
	import Svelecte from "svelecte";
	import { MAX_ROUNDS, MEDIUM_START_ROUND, HARD_LIMIT_ROUND,
		EASY_STRING, MEDIUM_STRING, HARD_STRING,
		INCORRECT_STRING, ALMOST_CORRECT_STRING, CORRECT_STRING,
		RESPONSE_STRINGS} from "$lib/constants";
	import { MAP_LIST } from "$lib/map_list";

	let floatingTexts = $state([]);
	let revealSolution = $state(false);
	let loadingStringDots = $state("");
	const addLoadingStringDots = () => (
		(loadingStringDots.length === 4) ? loadingStringDots = "" : loadingStringDots += "."
	);
	setInterval(addLoadingStringDots, 150);

	function dropBoxRenderer(item, _isSelection, _inputValue) {
		if (_isSelection) {
			return `${item.text}`;
		}

		return `<div class="thumbnail-text"> <img src="/thumbnails/${item.text}.jpg"> ${item.text} </div>`;
	}

	onMount(() => {
		for (const map of MAP_LIST) {
			const img = new Image();
			img.src = "/thumbnails/" + map + ".jpg";
			img.loading = "eager";
		}
	});

	class GameInfo {
		currentRound = $state(1);
		currentTryIndex = $state(0);
		successfulRounds = $state(0);
		failedRounds = $state(0);
		currentDifficulty = $state(EASY_STRING);
		currentScore = $state(0);
		loading = $state(true);
		roundOver = $state(false);
		gameOver = $state(false);
		guesses = $state(["", "", ""]);
		guessResults = $state([null, null, null]);
		completedQuestions = $state({});
		currentQuestion = $state({});
		currentImg = $state("");
		fileCache = $state([]);
	}
		
	let currentGame = $state(new GameInfo());
	function startNewGame() {
		currentGame = new GameInfo();

		resetGuessBoxes();
		loadPic();
	}

	async function loadPic() {
		currentGame.loading = true;
		currentGame.currentImg = "";		
		let fileURI;
		if (currentGame.fileCache.length === 0) {
			switch (currentGame.currentDifficulty) {
				case EASY_STRING:
					currentGame.fileCache = import.meta.glob("./round_infos/Easy/*.json", {eager: true});
					break;
				case MEDIUM_STRING:
					currentGame.fileCache = import.meta.glob("./round_infos/Medium/*.json", {eager: true});
					break;
				case HARD_STRING:
					currentGame.fileCache = import.meta.glob("./round_infos/Hard/*.json", {eager: true});
					break;
			}
		}
		let fileNames = Object.keys(currentGame.fileCache);
		do {
			fileURI = fileNames[Math.floor(Math.random() * fileNames.length)];
		} while (fileURI in currentGame.completedQuestions);
		let json = await currentGame.fileCache[fileURI];
		currentGame.currentQuestion = json.default;
		currentGame.currentQuestion.fileURI = fileURI;
		fileURI = fileURI.substring(fileURI.lastIndexOf("/") + 1, fileURI.lastIndexOf("."));
		currentGame.currentImg = "round_screens/" + fileURI + ".jpg";
		currentGame.loading = false;
	}
	
	function createFloatingText(guessCategory, event) {		
		const buttonRect = event.target.getBoundingClientRect();
		const containerRect = event.target.closest(".guess-box").getBoundingClientRect();
		
		const id = Math.random();
		const possibleTexts = RESPONSE_STRINGS[guessCategory];

		const floatingText = possibleTexts[Math.floor(Math.random() * possibleTexts.length)];
		floatingTexts.push({id, text: floatingText});

		setTimeout(() => {
			floatingTexts = [];
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
		if (!currentGame.guesses[currentGame.currentTryIndex]) {
			return;
		}
		submitGuess(event);
		// WTF???
		// TODO: Move on to next guessbox upon pressing Enter
		// let guessboxes = document.getElementById("guess" + gameInfo.currentTry);
		// guessboxes.focus();
	}

	function submitGuess(event) {
		// Make guesses case-insensitive so we can be more lenient
		// when dealing with map name string literals.
		const guess = currentGame.guesses[currentGame.currentTryIndex].toLowerCase();
		if (!guess) {
			return;
		}
		const correct = currentGame.currentQuestion.correct.map(str => str.toLowerCase());

		if (correct.includes(guess)) {
			currentGame.guessResults[currentGame.currentTryIndex] = CORRECT_STRING;
			createFloatingText(CORRECT_STRING, event);
			currentGame.currentScore += 3 - currentGame.currentTryIndex;
			currentGame.roundOver = true;
			setTimeout(() => {revealSolution = true}, 500);
			currentGame.completedQuestions[currentGame.currentQuestion.fileURI] = true;
			++currentGame.successfulRounds;
			return;
		} else if (correct.some((correctMap) => correctMap.indexOf(guess.substring(0, guess.indexOf("_"))) == 0)) {
			createFloatingText(ALMOST_CORRECT_STRING, event);
			currentGame.guessResults[currentGame.currentTryIndex] = ALMOST_CORRECT_STRING;
		} else {
			createFloatingText(INCORRECT_STRING, event);
			currentGame.guessResults[currentGame.currentTryIndex] = INCORRECT_STRING;
		}
		if (currentGame.currentTryIndex < 2) {
			++currentGame.currentTryIndex;
			return;
		}
		currentGame.roundOver = true;
		setTimeout(() => {revealSolution = true}, 500);
		currentGame.completedQuestions[currentGame.currentQuestion.fileURI] = null;
		++currentGame.failedRounds;
	}

	function startNextRound() {
		revealSolution = false;
		if (currentGame.currentRound + 1 > MAX_ROUNDS) {
			setTimeout(() => {
				currentGame.gameOver = true;
			}, 200);
			return;
		}
		currentGame.roundOver = false;
		++currentGame.currentRound;
		currentGame.currentTryIndex = 0;
		if (currentGame.currentRound >= HARD_LIMIT_ROUND) {
			currentGame.fileCache = [];
			currentGame.currentDifficulty = HARD_STRING;
		} else if (currentGame.currentRound >= MEDIUM_START_ROUND) {
			currentGame.fileCache = [];
			currentGame.currentDifficulty = MEDIUM_STRING;
		}
		resetGuessBoxes();
		loadPic();
	}

	function resetGuessBoxes() {
		currentGame.guesses = ["", "", ""];
		currentGame.guessResults = [null, null, null];
	}

	startNewGame();
</script>

<svelte:head>
	<title>STRAFTGUESSR ROUND {currentGame.currentRound}/{MAX_ROUNDS}</title>
	<meta name="description" content="A STRAFTGUESSR game" />
</svelte:head>

<div class="flex-box game-box">
	<h1>WHAT STRAFTAT MAP IS THIS?</h1>
	<hr>
	{#if currentGame.loading}
		<h2>Loading screenshot{loadingStringDots}</h2>
	{:else if !currentGame.loading}
		<Lightbox enableClickToClose={true} showCloseButton={false}>
			<img src={currentGame.currentImg} alt="Game screenshot" />
		</Lightbox>
	{/if}
	<hr>
	<h2>Round {currentGame.currentRound}/{MAX_ROUNDS}<br>Difficulty: {currentGame.currentDifficulty}</h2>

	<div class="guess-box">
		<div class="guessbox-wrapper" class:correct={currentGame.guessResults[0] === CORRECT_STRING} class:incorrect={currentGame.guessResults[0] === INCORRECT_STRING} class:almost-correct={currentGame.guessResults[0] === ALMOST_CORRECT_STRING}>
			<Svelecte renderer={dropBoxRenderer} inputId="guess0" options={MAP_LIST} bind:value={currentGame.guesses[0]} onEnterKey={submitGuessKeyDown} disabled={currentGame.loading || currentGame.currentTryIndex!=0 || currentGame.roundOver || currentGame.gameOver} placeholder="1st Guess" />
		</div>
		<div class="guessbox-wrapper" class:correct={currentGame.guessResults[1] === CORRECT_STRING} class:incorrect={currentGame.guessResults[1] === INCORRECT_STRING} class:almost-correct={currentGame.guessResults[1] === ALMOST_CORRECT_STRING}>
			<Svelecte renderer={dropBoxRenderer} inputId="guess1" options={MAP_LIST} bind:value={currentGame.guesses[1]} onEnterKey={submitGuessKeyDown} disabled={currentGame.currentTryIndex!=1 || currentGame.roundOver || currentGame.gameOver} placeholder="2nd Guess" />
		</div>
		<div class="guessbox-wrapper" class:correct={currentGame.guessResults[2] === CORRECT_STRING} class:incorrect={currentGame.guessResults[2] === INCORRECT_STRING} class:almost-correct={currentGame.guessResults[2] === ALMOST_CORRECT_STRING}>
			<Svelecte renderer={dropBoxRenderer} inputId="guess2" options={MAP_LIST} bind:value={currentGame.guesses[2]} onEnterKey={submitGuessKeyDown} disabled={currentGame.currentTryIndex!=2 || currentGame.roundOver || currentGame.gameOver} placeholder="3rd Guess" />
		</div>
		{#each floatingTexts as t(t.id)}
			<div id="failFly" out:fly={{y: -100, duration: 2500}}>
				<div id="failText" out:fade={{duration: 7000}}>
				{t.text}
				</div>
			</div>
		{/each}
		<button id="guessButton" onclick={submitGuess} disabled={!currentGame.guesses[currentGame.currentTryIndex] || currentGame.roundOver || currentGame.gameOver}>
			LOCK IN
		</button>
	</div>
</div>

{#if revealSolution}
	<div class="flex-box game-box answer-box" use:draggable={{cancel: "#nextRoundButton"}} in:fade out:fade>
		<h1>Answer:</h1>
		<br>
		{#each currentGame.currentQuestion.correct as mapName}
		<div class="flex-box">
			<div class="thumbnail-text">
				<img src="/thumbnails/{mapName}.jpg" alt="{mapName} thumbnail"/><h2>{mapName}</h2>
			</div>
		</div>
		{/each}
		<hr>
		<h2>{currentGame.currentQuestion.desc}</h2>
		<hr>
		<button id="nextRoundButton" ontouchend={startNextRound} onclick={startNextRound} disabled={currentGame.revealEnding}>
			NEXT ROUND
		</button>
	</div>
	{/if}
	{#if currentGame.gameOver}
	<div class="flex-box game-box answer-box" use:draggable={{cancel: "#newGameButton"}} in:fade out:fade>
		<h1>Finished!</h1>
		<hr>
		<h2>You got {currentGame.successfulRounds} out of {MAX_ROUNDS} questions right!<br>Your score: {currentGame.currentScore}</h2>
		<hr>
		<button id="newGameButton" ontouchend={startNewGame} onclick={startNewGame}>
			NEW GAME
		</button>
	</div>
{/if}

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

:global(.guessbox-wrapper.correct .svelecte) {
    --sv-disabled-bg: var(--correct);
}

:global(.guessbox-wrapper.incorrect .svelecte) {
    --sv-disabled-bg: var(--incorrect);
}

:global(.guessbox-wrapper.almost-correct .svelecte) {
    --sv-disabled-bg: var(--almost-correct);
}

:global(.svelte-lightbox-main) {
	cursor: zoom-out;
}

h1 {
	margin: 1% 5%;
	font-size: 3rem;
}

.flex-box {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: 0;
	max-width: none;
}

.align-center {
	align-content: center;
}

.game-box {
	border-radius: 20px;
	border-color: var(--straftat-green);
	border-style: solid;
	border-width: thin;
	padding-left: 20px;
	padding-right: 20px;
	margin: 0;
	width: 100%;
	box-sizing: border-box;
}

.guess-box {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: 1% 20%;
}

:global(.thumbnail-text) {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 15px;
}

:global(.thumbnail-text img) {
	object-fit: cover;
	max-width: 100px;
	user-select: none;
}

#failFly {
	position: absolute;
	transform: translateX(-50%);
	left: 50%;
	margin-top: 80px;
	font-size: xx-large;
	-webkit-text-stroke: 0.06em black;
	text-align: center;
}

.answer-box {
	position: fixed;
	transform: translateX(-50%);
	left: 50%;
	top: 20%;
	max-width: 60vw;
	padding-left: 3%;
	padding-right: 3%;
	background-color: black;
	cursor: move;
	user-select: none;
}


@media (max-width: 720px) {
	h1 {
		font-size: 1.5rem;
	}

	h2 {
		font-size: small;
	}

	:global(.svelecte) {
		font-size: small;
		--sv-dropdown-width: 180px;		
	}

	#failFly {
		font-size: large;
	}
	
	:global(.thumbnail-text) {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: xx-small;		
	}

	:global(.answer-box .thumbnail-text h2) {
		font-size: xx-small;		
	}

	:global(.thumbnail-text img) {
		object-fit: cover;
		max-width: 40px;
		user-select: none;
	}

	:global(.answer-box .thumbnail-text img) {
		max-width: 50px;
	}

	.guess-box {
		margin: 1% 10%;
	}
}

@media (min-width: 720px) and (max-width: 1920px) {
	:global(.thumbnail-text) {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: small;
	}

	:global(.thumbnail-text img) {
		object-fit: cover;
		max-width: 80px;
		user-select: none;

	}
}

@media (min-width: 1920px) {
	h1 {
		font-size: 4rem;
	}

	.answer-box {
		max-width: 45vw;
	}

}

</style>
