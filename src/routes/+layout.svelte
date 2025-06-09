<script lang="ts">
	import '../app.css';

	import Header from '../lib/components/Header.svelte';
	import Sidebar from '../lib/components/Sidebar.svelte';
	import Notifications from '$lib/components/Notifications.svelte';

	let { children } = $props();
</script>

<Notifications />

<div class="bg-background-darker flex min-h-screen flex-col">
	<Header />
	<div class="flex flex-1">
		<Sidebar />
		<main class="w-full flex-1">
			{@render children()}
		</main>
	</div>
</div>
