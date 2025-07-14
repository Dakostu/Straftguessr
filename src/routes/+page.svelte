<svelte:head>
	<title>STRAFTGUESSR</title>
	<meta name="description" content="STRAFTGUESSR" />
</svelte:head>

<script>
	import {fly, fade} from 'svelte/transition'
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

<section>
	{#if startFade && !gameStarted}
	<h1 in:fade={{duration:500}}>
		STRAFTGUESSR
	</h1>

	<h2 in:fade={{duration:500}}>
		15 screenshots.<br />3 tries per screenshot.<br />Can you guess the STRAFTAT map based on the screenshot?
	</h2>
	
	<h1 in:fade={{duration:500}}>
		<button id="startButton" onclick={startGame} disabled={gameStarted}>
			START
		</button>
	</h1>
	{/if}
</section>
{#if gameStarted}
	<div in:fade><Game /></div>
{/if}

<style>	
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
	
</style>
