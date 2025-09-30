<script lang="ts">
	import { draggable } from '@neodrag/svelte';
	import { fly, fade } from 'svelte/transition';
	import { Lightbox } from 'svelte-lightbox';
	import { onMount } from 'svelte';
	import Svelecte from 'svelecte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import DotLoadingIndicator from '$lib/components/DotLoadingIndicator.svelte';
	import {
		MAX_ROUNDS,
		MEDIUM_START_ROUND,
		HARD_LIMIT_ROUND,
		HINTS_PER_GAME,
		MAX_HINTS_PER_ROUND,
		EASY_STRING,
		MEDIUM_STRING,
		HARD_STRING,
		INCORRECT_STRING,
		ALMOST_CORRECT_STRING,
		CORRECT_STRING,
		RESPONSE_STRINGS,
		REVEAL_GAME_OVER_WINDOW_TIMEOUT,
		REVEAL_SOLUTION_WINDOW_TIMEOUT,
		LEADERBOARD_STRING_WHITELIST
	} from '$lib/constants';
	import { MAP_LIST } from '$lib/map_list';

	/** Disable map thumbnails and double the score per round. Passed on by parent component. */
	let { compMode: compMode } = $props();

	/**
	 * Array of floating text animations to display feedback to the user.
	 * @type {FloatingText[]}
	 */
	let floatingTexts: FloatingText[] = $state([]);

	/**
	 * Flag for displaying the leaderboard popup at the end of the game.
	 * @type boolean
	 */
	let leaderboardPopupOpen = $state(false);

	/**
	 * Custom renderer function for the Svelecte dropdown component.
	 *
	 * @param {any} item - The map item being rendered
	 * @param {any} _isSelection - Whether this is rendering the selected value
	 * @param {any} _inputValue - The current input value (unused)
	 * @returns {string} HTML string for rendering the item
	 */
	function dropBoxRenderer(item: any, _isSelection: any, _inputValue: any): string {
		if (_isSelection) {
			return `${item.text}`;
		}

		let dropDownHTML = '<div class="thumbnail-text"> ';
		if (!compMode) {
			dropDownHTML += `<img src="/thumbnails/${item.text}.jpg">`;
		}

		return dropDownHTML + `${item.text} </div>`;
	}

	/**
	 * Preloads all map thumbnail images for better performance and smoother visuals.
	 * Runs when the component mounts to prevent loading delays during gameplay.
	 * Also preload them when Comp Mode has been activated
	 * - they do not appear in the drop-down but they do appear in the result popup.
	 *
	 * @returns {void}
	 */
	onMount((): void => {
		for (const map of MAP_LIST) {
			const img = new Image();
			img.src = '/thumbnails/' + map + '.jpg';
			img.loading = 'eager';
		}
	});

	/**
	 * Prevents accidental page reload on smartphones when touching buttons and pulling down
	 *
	 * @param {Event} e - The touch move event
	 * @returns {void}
	 */
	const handleButtonTouchMove = (e: Event) => {
		if (window.scrollY === 0) {
			// Prevent accidentally reloading the page
			// when pressing a button and pulling the page on smartphones.
			// It's annoying.
			e.preventDefault();
		}
	};

	/**
	 * Represents a floating text animation with unique identifier.
	 */
	interface FloatingText {
		/** Unique identifier for the floating text */
		id: number;
		/** Text content to display */
		text: string;
	}

	/**
	 * JSON structure for round information loaded from files.
	 */
	interface RoundInfoJSON {
		/** Array of correct map names for this round */
		correct: string[];
		/** Description text explaining the correct answer */
		desc: string;
	}

	/**
	 * Manages information and state for a single game round.
	 */
	class RoundInfo {
		/** JSON data containing round information */
		infoJSON = $state({} as RoundInfoJSON);
		/** Image source URL for the current round */
		img = $state('');
		/** Number of hints used in this round */
		hintsUsed = $state(0);
		/** File URI of the current round's screenshot file */
		fileURI = $state('');
		/** Current guess attempt index */
		tryIndex = $state(0);
		/** Controls whether the solution reveal UI should be displayed for this round */
		revealSolution = $state(false);
	}

	/**
	 * Manages the current overall game state and progression.
	 */
	class GameInfo {
		/** Current round number */
		roundNumber = $state(1);
		/** Information about the current round */
		roundInfo = $state(new RoundInfo());
		/** Count of successfully completed rounds */
		successfulRounds = $state(0);
		/** Current difficulty level string */
		currentDifficulty = $state(EASY_STRING);
		/** Player's current score */
		currentScore = $state(0);
		/** Whether the game is currently loading */
		loading = $state(true);
		/** Whether the current round is over */
		roundOver = $state(false);
		/** Whether the entire game is over */
		gameOver = $state(false);
		/** Player's guesses for current round [guess1, guess2, guess3] */
		guesses = $state(['', '', ''] as [string, string, string]);
		/** Results of each guess (correct/incorrect/almost-correct) */
		guessResults = $state(['', '', ''] as [string, string, string]);
		/** Cache of loaded round data files to avoid reloading at each round*/
		fileCache: Record<string, { default: RoundInfoJSON }> = $state({});
		/** Cache of loaded screenshot images */
		screenshotCache: Record<string, string> = $state({});
		/** Number of hints remaining for the entire game */
		hintsRemaining = $state(HINTS_PER_GAME);
		/** Current state of submitting the score to the leaderboard. Mainly for updating UI stuff.
		 * 0: Not submitted.
		 * 1: Currently submitting.
		 * 2: Submitted.
		 */
		leaderboardSubmitState = $state(0);
		/** Leaderboard name of the player. */
		playerName = $state('');

		constructor() {
			const screenshotFiles = import.meta.glob('$lib/assets/round_screens/*.jpg', {
				eager: true
			});

			for (const path in screenshotFiles) {
				const fileName = path.split('/').pop()?.replace('.jpg', '') || '';
				if (fileName.length > 0) {
					this.screenshotCache[fileName] = screenshotFiles[path] as string;
				}
			}
		}
	}

	let currentGame = $state(new GameInfo());

	/**
	 * Initializes a new game by resetting all state and loading the first picture.
	 *
	 * @returns {void}
	 */
	function startNewGame(): void {
		currentGame = new GameInfo();

		resetGuessBoxes();
		loadPic();
	}

	/**
	 * Submits the game's score and player name to the leaderboard.
	 *
	 * @returns {Promise<void>}
	 */
	async function submitScore(): Promise<void> {
		currentGame.leaderboardSubmitState = 1;
		const response = await fetch('leaderboard/save', {
			method: 'POST',
			body: JSON.stringify({ name: currentGame.playerName, points: currentGame.currentScore }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		currentGame.leaderboardSubmitState = 2;
	}

	/**
	 * Loads a random picture for the current round based on difficulty.
	 * Handles file caching, image loading, and error recovery.
	 *
	 * @returns {Promise<void>}
	 */
	async function loadPic(): Promise<void> {
		currentGame.loading = true;
		let fileURI: string = '';
		if (Object.keys(currentGame.fileCache).length === 0) {
			switch (currentGame.currentDifficulty) {
				case EASY_STRING:
					currentGame.fileCache = import.meta.glob('$lib/assets/round_infos/Easy/*.json', {
						eager: true
					});
					break;
				case MEDIUM_STRING:
					currentGame.fileCache = import.meta.glob('$lib/assets/round_infos/Medium/*.json', {
						eager: true
					});
					break;
				case HARD_STRING:
					currentGame.fileCache = import.meta.glob('$lib/assets/round_infos/Hard/*.json', {
						eager: true
					});
					break;
			}
		}
		let fileNames = Object.keys(currentGame.fileCache);
		fileURI = fileNames[Math.floor(Math.random() * fileNames.length)];
		let json = await currentGame.fileCache[fileURI];
		currentGame.roundInfo.infoJSON = json.default;
		currentGame.roundInfo.fileURI = fileURI;
		fileURI = fileURI.substring(fileURI.lastIndexOf('/') + 1, fileURI.lastIndexOf('.'));
		const imgURI = currentGame.screenshotCache[fileURI]['default'];
		const img = new Image();
		img.onload = () => {
			delete currentGame.fileCache[currentGame.roundInfo.fileURI];
			delete currentGame.screenshotCache[fileURI];
			currentGame.roundInfo.img = imgURI;
			currentGame.loading = false;
		};
		img.onerror = () => {
			console.error('Failed to load image:', currentGame.roundInfo.fileURI);
			console.error('Loading new image instead');
			delete currentGame.fileCache[currentGame.roundInfo.fileURI];
			delete currentGame.screenshotCache[fileURI];
			loadPic();
			return;
		};
		img.src = imgURI;
	}

	/**
	 * Creates and displays a floating text animation for guess feedback.
	 *
	 * @param {string} guessCategory - The category of guess result
	 * @returns {void}
	 */
	function createFloatingText(guessCategory: string) {
		const id = Math.random();
		const possibleTexts: readonly string[] = RESPONSE_STRINGS[guessCategory];

		const floatingText = possibleTexts[Math.floor(Math.random() * possibleTexts.length)];
		floatingTexts.push({ id, text: floatingText });

		setTimeout((): void => {
			floatingTexts = [];
			let failText = document.getElementById('failText');
			if (!failText) {
				return;
			}
			if (guessCategory === INCORRECT_STRING) {
				failText.style.color = 'var(--incorrect)';
			} else if (guessCategory === ALMOST_CORRECT_STRING) {
				failText.style.color = 'var(--almost-correct)';
			} else if (guessCategory === CORRECT_STRING) {
				failText.style.color = 'var(--correct)';
			}
		}, 10);
	}

	/**
	 * Processes the player's current guess and updates game state accordingly.
	 * Handles correct guesses, partial matches, and incorrect guesses.
	 * Manages round progression and scoring.
	 *
	 * @returns {void}
	 */
	function submitGuess(): void {
		const guess = currentGame.guesses[currentGame.roundInfo.tryIndex];
		if (!guess) {
			return;
		}
		const correctMaps = currentGame.roundInfo.infoJSON.correct;
		const revealSolution = (): void => {
			setTimeout((): void => {
				currentGame.roundInfo.revealSolution = true;
			}, REVEAL_SOLUTION_WINDOW_TIMEOUT);
		};

		if (correctMaps.includes(guess)) {
			currentGame.guessResults[currentGame.roundInfo.tryIndex] = CORRECT_STRING;
			createFloatingText(CORRECT_STRING);
			let newScore = 3 - currentGame.roundInfo.tryIndex;
			if (compMode) {
				newScore *= 2;
			}
			currentGame.currentScore += newScore;
			currentGame.roundOver = true;
			revealSolution();
			++currentGame.successfulRounds;
			return;
		} else if (
			correctMaps.some(
				(correctMap: string) => correctMap.indexOf(guess.substring(0, guess.indexOf('_'))) === 0
			)
		) {
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
		revealSolution();
	}

	/**
	 * Update hint and guess slot states when user requests a hint.
	 * Advances to the next guess slot automatically.
	 *
	 * @returns {void}
	 */
	function getAHint(): void {
		--currentGame.hintsRemaining;
		++currentGame.roundInfo.hintsUsed;
		++currentGame.roundInfo.tryIndex;
	}

	/**
	 * Advances to the next round or ends the game if all rounds are complete.
	 * Handles difficulty progression, round initialization, and game over state.
	 * Uses configurable timeout for smooth game over transition.
	 *
	 * @returns {void}
	 */
	function startNextRound(): void {
		currentGame.roundInfo.revealSolution = false;
		if (currentGame.roundNumber + 1 > MAX_ROUNDS) {
			setTimeout((): void => {
				currentGame.gameOver = true;
			}, REVEAL_GAME_OVER_WINDOW_TIMEOUT);
			return;
		}
		currentGame.roundOver = false;
		++currentGame.roundNumber;
		currentGame.roundInfo = new RoundInfo();
		if (currentGame.roundNumber >= HARD_LIMIT_ROUND) {
			currentGame.fileCache = {};
			currentGame.currentDifficulty = HARD_STRING;
		} else if (currentGame.roundNumber >= MEDIUM_START_ROUND) {
			currentGame.fileCache = {};
			currentGame.currentDifficulty = MEDIUM_STRING;
		}
		resetGuessBoxes();
		loadPic();
	}

	/**
	 * Resets all guess input box contents and colors for a new round.
	 *
	 * @returns {void}
	 */
	function resetGuessBoxes(): void {
		currentGame.guesses = ['', '', ''];
		currentGame.guessResults = ['', '', ''];
	}

	function validateLeaderboardName(name: string): boolean {
		return LEADERBOARD_STRING_WHITELIST.test(name);
	}

	/**
	 * Handles global keyboard events for game navigation.
	 * Enter key progresses through game states or submits guesses.
	 *
	 * @param {KeyboardEvent} event - The keyboard event
	 * @returns {void}
	 */
	function handleGlobalKeydown(event: KeyboardEvent): void {
		if (event.key != 'Enter') {
			return;
		}
		if (currentGame.roundInfo.revealSolution) {
			startNextRound();
		} else if (currentGame.gameOver) {
			if (leaderboardPopupOpen) {
				leaderboardPopupOpen = false;
			} else if (
				currentGame.leaderboardSubmitState === 0 &&
				validateLeaderboardName(currentGame.playerName)
			) {
				submitScore();
			} else if (currentGame.leaderboardSubmitState > 0 || currentGame.playerName.length === 0) {
				startNewGame();
			}
		} else if (
			!currentGame.loading &&
			!currentGame.roundOver &&
			currentGame.guesses[currentGame.roundInfo.tryIndex]
		) {
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
		<h2 in:fade={{ duration: 1500 }}>Loading screenshot<DotLoadingIndicator /></h2>
	</div>
{:else if !currentGame.loading}
	<div class="flex-box game-box" in:fade={{ duration: 200 }}>
		<h1>WHAT STRAFTAT MAP IS THIS?</h1>
		<hr />
		<Lightbox enableClickToClose={true} showCloseButton={false}>
			<img src={currentGame.roundInfo.img} alt="Game screenshot" />
		</Lightbox>
		<hr />
		<div class="sub-ui-element-box">
			<h2>
				Round {currentGame.roundNumber}/{MAX_ROUNDS}<br />
				Difficulty: {currentGame.currentDifficulty}<br />
				Current Score: {currentGame.currentScore}<br />
				{#if currentGame.roundInfo.hintsUsed > 0}
					<br />Map name starts with {currentGame.roundInfo.infoJSON.correct[0][0]}
				{/if}
				{#if currentGame.roundInfo.hintsUsed > 1}
					<br />Map name has {currentGame.roundInfo.infoJSON.correct[0].length} characters
				{/if}
			</h2>
			<button
				id="hintButton"
				onclick={getAHint}
				ontouchmove={handleButtonTouchMove}
				disabled={currentGame.roundInfo.tryIndex === 2 ||
					currentGame.hintsRemaining === 0 ||
					currentGame.roundInfo.hintsUsed === MAX_HINTS_PER_ROUND ||
					currentGame.roundOver ||
					currentGame.gameOver}
			>
				GIVE ME A HINT ({currentGame.hintsRemaining}/{HINTS_PER_GAME})
			</button>
		</div>
		<hr />

		<div class="sub-ui-element-box">
			<div
				class="guessbox-wrapper"
				class:correct={currentGame.guessResults[0] === CORRECT_STRING}
				class:incorrect={currentGame.guessResults[0] === INCORRECT_STRING}
				class:almost-correct={currentGame.guessResults[0] === ALMOST_CORRECT_STRING}
			>
				<Svelecte
					renderer={dropBoxRenderer}
					inputId="guess0"
					options={MAP_LIST}
					highlightFirstItem={false}
					bind:value={currentGame.guesses[0]}
					disabled={currentGame.loading ||
						currentGame.roundInfo.tryIndex != 0 ||
						currentGame.roundOver ||
						currentGame.gameOver}
					placeholder="1st Guess"
				/>
			</div>
			<div
				class="guessbox-wrapper"
				class:correct={currentGame.guessResults[1] === CORRECT_STRING}
				class:incorrect={currentGame.guessResults[1] === INCORRECT_STRING}
				class:almost-correct={currentGame.guessResults[1] === ALMOST_CORRECT_STRING}
			>
				<Svelecte
					renderer={dropBoxRenderer}
					inputId="guess1"
					options={MAP_LIST}
					highlightFirstItem={false}
					bind:value={currentGame.guesses[1]}
					disabled={currentGame.roundInfo.tryIndex != 1 ||
						currentGame.roundOver ||
						currentGame.gameOver}
					placeholder="2nd Guess"
				/>
			</div>
			<div
				class="guessbox-wrapper"
				class:correct={currentGame.guessResults[2] === CORRECT_STRING}
				class:incorrect={currentGame.guessResults[2] === INCORRECT_STRING}
				class:almost-correct={currentGame.guessResults[2] === ALMOST_CORRECT_STRING}
			>
				<Svelecte
					renderer={dropBoxRenderer}
					inputId="guess2"
					options={MAP_LIST}
					highlightFirstItem={false}
					bind:value={currentGame.guesses[2]}
					disabled={currentGame.roundInfo.tryIndex != 2 ||
						currentGame.roundOver ||
						currentGame.gameOver}
					placeholder="3rd Guess"
				/>
			</div>
			{#each floatingTexts as t (t.id)}
				<div id="failFly" out:fly={{ y: -100, duration: 2500 }}>
					<div id="failText" out:fade={{ duration: 7000 }}>
						{t.text}
					</div>
				</div>
			{/each}
			<button
				id="guessButton"
				onclick={submitGuess}
				ontouchmove={handleButtonTouchMove}
				disabled={!currentGame.guesses[currentGame.roundInfo.tryIndex] ||
					currentGame.roundOver ||
					currentGame.gameOver}
			>
				LOCK IN
			</button>
		</div>
	</div>

	{#if currentGame.roundInfo.revealSolution}
		<div
			class="flex-box game-box answer-box"
			use:draggable={{ cancel: '#nextRoundButton' }}
			in:fade
			out:fade
		>
			<h1>Answer:</h1>
			<br />
			{#each currentGame.roundInfo.infoJSON.correct as mapName}
				<div class="flex-box">
					<div class="thumbnail-text">
						<img src="/thumbnails/{mapName}.jpg" alt="{mapName} thumbnail" />
						<h2>{mapName}</h2>
					</div>
				</div>
			{/each}
			<hr />
			<h2>{currentGame.roundInfo.infoJSON.desc}</h2>
			<hr />
			<button
				id="nextRoundButton"
				ontouchmove={handleButtonTouchMove}
				onclick={startNextRound}
				disabled={!currentGame.roundInfo.revealSolution}
			>
				NEXT ROUND
			</button>
		</div>
	{/if}
	{#if currentGame.gameOver}
		<div
			class="flex-box game-box answer-box"
			use:draggable={{ cancel: '.cancelDrag' }}
			in:fade
			out:fade
		>
			<h1>Finished!</h1>
			<hr />
			<h2>
				You got {currentGame.successfulRounds} out of {MAX_ROUNDS} questions right!<br />Your score: {currentGame.currentScore}
			</h2>
			{#if currentGame.leaderboardSubmitState === 0}
				<div>
					<input
						class:incorrect={currentGame.playerName.length > 0 &&
							!validateLeaderboardName(currentGame.playerName)}
						maxlength="20"
						placeholder="Your leaderboard name"
						bind:value={currentGame.playerName}
						disabled={leaderboardPopupOpen}
					/>
				</div>

				<button
					class="cancelDrag"
					id="submitScoreButton"
					ontouchmove={handleButtonTouchMove}
					onclick={submitScore}
					disabled={!validateLeaderboardName(currentGame.playerName) ||
						currentGame.leaderboardSubmitState > 0 ||
						leaderboardPopupOpen}
				>
					SUBMIT SCORE TO LEADERBOARD
				</button>
			{:else if currentGame.leaderboardSubmitState === 1}
				<h2>Submitting score<DotLoadingIndicator /></h2>
			{:else if currentGame.leaderboardSubmitState === 2}
				<h2>Done!</h2>
			{/if}
			<button
				class="cancelDrag"
				id="viewLeaderboardButton"
				ontouchmove={handleButtonTouchMove}
				onclick={() => {
					leaderboardPopupOpen = true;
				}}
				disabled={leaderboardPopupOpen}
			>
				VIEW LEADERBOARD
			</button>
			<hr />
			<h2>
				<label>
					<input type="checkbox" bind:checked={compMode} />
					Enable Comp Mode
				</label>
			</h2>
			<button
				class="cancelDrag"
				id="newGameButton"
				ontouchmove={handleButtonTouchMove}
				onclick={startNewGame}
				disabled={leaderboardPopupOpen}
			>
				NEW GAME
			</button>
		</div>
	{/if}

	{#if leaderboardPopupOpen}
		<div
			class="flex-box game-box answer-box leaderboard-popup"
			use:draggable={{ cancel: '.cancelDrag' }}
			in:fade
			out:fade
		>
			<div class="leaderboard-overflow-box">
				<Leaderboard />
			</div>
			<button
				class="cancelDrag"
				id="closeLeaderboardButton"
				ontouchmove={handleButtonTouchMove}
				onclick={() => {
					leaderboardPopupOpen = false;
				}}
			>
				CLOSE LEADERBOARD
			</button>
		</div>
	{/if}
{/if}

<style>
	h1 {
		margin: 1% 5%;
		font-size: 3rem;
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

	input {
		background-color: black;
		border: 1px var(--straftat-green) solid;
		border-radius: 5px;
		color: white;
		max-width: 25vw;
		display: block;
		margin: 0 auto;
	}

	input.incorrect {
		background-color: var(--incorrect);
	}

	.leaderboard-popup {
		min-width: 370px;
	}

	.leaderboard-overflow-box {
		padding-top: 10px;
		min-width: 310px;
		max-height: 60vh;
		overflow: hidden;
		overflow-y: auto;
		overflow-x: auto;
	}

	@media (max-width: 720px) {
		:global(h1),
		h1 {
			font-size: 1.5rem;
		}

		:global(h2),
		h2 {
			font-size: small;
		}

		:global(.svelecte) {
			font-size: small;
			--sv-dropdown-width: 180px;
		}

		input {
			max-width: 40vw;
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
