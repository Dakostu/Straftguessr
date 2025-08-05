<script lang="ts">
	import "../app.css";
	import github from "$lib/images/github.svg";

	let { children } = $props();
</script>

<div class="app">

	<main>
		{@render children()}
	</main>

	<footer>
		<div class="corner">
			<a href="https://github.com/Dakostu/Straftguessr">
				<img src={github} alt="GitHub" />
			</a>
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 70vw;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: end;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	@media (max-width: 720px) {
		footer {
			padding: 12px 0;
		}

		main {
			max-width: 95vw;
		}
	}

	@media (min-width: 720px) and (max-width: 1920px) {
		main {
			max-width: 80vw;
		}
	}

</style>
