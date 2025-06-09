<script lang="ts">
	import { goto } from '$app/navigation';
	import github from '$lib/images/github.svg';
	import { generateAndDownloadSwagger, importSwagger, resetStore } from '$lib/swaggerGenerator';

	function resetStoreAndRedirect() {
		resetStore();
		goto('/');
	}
</script>

<header class="bg-background text-text m-4 mb-2 flex items-center justify-between rounded-xl p-4 px-8 font-semibold">
	<h1 class="text-2xl font-bold">Swaggly</h1>
	<nav>
		<ul class="flex flex-row space-x-8">
			<li><button onclick={importSwagger} class="cursor-pointer">Import swagger</button></li>
			<li><button onclick={generateAndDownloadSwagger} class="cursor-pointer">Export swagger</button></li>
			<li><button onclick={resetStoreAndRedirect} class="cursor-pointer">Clear</button></li>
		</ul>
	</nav>

	<a href="https://github.com/Xamez/swaggly" target="_blank">
		<img src={github} alt="Github repository" class="w-8" />
	</a>
</header>

<style>
</style>
