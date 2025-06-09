<script lang="ts">
	import type { ParameterSchemaForForm } from '$lib/schemaDefinitions';
	import { availableParameterIns, availableTypes } from '$lib/types';

	let {
		parameter,
		index,
		onRemove
	}: {
		parameter: ParameterSchemaForForm;
		index: number;
		onRemove: (index: number) => void;
	} = $props();
</script>

<div class="mb-4 rounded-lg border border-white p-4 shadow">
	<div class="mb-2 flex items-center justify-between">
		<h4 class="font-semibold">Parameter {index + 1}</h4>
		<button
			type="button"
			onclick={() => onRemove(index)}
			class="cursor-pointer rounded px-2 py-1 text-sm font-medium text-red-500 transition-colors duration-150 hover:bg-red-100 hover:text-red-700"
			>Remove</button
		>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<label for="paramName-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Name</label>
			<input
				type="text"
				id="paramName-{index}"
				bind:value={parameter.name}
				required
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			/>
		</div>
		<div>
			<label for="paramIn-{index}" class="text-text-label mb-0.5 block text-sm font-medium">In</label>
			<select
				id="paramIn-{index}"
				bind:value={parameter.in}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			>
				{#each availableParameterIns as inOpt (inOpt)}
					<option value={inOpt}>{inOpt}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="mt-4">
		<label for="paramDesc-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Description</label>
		<textarea
			id="paramDesc-{index}"
			bind:value={parameter.description}
			rows="2"
			class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block min-h-[40px] w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
		></textarea>
	</div>

	<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<label for="paramSchemaType-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Schema Type</label>
			<select
				id="paramSchemaType-{index}"
				bind:value={parameter.schema_simple_type}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			>
				{#each availableTypes.filter((t) => t !== 'object' && t !== 'array') as typeOpt (typeOpt)}
					<option value={typeOpt}>{typeOpt}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="mt-4 flex items-center gap-4">
		<label class="inline-flex items-center">
			<input
				type="checkbox"
				bind:checked={parameter.required}
				class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
			/>
			<span class="text-text-label ml-2 text-sm">Required</span>
		</label>
		<label class="inline-flex items-center">
			<input
				type="checkbox"
				bind:checked={parameter.deprecated}
				class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
			/>
			<span class="text-text-label ml-2 text-sm">Deprecated</span>
		</label>
	</div>
</div>
