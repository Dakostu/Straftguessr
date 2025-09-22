<script lang="ts">
	import { fade } from 'svelte/transition';
	import Game from './game/+page.svelte';

	/**
	 * Controls whether the splash screen should be displayed.
	 * @default false
	 */
	let displayStart = false;

	/**
	 * Indicates whether to render the Game element.
	 * @default false
	 */
	let startGame = false;

	/**
	 * Indicates whether to enable Comp Mode.
	 * Comp Mode disables all map preview thumbnails for double the points per round.
	 * @default false
	 */
	let compModeOn = false;

	/**
	 * Initializes the fade-in animation after a brief delay to ensure smoother rendering.
	 */
	setTimeout((): void => {
		displayStart = true;
	}, 10);

	/**
	 * Initiates the game start sequence with a small delay.
	 * The delay allows for smooth transition animations between menu and game states.
	 *
	 * @returns {void}
	 */
	function startTheGame(): void {
		setTimeout(() => {
			startGame = true;
		}, 10);
	}

	/**
	 * Handles global keydown events to allow starting the game with the Enter key.
	 * Only responds to the Enter key, ignoring all other keyboard input.
	 *
	 * @param {KeyboardEvent} event - The keyboard event containing key information
	 * @returns {void}
	 */
	function handleGlobalKeydown(event: KeyboardEvent): void {
		if (event.key != 'Enter') {
			return;
		}
		startTheGame();
	}
</script>

<svelte:head>
	<title>STRAFTGUESSR</title>
	<meta name="description" content="STRAFTGUESSR" />
</svelte:head>

<svelte:window on:keydown={handleGlobalKeydown} />

<div>
	{#if displayStart && !startGame}
		<section in:fade={{ duration: 500 }}>
			<h1>STRAFTGUESSR</h1>

			<h2>
				15 screenshots.
				<br />
				3 tries per screenshot.
				<br />
				Can you guess the
				<a target="_blank" href="https://store.steampowered.com/app/2386720/STRAFTAT/">STRAFTAT</a> map
				based on the screenshot?
			</h2>
			<label>
				<input type="checkbox" bind:checked={compModeOn}/>
				Comp Mode
			</label>
			<div style="font-size:x-small; text-align:center">
					(disable map thumbnails in map selection menu, double points per round)
			</div>
			<button
				id="startButton"
				onclick={startTheGame}
				disabled={startGame}
			>
				<h2 style="color:black;font-size: 2rem;">START</h2>
			</button>
		</section>
	{/if}
</div>
{#if startGame}
	<div in:fade><Game compMode={compModeOn}/></div>
{/if}

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding-left: 5%;
		padding-right: 5%;
		min-height: 50vh;
		max-width: 90%;
	}

	button {
		min-width: 70%;
	}

	h1 {
		margin-block: 0.67em;
		font-size: 3rem;
	}

	@media (max-width: 720px) {
		h1 {
			font-size: 2rem;
		}

		button {
			min-width: 80%;
		}
	}
</style>
