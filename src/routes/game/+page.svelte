<script lang="ts">
	import { draggable } from "@neodrag/svelte"
	import { fly, fade } from "svelte/transition"
	import { Lightbox } from "svelte-lightbox"
	import Svelecte from "svelecte"
	import { MAX_ROUNDS, MEDIUM_START_ROUND, HARD_LIMIT_ROUND,
		EASY_STRING, MEDIUM_STRING, HARD_STRING,
		INCORRECT_STRING, ALMOST_CORRECT_STRING, CORRECT_STRING,
		RESPONSE_STRINGS} from "$lib/constants"
	import { MAP_LIST } from "$lib/map_list"

	let floatingTexts = $state([]);
	let revealSolution = $state(false);
	let loadingStringDots = $state("");
	const incrLoadingStringDots = () => (
		(loadingStringDots.length === 4) ? loadingStringDots = "" : loadingStringDots += "."
	);
	setInterval(incrLoadingStringDots, 150);

	function dropBoxRenderer(item, _isSelection, _inputValue) {
		if (_isSelection) {
			return `${item.text}`;
		}

		return `<div class="thumbnail-text"> <img src="/thumbnails/${item.text}.jpg"> ${item.text} </div>`;
	}

	class GameInfo {
		currentRound = $state(1);
		currentTryIndex = $state(0);
		successfulRounds = $state(0);
		failedRounds = $state(0);
		currentDifficulty = $state(EASY_STRING);
		currentScore = $state(0);
		fileURICache = $state([]);
		loading = $state(true);
		roundOver = $state(false);
		gameOver = $state(false);
		guesses = $state(["", "", ""]);
		completedQuestions = $state({});
		currentQuestion = $state({});
		currentImg = $state("");
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
		if (currentGame.fileURICache.length === 0) {
			const urlsObj = await fetch("/fetch/jsons?diff=" + currentGame.currentDifficulty);
			if (!urlsObj.ok) {
				console.error(urlsObj.statusText);
				return;
			}
			currentGame.fileURICache = await urlsObj.json();
		}

		let fileURI = "";
		
		do {
			fileURI = currentGame.fileURICache[Math.floor(Math.random() * Object.keys(currentGame.fileURICache).length)];
		} while (fileURI in currentGame.completedQuestions);
		let fileName = fileURI.substring(fileURI.lastIndexOf("/"));
		let imgURL = fileName.substring(0, fileName.lastIndexOf(".")) + ".jpg";
		let fullImgURL = await fetch("/fetch/pic?url=" + imgURL);
		currentGame.currentImg = await fullImgURL.json();
		let json = await fetch("/fetch/json?url=" + fileURI);
		console.log("huh?");
		currentGame.currentQuestion = await json.json();
		currentGame.currentQuestion.fileURI = fileURI;
		currentGame.loading = false;
	}
	
	function createFloatingText(guessCategory, event) {		
		const buttonRect = event.target.getBoundingClientRect();
		const containerRect = event.target.closest(".guess-box").getBoundingClientRect();
		const top = buttonRect.top - containerRect.top;
		
		const id = Math.random();
		const possibleTexts = RESPONSE_STRINGS[guessCategory];

		const floatingText = possibleTexts[Math.floor(Math.random() * possibleTexts.length)];
		floatingTexts.push({id, text: floatingText});

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
		let guess = currentGame.guesses[currentGame.currentTryIndex];
		if (!guess) {
			return;
		}
		
		let guessboxes = document.getElementsByClassName("svelecte");		
		if (currentGame.currentQuestion.correct.includes(guess)) {
			createFloatingText(CORRECT_STRING, event);
			guessboxes[currentGame.currentTryIndex].style = "--sv-disabled-bg: var(--correct);";
			currentGame.currentScore += 3 - currentGame.currentTryIndex;
			currentGame.roundOver = true;
			setTimeout(() => {revealSolution = true}, 500);
			currentGame.completedQuestions[currentGame.currentQuestion.fileURI] = null;
			++currentGame.successfulRounds;
			return;
		} else if (currentGame.currentQuestion.correct.some((correctMap) => correctMap.indexOf(guess.substring(0, guess.indexOf("_"))) == 0)) {
			createFloatingText(ALMOST_CORRECT_STRING, event);
			guessboxes[currentGame.currentTryIndex].style = "--sv-disabled-bg: var(--almost-correct);";
		} else {
			createFloatingText(INCORRECT_STRING, event);
			guessboxes[currentGame.currentTryIndex].style = "--sv-disabled-bg: var(--incorrect);";
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
			currentGame.currentDifficulty = HARD_STRING;
			currentGame.fileURICache = [];
		} else if (currentGame.currentRound >= MEDIUM_START_ROUND) {
			currentGame.currentDifficulty = MEDIUM_STRING;
			currentGame.fileURICache = [];
		}
		resetGuessBoxes();
		loadPic();
	}

	function resetGuessBoxes() {
		currentGame.guesses= ["", "", ""];
		let guessboxes = document.getElementsByClassName("svelecte");
		for (let box of guessboxes) {
			box.style = "";
		}
	}

	startNewGame();
