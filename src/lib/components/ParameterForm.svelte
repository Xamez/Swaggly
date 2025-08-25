<script lang="ts">
	import type { ParameterSchemaForForm } from '$lib/schemaDefinitions';
	import { availableParameterIns, availableTypes } from '$lib/types';
	import { ChevronDown, X } from '@lucide/svelte';

	let {
		parameter,
		index,
		onRemove
	}: {
		parameter: ParameterSchemaForForm;
		index: number;
		onRemove: (index: number) => void;
	} = $props();

	let isExpanded = $state(false);
	
	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

<div class="mb-2 rounded-lg border border-gray-200 bg-background p-3">
	<div class="flex items-center gap-3">
		<button
			type="button"
			onclick={toggleExpanded}
			class="flex-shrink-0 w-6 h-6 rounded bg-background border border-gray-600 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
			aria-label="Toggle parameter details"
		>
			<ChevronDown class="w-3.5 h-3.5 transition-transform duration-200 stroke-2 text-text-label {isExpanded ? 'rotate-180' : ''}" />
		</button>

		<div class="flex-1 min-w-0">
			<input
				type="text"
				bind:value={parameter.name}
				required
				placeholder="Parameter name"
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>

		<div class="w-20">
			<select
				bind:value={parameter.in}
				class="w-full px-2 py-1 text-xs border border-gray-600 rounded bg-background focus:border-accent"
			>
				{#each availableParameterIns as inOpt (inOpt)}
					<option value={inOpt}>{inOpt}</option>
				{/each}
			</select>
		</div>

		<div class="w-24">
			<select
				bind:value={parameter.schema_simple_type}
				class="w-full px-2 py-1 text-xs border border-gray-600 rounded bg-background focus:border-accent"
			>
				{#each availableTypes as typeOpt (typeOpt)}
					<option value={typeOpt}>{typeOpt}</option>
				{/each}
			</select>
		</div>

		<label class="flex items-center text-xs">
			<input
				type="checkbox"
				bind:checked={parameter.required}
				class="w-4 h-4 text-accent border-gray-600 rounded"
			/>
			<span class="ml-1.5 text-text-label">Required</span>
		</label>

		<label class="flex items-center text-xs">
			<input
				type="checkbox"
				bind:checked={parameter.schema_nullable}
				class="w-4 h-4 text-accent border-gray-600 rounded"
			/>
			<span class="ml-1.5 text-text-label">Nullable</span>
		</label>
		<button
			type="button"
			onclick={() => onRemove(index)}
			class="flex-shrink-0 w-6 h-6 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
			aria-label="Remove parameter"
		>
			<X class="w-3.5 h-3.5 stroke-2" />
		</button>
	</div>

	{#if isExpanded}
		<div class="mt-4 pt-4 border-t border-gray-200 space-y-4">
			<div>
				<label class="block text-xs font-medium text-text-label mb-1" for="paramDesc-{index}">Description</label>
				<textarea
					id="paramDesc-{index}"
					bind:value={parameter.description}
					rows="2"
					placeholder="Parameter description..."
					class="w-full px-3 py-2 text-sm border border-gray-600 rounded bg-background focus:border-accent resize-none"
				></textarea>
			</div>

			<div class="flex items-center gap-4">
				<label class="inline-flex items-center">
					<input
						type="checkbox"
						bind:checked={parameter.deprecated}
						class="w-4 h-4 text-accent border-gray-600 rounded"
					/>
					<span class="ml-2 text-xs text-text-label">Deprecated</span>
				</label>
				<label class="inline-flex items-center">
					<input
						type="checkbox"
						bind:checked={parameter.allowEmptyValue}
						class="w-4 h-4 text-accent border-gray-600 rounded"
					/>
					<span class="ml-2 text-xs text-text-label">Allow Empty Value</span>
				</label>
			</div>

			{#if parameter.example_str !== undefined}
				<div>
					<label class="block text-xs font-medium text-text-label mb-1" for="paramExample-{index}">Example</label>
					<input
						id="paramExample-{index}"
						type="text"
						bind:value={parameter.example_str}
						placeholder="Example value..."
						class="w-full px-3 py-2 text-sm border border-gray-600 rounded bg-background focus:border-accent"
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>
