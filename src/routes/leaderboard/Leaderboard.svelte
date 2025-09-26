<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	let data = $state({});
	let processedData = $state({});
	let leaderboardLoaded = $state(false);

	onMount(async (): Promise<void> => {
		let res = await fetch('leaderboard/load');
		data = await res.json();
		processedData = processData(data);
		leaderboardLoaded = true;
	});

	function processData(data) {
		let processed = [...data.leaderboardEntries];
		processed.forEach((entry) => {
			entry.created_at = new Date(entry.created_at).toLocaleString();
		});
		return processed;
	}
</script>

{#if leaderboardLoaded}
	<section in:fade>
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
					{#each processedData as entry, i}
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
				Leaderboard gets cleared every 1st and 15th of the month.<br />Nasty names will be removed.
			</h2>
		</div>
	</section>
{/if}

<style>
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

	@media (max-width: 720px) {
		td {
			font-size: 0.5rem;
		}
	}

	@media (min-width: 720px) and (max-width: 1080px) {
		td {
			font-size: 0.75rem;
		}
	}
</style>
