<script lang="ts">
	import '../app.css';

	import Header from '../lib/components/Header.svelte';
	import Sidebar from '../lib/components/Sidebar.svelte'; // Import Sidebar

	let { children } = $props();
</script>

<div class="app">
	<Header />
	<div class="main-content-area">
		<Sidebar />
		<main>
			{@render children()}
		</main>
	</div>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: var(--color-background-darker);
	}

	.main-content-area {
		display: flex;
		flex: 1; /* Make this area take up remaining vertical space */
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		/* margin: 0 auto; */ /* Adjusted for flex layout */
		box-sizing: border-box;
		padding: 1rem; /* Add some padding for the content area */
	}
</style>
