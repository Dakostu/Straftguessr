<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import Game from './game/+page.svelte';

	/**
	 * Controls whether the splash screen should be displayed.
	 * @default false
	 */
	let displayStart = $state(false);

	/**
	 * Indicates whether to render the Game element.
	 * @default false
	 */
	let startGame = $state(false);

	/**
	 * Indicates whether to enable Comp Mode.
	 * Comp Mode disables all map preview thumbnails for double the points per round.
	 * @default false
	 */
	let compModeOn = $state(false);

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

	let { data } = $props();

	setInterval(() => {
		if (browser) {
			// Small hack to force reloading of server contents (leaderboard).
			// TODO: Move sorting from server to client side.
			invalidateAll();
		}
	}, 10000);
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
				<input type="checkbox" bind:checked={compModeOn} />
				Enable Comp Mode
			</label>
			<div style="font-size:x-small; text-align:center">
				(disable map thumbnails in map selection menu, double points per round)
			</div>
			<button id="startButton" onclick={startTheGame} disabled={startGame}>
				<h2 style="color:black;font-size: 2rem;">START</h2>
			</button>

			<div class="flex-box game-box">
				<h1>LEADERBOARD</h1>
				<table>
					<thead>
						<tr>
							<th>Rank</th>
							<th>Name</th>
							<th>Points</th>
							<th>Date</th>
						</tr>
					</thead>
					<tbody>
						{#each data.leaderboardEntries as entry, i}
							<tr>
								<td>{i + 1}</td>
								<td>{entry.name}</td>
								<td>{entry.points}</td>
								<td>{entry.created_at}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<h2>
					Leaderboard gets cleared every 1st and 15th of the month.<br />Nasty names will be
					removed.
				</h2>
			</div>
		</section>
	{/if}
</div>
{#if startGame}
	<div in:fade><Game compMode={compModeOn} /></div>
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

	th {
		border-bottom: 1px solid var(--straftat-green);
		color: var(--straftat-green);
	}

	td {
		color: white;
	}

	th:nth-child(2) {
		padding-left: 5vw;
		padding-right: 5vw;
	}

	tbody {
		text-align: center;
	}

	input {
		align-items: center;
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
