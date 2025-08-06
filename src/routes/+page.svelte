<svelte:head>
	<title>STRAFTGUESSR</title>
	<meta name="description" content="STRAFTGUESSR" />
</svelte:head>

<script>
	import {fade} from "svelte/transition"
	import Game from "./game/+page.svelte"

	let startFade = false;
	let gameStarted = false;
	setTimeout(() => {
			startFade = true;
		}, 10);

	function startGame() {
		setTimeout(() => {
			gameStarted = true;
		}, 10);
	}
</script>

<div>
	{#if startFade && !gameStarted}
	<section>
	<h1 in:fade={{duration:500}}>
		STRAFTGUESSR
	</h1>

	<h2 in:fade={{duration:500}}>
		15 screenshots.
		<br />
		3 tries per screenshot.
		<br />
		Can you guess the <a target="_blank" href="https://store.steampowered.com/app/2386720/STRAFTAT/">STRAFTAT</a> map based on the screenshot?
	</h2>
	<button in:fade={{duration:500}} id="startButton" onclick={startGame} disabled={gameStarted}>
		<h2 style="color:black;font-size: 2rem;">
			START
		</h2>
	</button>
	</section>
	{/if}
</div>
{#if gameStarted}
	<div in:fade><Game /></div>
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
		min-width: 50%;
	}

	section h1{
		font-size: 3rem;
	}

@media (max-width: 720px) {
	section h1 {
		font-size: 2rem;
	}
}
</style>
