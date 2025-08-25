<script lang="ts">
	import type { RequestBodySchemaForForm } from '$lib/schemaDefinitions';
	import { availableMediaTypes, availableTypes } from '$lib/types';
	import { ChevronDown } from '@lucide/svelte';

	let { requestBody = $bindable(), existingModelNames } = $props<{
		requestBody: RequestBodySchemaForForm;
		existingModelNames: string[];
	}>();

	let isExpanded = $state(false);
	
	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

<div class="mb-4 rounded-lg border border-border bg-background p-3 shadow-sm">
	<div class="flex items-center gap-3">
		<button
			type="button"
			onclick={toggleExpanded}
			class="flex-shrink-0 w-6 h-6 rounded bg-background border border-gray-600 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
			title="Toggle details"
		>
			<ChevronDown class="w-3.5 h-3.5 transition-transform duration-200 stroke-2 text-text-label {isExpanded ? 'rotate-180' : ''}" />
		</button>

		<span class="font-medium text-sm text-gray-900">Request Body</span>

		<div class="w-32">
			<select
				bind:value={requestBody.content_media_type}
				class="w-full px-2 py-1 text-xs border border-gray-600 rounded bg-background focus:border-accent"
			>
				{#each availableMediaTypes as mediaType (mediaType)}
					<option value={mediaType}>{mediaType}</option>
				{/each}
			</select>
		</div>

		<div class="w-24">
			{#if requestBody.content_schema_definition_type === 'simple'}
				<select
					bind:value={requestBody.content_schema_simple_type}
					class="w-full px-2 py-1 text-xs border border-gray-600 rounded bg-background focus:border-accent"
				>
					{#each availableTypes as typeOpt (typeOpt)}
						<option value={typeOpt}>{typeOpt}</option>
					{/each}
				</select>
			{:else}
				<select
					bind:value={requestBody.content_schema_ref_path}
					class="w-full px-2 py-1 text-xs border border-gray-600 rounded bg-background focus:border-accent"
				>
					<option value={undefined}>Select...</option>
					{#each existingModelNames as name (name)}
						<option value="#/components/schemas/{name}">{name}</option>
					{/each}
				</select>
			{/if}
		</div>

		<label class="flex items-center text-xs">
			<input
				type="checkbox"
				bind:checked={requestBody.required}
				class="w-4 h-4 text-accent border-gray-600 rounded"
			/>
			<span class="ml-1.5 text-text-label">Required</span>
		</label>
	</div>

	{#if isExpanded}
		<div class="mt-4 pt-4 border-t border-white space-y-4">
			<div>
				<label for="request-body-description" class="block text-xs font-medium text-text-label mb-1">Description</label>
				<textarea
					id="request-body-description"
					bind:value={requestBody.description}
					rows="2"
					placeholder="Request body description..."
					class="w-full px-3 py-2 text-sm border border-gray-600 rounded bg-background focus:border-accent resize-none"
				></textarea>
			</div>

			<div class="space-y-3">
				<p class="text-xs font-medium text-text-label">Schema Definition Type</p>
				<div class="flex items-center space-x-4">
					<label class="inline-flex items-center">
						<input
							type="radio"
							name="content_schema_definition_type"
							value="simple"
							bind:group={requestBody.content_schema_definition_type}
							class="w-4 h-4 text-accent border-gray-600"
						/>
						<span class="ml-2 text-xs text-text">Simple Type</span>
					</label>
					<label class="inline-flex items-center">
						<input
							type="radio"
							name="content_schema_definition_type"
							value="reference"
							bind:group={requestBody.content_schema_definition_type}
							class="w-4 h-4 text-accent border-gray-600"
						/>
						<span class="ml-2 text-xs text-text">Reference ($ref)</span>
					</label>
				</div>

				{#if requestBody.content_schema_definition_type === 'simple'}
					<div>
						<label for="request-body-schema-type" class="block text-xs text-text-label mb-1">Schema Type</label>
						<select
							id="request-body-schema-type"
							bind:value={requestBody.content_schema_simple_type}
							class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
						>
							{#each availableTypes as typeOpt (typeOpt)}
								<option value={typeOpt}>{typeOpt}</option>
							{/each}
						</select>
					</div>
				{/if}

				{#if requestBody.content_schema_definition_type === 'reference'}
					<div>
						<label for="request-body-model-ref" class="block text-xs text-text-label mb-1">Model Reference</label>
						<select
							id="request-body-model-ref"
							bind:value={requestBody.content_schema_ref_path}
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
