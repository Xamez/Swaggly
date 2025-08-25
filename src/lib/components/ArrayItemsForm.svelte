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

<div class="border-t border-white pt-3">
	<p class="text-xs font-medium text-text-label mb-2">Array Item Definition</p>
	<div class="mb-3 flex items-center space-x-4">
		<label class="inline-flex items-center">
			<input
				type="radio"
				name="items_definition_type"
				value="simple"
				bind:group={items_definition_type}
				class="w-4 h-4 text-accent border-gray-600"
			/>
			<span class="ml-2 text-xs text-text">Simple Type</span>
		</label>
		<label class="inline-flex items-center">
			<input
				type="radio"
				name="items_definition_type"
				value="reference"
				bind:group={items_definition_type}
				class="w-4 h-4 text-accent border-gray-600"
			/>
			<span class="ml-2 text-xs text-text">Reference ($ref)</span>
		</label>
	</div>

	{#if items_definition_type === 'simple'}
		<div class="mb-3">
			<label class="block text-xs text-text-label mb-1" for="itemType">Item Type</label>
			<select
				id="itemType"
				bind:value={items_simple_type}
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			>
				<option value={undefined}>Select type...</option>
				{#each availableTypes.filter((t) => t !== 'array' && t !== 'object') as typeOpt (typeOpt)}
					<option value={typeOpt}>{typeOpt}</option>
				{/each}
			</select>
		</div>
	{/if}
	
	{#if items_definition_type === 'reference'}
		<div class="mb-3">
			<label class="block text-xs text-text-label mb-1" for="itemRefPath">Item Model Reference</label>
			<select
				id="itemRefPath"
				bind:value={items_ref_path}
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			>
				<option value={undefined}>Select Model...</option>
				{#each existingModelNames as name (name)}
					<option value="#/components/schemas/{name}">{name}</option>
				{/each}
			</select>
		</div>
	{/if}

	<p class="text-xs font-medium text-text-label mb-2">Array Constraints</p>
	<div class="grid grid-cols-2 gap-3 mb-3">
		<div>
			<label class="block text-xs text-text-label mb-1" for="minItems">Min Items</label>
			<input
				id="minItems"
				type="number"
				bind:value={minItems}
				min="0"
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>
		<div>
			<label class="block text-xs text-text-label mb-1" for="maxItems">Max Items</label>
			<input
				id="maxItems"
				type="number"
				bind:value={maxItems}
				min="0"
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>
	</div>
	
	<div class="flex items-center">
		<label class="inline-flex items-center">
			<input
				type="checkbox"
				bind:checked={uniqueItems}
				class="w-4 h-4 text-accent border-gray-600 rounded"
			/>
			<span class="ml-2 text-xs text-text-label">Unique Items</span>
		</label>
	</div>
</div>