</script>

<svelte:head>
	<title>STRAFTGUESSR ROUND {currentGame.currentRound}/{MAX_ROUNDS}</title>
	<meta name="description" content="A STRAFTGUESSR game" />
</svelte:head>

<div class="game-box">
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
		<Svelecte renderer={dropBoxRenderer} inputId="guess0" options={MAP_LIST} bind:value={currentGame.guesses[0]} onEnterKey={submitGuessKeyDown} disabled={currentGame.currentTryIndex!=0 || currentGame.roundOver || currentGame.gameOver} placeholder="1st Guess" />
		<Svelecte renderer={dropBoxRenderer} inputId="guess1" options={MAP_LIST} bind:value={currentGame.guesses[1]} onEnterKey={submitGuessKeyDown} disabled={currentGame.currentTryIndex!=1 || currentGame.roundOver || currentGame.gameOver} placeholder="2nd Guess" />
		<Svelecte renderer={dropBoxRenderer} inputId="guess2" options={MAP_LIST} bind:value={currentGame.guesses[2]} onEnterKey={submitGuessKeyDown} disabled={currentGame.currentTryIndex!=2 || currentGame.roundOver || currentGame.gameOver} placeholder="3rd Guess" />
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
	{#if revealSolution}
	<div class="game-box" use:draggable id="answer-box" in:fade out:fade>
		<h1>Answer:</h1>
		<br>
		<div class="game-box" style="border-width:0;">
			{#each currentGame.currentQuestion.correct as mapName}
			<div class="thumbnail-text">
				<img src="/thumbnails/{mapName}.jpg" alt="{mapName} thumbnail"/><h2>{mapName}</h2>
			</div>
			{/each}
		</div>
		<hr>
		<h2>{currentGame.currentQuestion.desc}</h2>
		<hr>
		<button id="nextRoundButton" onclick={startNextRound} disabled={currentGame.revealEnding}>
			NEXT ROUND
		</button>
	</div>
	{/if}
	{#if currentGame.gameOver}
	<div class="game-box" use:draggable id="answer-box" in:fade out:fade>
		<h1>Finished!</h1>
		<hr>
		<h2>You got {currentGame.successfulRounds} out of {MAX_ROUNDS} questions right!<br>Your score: {currentGame.currentScore}</h2>
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
	padding-left: 1%;
	padding-right: 1%;
}

.guess-box {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: 1% 30%;
}

:global(.thumbnail-text) {
	display: flex;
	align-items: center;
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
}

#answer-box {
	position: fixed;
	transform: translateX(-50%);
	left: 50%;
	width: 50%;
	border-radius: 8%;
	background-color: black;
	cursor: move;
	user-select: none;
}

</style>
