<script lang="ts">
	import type { Type } from '$lib/types';
	import { availableTypes } from '$lib/types';

	let {
		items_definition_type = $bindable(),
		items_simple_type = $bindable(),
		items_ref_path = $bindable(),
		minItems = $bindable(),
		maxItems = $bindable(),
		uniqueItems = $bindable(),
		existingModelNames
	} = $props<{
		items_definition_type: 'simple' | 'reference';
		items_simple_type: Type | undefined;
		items_ref_path: string | undefined;
		minItems: number | undefined;
		maxItems: number | undefined;
		uniqueItems: boolean;
		existingModelNames: string[];
	}>();
</script>

<div class="col-span-2 mt-2 border-t pt-2">
	<p class="text-text-label mb-1 text-sm font-medium">Array Item Definition:</p>
	<div class="mb-2 flex items-center space-x-4">
		<label class="inline-flex items-center">
			<input
				type="radio"
				name="items_definition_type"
				value="simple"
				bind:group={items_definition_type}
				class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded-full border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
			/>
			<span class="ml-2 text-sm">Simple Type</span>
		</label>
		<label class="inline-flex items-center">
			<input
				type="radio"
				name="items_definition_type"
				value="reference"
				bind:group={items_definition_type}
				class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded-full border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
			/>
			<span class="ml-2 text-sm">Reference ($ref)</span>
		</label>
	</div>

	{#if items_definition_type === 'simple'}
		<div>
			<label for="itemType" class="text-text-label mb-0.5 block text-sm font-medium">Item Type</label>
			<select
				id="itemType"
				bind:value={items_simple_type}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			>
				<option value={undefined} class="text-text bg-background">Select type...</option>
				{#each availableTypes.filter((t) => t !== 'array' && t !== 'object') as typeOpt (typeOpt)}
					<option value={typeOpt} class="text-text bg-background">{typeOpt}</option>
				{/each}
			</select>
		</div>
	{/if}
	{#if items_definition_type === 'reference'}
		<div>
			<label for="itemRefPath" class="text-text-label mb-0.5 block text-sm font-medium">Item Model Reference</label>
			<select
				id="itemRefPath"
				bind:value={items_ref_path}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			>
				<option value={undefined}>Select Model...</option>
				{#each existingModelNames as name (name)}
					<option value="#/components/schemas/{name}">{name}</option>
				{/each}
			</select>
		</div>
	{/if}

	<p class="text-text-label mt-2 mb-1 text-sm font-medium">Array Constraints:</p>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<label for="minItems" class="text-text-label mb-0.5 block text-sm font-medium">Min Items</label>
			<input
				type="number"
				id="minItems"
				bind:value={minItems}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				min="0"
			/>
		</div>
		<div>
			<label for="maxItems" class="text-text-label mb-0.5 block text-sm font-medium">Max Items</label>
			<input
				type="number"
				id="maxItems"
				bind:value={maxItems}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				min="0"
			/>
		</div>
	</div>
	<div class="mt-2 flex items-center">
		<label class="inline-flex items-center">
			<input
				type="checkbox"
				bind:checked={uniqueItems}
				class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
			/>
			<span class="text-text-label ml-2 text-sm">Unique Items</span>
		</label>
	</div>
</div>
