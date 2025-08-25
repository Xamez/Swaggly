<script lang="ts">
	import type { ResponseSchemaForForm } from '$lib/schemaDefinitions';
	import { availableMediaTypes, availableTypes } from '$lib/types';
	import { ChevronDown, X } from '@lucide/svelte';

	let { response = $bindable(), existingModelNames, index, onRemove } = $props<{
		response: ResponseSchemaForForm;
		existingModelNames: string[];
		index: number;
		onRemove: (index: number) => void;
	}>();

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
		>
			<ChevronDown class="w-3.5 h-3.5 transition-transform duration-200 stroke-2 text-text-label {isExpanded ? 'rotate-180' : ''}" />
		</button>

		<div class="w-20">
			<input
				type="text"
				bind:value={response.status_code}
				placeholder="200"
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>

		<div class="flex-1">
			<input
				type="text"
				bind:value={response.description}
				placeholder="Response description"
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>

		<label class="flex items-center text-xs">
			<input
				type="checkbox"
				bind:checked={response.has_content}
				class="w-4 h-4 text-accent border-gray-600 rounded"
			/>
			<span class="ml-1.5 text-text-label">Content</span>
		</label>

		<button
			type="button"
			onclick={() => onRemove(index)}
			class="flex-shrink-0 w-6 h-6 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
		>
			<X class="w-3.5 h-3.5 stroke-2" />
		</button>
	</div>

	{#if isExpanded && response.has_content}
		<div class="mt-4 pt-4 border-t border-gray-200 space-y-4">
			<div>
				<label class="block text-xs font-medium text-text-label mb-1" for="mediaType-{index}">Content Media Type</label>
				<select
					id="mediaType-{index}"
					bind:value={response.content_media_type}
					class="w-full px-3 py-2 text-sm border border-gray-600 rounded bg-background focus:border-accent"
				>
					{#each availableMediaTypes as mediaType (mediaType)}
						<option value={mediaType}>{mediaType}</option>
					{/each}
				</select>
			</div>

			<div class="space-y-3">
				<p class="text-xs font-medium text-text-label">Content Schema Definition</p>
				<div class="flex items-center space-x-4">
					<label class="inline-flex items-center">
						<input
							type="radio"
							name="content_schema_definition_type-{index}"
							value="simple"
							bind:group={response.content_schema_definition_type}
							class="w-4 h-4 text-accent border-gray-600"
						/>
						<span class="ml-2 text-xs text-text-label">Simple Type</span>
					</label>
					<label class="inline-flex items-center">
						<input
							type="radio"
							name="content_schema_definition_type-{index}"
							value="reference"
							bind:group={response.content_schema_definition_type}
							class="w-4 h-4 text-accent border-gray-600"
						/>
						<span class="ml-2 text-xs text-text-label">Reference ($ref)</span>
					</label>
				</div>

				{#if response.content_schema_definition_type === 'simple'}
					<div>
						<label class="block text-xs text-text-label mb-1" for="schemaType-{index}">Schema Type</label>
						<select
							id="schemaType-{index}"
							bind:value={response.content_schema_simple_type}
							class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
						>
							{#each availableTypes as typeOpt (typeOpt)}
								<option value={typeOpt}>{typeOpt}</option>
							{/each}
						</select>
					</div>
				{/if}

				{#if response.content_schema_definition_type === 'reference'}
					<div>
						<label class="block text-xs text-text-label mb-1" for="refPath-{index}">Model Reference</label>
						<select
							id="refPath-{index}"
							bind:value={response.content_schema_ref_path}
							class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
						>
							<option value={undefined}>Select Model...</option>
							{#each existingModelNames as name (name)}
								<option value="#/components/schemas/{name}">{name}</option>
							{/each}
						</select>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
