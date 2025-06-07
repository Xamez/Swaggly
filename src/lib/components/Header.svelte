<script lang="ts">
	import github from '$lib/images/github.svg';
</script>

<header class="bg-background text-text mx-2 mt-2 flex items-center justify-between rounded-xl p-4 px-8 font-semibold">
	<h1 class="text-2xl font-bold">Swaggly</h1>
	<nav>
		<ul class="flex flex-row space-x-8">
			<li><a href="/swaggers">Swaggers</a></li>
			<span>|</span>
			<li><a href="/">Import swagger</a></li>
			<li><a href="/">Export swagger</a></li>
		</ul>
	</nav>

	<a href="https://github.com/Xamez/swaggly" target="_blank">
		<img src={github} alt="Github repository" class="w-8" />
	</a>
</header>

<style>
</style>
