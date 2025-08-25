<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { models, routes } from '$lib/dataStore';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import FileStack from '@lucide/svelte/icons/file-stack';
	import Route from '@lucide/svelte/icons/route';
	import SquarePlus from '@lucide/svelte/icons/square-plus';

	let areModelsOpen = $state(false);
	let areRoutesOpen = $state(false);

	function toggleModelsDropdown() {
		areModelsOpen = !areModelsOpen;
	}

	function toggleRoutesDropdown() {
		areRoutesOpen = !areRoutesOpen;
	}
</script>

<div class="bg-background text-text m-4 flex w-[15vw] min-w-[250px] flex-col overflow-y-auto rounded-xl p-4 font-semibold">
	<ul class="space-y-2">
		<li>
			<button
				onclick={toggleModelsDropdown}
				class="hover:text-accent-light flex w-full cursor-pointer items-center justify-between py-1 text-left focus:outline-none"
			>
				<span>
					<FileStack class="text-accent mr-3 inline-block" />
					Models
				</span>
				{#if areModelsOpen}
					<ChevronDown class="inline-block" />
				{:else}
					<ChevronRight class="inline-block" />
				{/if}
			</button>
			{#if areModelsOpen}
				<ul class="mt-1 space-y-1 pl-6">
					{#if $models.length === 0}
						<li>
							<a href="{base}/models/create" class="text-accent-light hover:text-accent flex items-center py-1 text-sm">
								<SquarePlus class="mr-2 inline-block" />
								Create Model
							</a>
						</li>
					{:else}
						{#each $models as model (model.name)}
							<li>
								<a
									href="{base}/models/{model.name}"
									class="hover:text-accent block py-1 text-sm {page.url.pathname.startsWith(`/models/${model.name}`)
										? 'text-accent font-bold'
										: ''}"
								>
									{model.name}
								</a>
							</li>
						{/each}
						<li>
							<a href="{base}/models/create" class="text-accent-light hover:text-accent mt-1 flex items-center py-1 text-sm">
								<SquarePlus class="mr-2 inline-block" />
								Add New Model
							</a>
						</li>
					{/if}
				</ul>
			{/if}
		</li>
		<li>
			<button
				onclick={toggleRoutesDropdown}
				class="hover:text-accent-light flex w-full cursor-pointer items-center justify-between py-1 text-left focus:outline-none"
			>
				<span>
					<Route class="text-accent mr-3 inline-block" />
					Routes
				</span>
				{#if areRoutesOpen}
					<ChevronDown class="inline-block" />
				{:else}
					<ChevronRight class="inline-block" />
				{/if}
			</button>
			{#if areRoutesOpen}
				<ul class="mt-1 space-y-1 pl-6">
					{#if $routes.length === 0}
						<li>
							<a href="{base}/routes/create" class="text-accent-light hover:text-accent mt-1 flex items-center py-1 text-sm">
								<SquarePlus class="mr-2 inline-block" />
								Create Route
							</a>
						</li>
					{:else}
						{#each $routes as route (route.name)}
							<li>
								<a
									href="{base}/routes/{encodeURIComponent(route.name.trim())}"
									class="hover:text-accent block py-1 text-sm {page.url.pathname.includes(
										`/routes/${encodeURIComponent(route.name.trim())}`
									)
										? 'text-accent font-bold'
										: ''}"
								>
									{route.name}
								</a>
							</li>
						{/each}
						<li>
							<a href="{base}/routes/create" class="text-accent-light hover:text-accent mt-1 flex items-center py-1 text-sm">
								<SquarePlus class="mr-2 inline-block" />
								Add New Route
							</a>
						</li>
					{/if}
				</ul>
			{/if}
		</li>
	</ul>
</div>

<style>
</style>
