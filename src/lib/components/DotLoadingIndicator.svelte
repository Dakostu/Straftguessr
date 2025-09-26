<script lang="ts">
	/**
	 * Animated dots string for loading indicator.
	 * @type string
	 */
	let loadingStringDots = $state('');

	/**
	 * Creates a visual loading indicator that resets every 4 cycles.
	 *
	 * @returns {void}
	 */
	const addLoadingStringDots = () =>
		loadingStringDots.length === 4 ? (loadingStringDots = '') : (loadingStringDots += '.');
	setInterval(addLoadingStringDots, 150);
</script>

{loadingStringDots}
