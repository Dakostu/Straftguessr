<script lang="ts">
	import { draggable } from "@neodrag/svelte";
	import { fly, fade } from "svelte/transition";
	import { Lightbox } from "svelte-lightbox";
	import { onMount } from "svelte";
	import Svelecte from "svelecte";
	import { MAX_ROUNDS, MEDIUM_START_ROUND, HARD_LIMIT_ROUND,
		HINTS_PER_GAME, MAX_HINTS_PER_ROUND,
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

	const handleButtonTouchMove = (e) => {
		if (window.scrollY === 0) {
			// Prevent accidentally reloading the page
			// when pressing a button and pulling the page.
			// It's annoying.
			e.preventDefault();
		}
	}

	class RoundInfo {
		infoJSON = $state({});
		img = $state("");
		hintsUsed = $state(0);
		fileURI = $state("");
		tryIndex = $state(0);
	}

	class GameInfo {
		roundNumber = $state(1);
		roundInfo = $state(new RoundInfo());
		successfulRounds = $state(0);
		failedRounds = $state(0);
		currentDifficulty = $state(EASY_STRING);
		currentScore = $state(0);
		loading = $state(true);
		roundOver = $state(false);
		gameOver = $state(false);
		guesses = $state(["", "", ""]);
		guessResults = $state(["", "", ""]);
		fileCache = $state([]);
		hintsRemaining = $state(HINTS_PER_GAME);
	}
		
	let currentGame = $state(new GameInfo());
	function startNewGame() {
		currentGame = new GameInfo();

		resetGuessBoxes();
		loadPic();
	}

	async function loadPic() {
		currentGame.loading = true;
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
		fileURI = fileNames[Math.floor(Math.random() * fileNames.length)];
		let json = await currentGame.fileCache[fileURI];
		currentGame.roundInfo.infoJSON = json.default;
		currentGame.roundInfo.fileURI = fileURI;
		delete currentGame.fileCache[fileURI];
		fileURI = fileURI.substring(fileURI.lastIndexOf("/") + 1, fileURI.lastIndexOf("."));
		const imgURI = "round_screens/" + fileURI + ".jpg";
		const img = new Image();
		img.onload = () => {
			currentGame.roundInfo.img = imgURI;
			currentGame.loading = false;
		};
		img.onerror = () => {
			console.error("Failed to load image:", imgURI);
			console.error("Loading new image instead");
			loadPic();
			return;
		}
		img.src = imgURI;
	}
	
	function createFloatingText(guessCategory) {
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

	function submitGuess() {
		const guess = currentGame.guesses[currentGame.roundInfo.tryIndex];
		if (!guess) {
			return;
		}
		const correctMaps = currentGame.roundInfo.infoJSON.correct;

		if (correctMaps.includes(guess)) {
			currentGame.guessResults[currentGame.roundInfo.tryIndex] = CORRECT_STRING;
			createFloatingText(CORRECT_STRING);
			currentGame.currentScore += 3 - currentGame.roundInfo.tryIndex;
			currentGame.roundOver = true;
			setTimeout(() => {revealSolution = true}, 500);
			++currentGame.successfulRounds;
			return;
		} else if (correctMaps.some((correctMap) => correctMap.indexOf(guess.substring(0, guess.indexOf("_"))) == 0)) {
			createFloatingText(ALMOST_CORRECT_STRING);
			currentGame.guessResults[currentGame.roundInfo.tryIndex] = ALMOST_CORRECT_STRING;
		} else {
			createFloatingText(INCORRECT_STRING);
			currentGame.guessResults[currentGame.roundInfo.tryIndex] = INCORRECT_STRING;
		}
		if (currentGame.roundInfo.tryIndex < 2) {
			++currentGame.roundInfo.tryIndex;
			return;
		}
		currentGame.roundOver = true;
		setTimeout(() => {revealSolution = true}, 500);
		++currentGame.failedRounds;
	}

	function getAHint() {
		--currentGame.hintsRemaining;
		++currentGame.roundInfo.hintsUsed;
		++currentGame.roundInfo.tryIndex;
	}

	function startNextRound() {
		revealSolution = false;
		if (currentGame.roundNumber + 1 > MAX_ROUNDS) {
			setTimeout(() => {
				currentGame.gameOver = true;
			}, 200);
			return;
		}
		currentGame.roundOver = false;
		++currentGame.roundNumber;
		currentGame.roundInfo = new RoundInfo();
		if (currentGame.roundNumber >= HARD_LIMIT_ROUND) {
			currentGame.fileCache = [];
			currentGame.currentDifficulty = HARD_STRING;
		} else if (currentGame.roundNumber >= MEDIUM_START_ROUND) {
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

	function handleGlobalKeydown(event) {
		if (event.key != "Enter") {
			return;
		}
		if (revealSolution) {
			startNextRound();
		} else if (currentGame.gameOver) {
			startNewGame();
		} else if (!currentGame.loading && !currentGame.roundOver && currentGame.guesses[currentGame.roundInfo.tryIndex]) {
			submitGuess();
		}
	}

	startNewGame();
</script>

<svelte:head>
	<title>STRAFTGUESSR ROUND {currentGame.roundNumber}/{MAX_ROUNDS}</title>
	<meta name="description" content="A STRAFTGUESSR game" />
</svelte:head>

<svelte:window on:keydown={handleGlobalKeydown} />

{#if currentGame.loading}
<div class="answer-box">
	<h2 in:fade={{duration:1500}}>Loading screenshot{loadingStringDots}</h2>
</div>
{:else if !currentGame.loading}
	<div class="flex-box game-box" in:fade={{duration:200}}>
		<h1>WHAT STRAFTAT MAP IS THIS?</h1>
		<hr>
			<Lightbox enableClickToClose={true} showCloseButton={false}>
				<img src={currentGame.roundInfo.img} alt="Game screenshot" />
			</Lightbox>
		<hr>
		<div class="sub-ui-element-box">
			<h2>Round {currentGame.roundNumber}/{MAX_ROUNDS}
				<br>Difficulty: {currentGame.currentDifficulty}
				{#if currentGame.roundInfo.hintsUsed > 0}
					<br>Map name starts with {currentGame.roundInfo.infoJSON.correct[0][0]}
				{/if}
				{#if currentGame.roundInfo.hintsUsed > 1}
					<br>Map name has {currentGame.roundInfo.infoJSON.correct[0].length} characters
				{/if}
			</h2>
			<button id="hintButton" onclick={getAHint} ontouchmove={handleButtonTouchMove} disabled={currentGame.roundInfo.tryIndex === 2 || currentGame.hintsRemaining === 0 || currentGame.roundInfo.hintsUsed === MAX_HINTS_PER_ROUND || currentGame.roundOver || currentGame.gameOver}>
				GIVE ME A HINT ({currentGame.hintsRemaining}/{HINTS_PER_GAME})
			</button>
		</div>
		<hr>

		<div class="sub-ui-element-box">
			<div class="guessbox-wrapper" class:correct={currentGame.guessResults[0] === CORRECT_STRING} class:incorrect={currentGame.guessResults[0] === INCORRECT_STRING} class:almost-correct={currentGame.guessResults[0] === ALMOST_CORRECT_STRING}>
				<Svelecte
					renderer={dropBoxRenderer}
					inputId="guess0"
					options={MAP_LIST}
					highlightFirstItem={false}
					bind:value={currentGame.guesses[0]}
					disabled={currentGame.loading
						|| currentGame.roundInfo.tryIndex != 0
						|| currentGame.roundOver
						|| currentGame.gameOver}
					placeholder="1st Guess" />
			</div>
			<div class="guessbox-wrapper" class:correct={currentGame.guessResults[1] === CORRECT_STRING} class:incorrect={currentGame.guessResults[1] === INCORRECT_STRING} class:almost-correct={currentGame.guessResults[1] === ALMOST_CORRECT_STRING}>
				<Svelecte
					renderer={dropBoxRenderer}
					inputId="guess1"
					options={MAP_LIST}
					highlightFirstItem={false}
					bind:value={currentGame.guesses[1]}
					disabled={currentGame.roundInfo.tryIndex != 1
						|| currentGame.roundOver
						|| currentGame.gameOver}
					placeholder="2nd Guess" />
			</div>
			<div class="guessbox-wrapper" class:correct={currentGame.guessResults[2] === CORRECT_STRING} class:incorrect={currentGame.guessResults[2] === INCORRECT_STRING} class:almost-correct={currentGame.guessResults[2] === ALMOST_CORRECT_STRING}>
				<Svelecte
					renderer={dropBoxRenderer}
					inputId="guess2"
					options={MAP_LIST}
					highlightFirstItem={false}
					bind:value={currentGame.guesses[2]}
					disabled={currentGame.roundInfo.tryIndex!=2
						|| currentGame.roundOver
						|| currentGame.gameOver}
					placeholder="3rd Guess" />
			</div>
			{#each floatingTexts as t(t.id)}
				<div id="failFly" out:fly={{y: -100, duration: 2500}}>
					<div id="failText" out:fade={{duration: 7000}}>
					{t.text}
					</div>
				</div>
			{/each}
			<button
				id="guessButton"
				onclick={submitGuess}
				ontouchmove={handleButtonTouchMove}
				disabled={!currentGame.guesses[currentGame.roundInfo.tryIndex] || currentGame.roundOver || currentGame.gameOver}				
			>
				LOCK IN
			</button>
		</div>
	</div>

	{#if revealSolution}
		<div class="flex-box game-box answer-box" use:draggable={{cancel: "#nextRoundButton"}} in:fade out:fade>
			<h1>Answer:</h1>
			<br>
			{#each currentGame.roundInfo.infoJSON.correct as mapName}
			<div class="flex-box">
				<div class="thumbnail-text">
					<img src="/thumbnails/{mapName}.jpg" alt="{mapName} thumbnail"/><h2>{mapName}</h2>
				</div>
			</div>
			{/each}
			<hr>
			<h2>{currentGame.roundInfo.infoJSON.desc}</h2>
			<hr>
			<button id="nextRoundButton" ontouchmove={handleButtonTouchMove} onclick={startNextRound} disabled={currentGame.revealEnding}>
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
			<button id="newGameButton" ontouchmove={handleButtonTouchMove} onclick={startNewGame}>
				NEW GAME
			</button>
		</div>
	{/if}
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

.sub-ui-element-box {
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

	.sub-ui-element-box {
		margin: 1% 10%;
	}

	button {
		font-size: 0.8rem;
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
		max-width: 40vw;
	}
}

</style>
