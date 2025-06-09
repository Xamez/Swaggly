<script lang="ts">
	import type { ResponseSchemaForForm } from '$lib/schemaDefinitions';
	import { availableMediaTypes, availableTypes } from '$lib/types';

	let {
		response,
		index,
		onRemove,
		existingModelNames
	}: {
		response: ResponseSchemaForForm;
		index: number;
		onRemove: (index: number) => void;
		existingModelNames: string[];
	} = $props();
</script>

<div class="mb-4 rounded-lg border border-white p-4 shadow">
	<div class="mb-2 flex items-center justify-between">
		<h4 class="font-semibold">Response {index + 1}</h4>
		<button
			type="button"
			onclick={() => onRemove(index)}
			class="cursor-pointer rounded px-2 py-1 text-sm font-medium text-red-500 transition-colors duration-150 hover:bg-red-100 hover:text-red-700"
			>Remove</button
		>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<label for="statusCode-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Status Code</label>
			<input
				type="text"
				id="statusCode-{index}"
				bind:value={response.statusCode}
				required
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			/>
		</div>
		<div>
			<label for="description-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Description</label>
			<input
				type="text"
				id="description-{index}"
				bind:value={response.description}
				required
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			/>
		</div>
	</div>

	<div class="mt-4">
		<label class="inline-flex items-center">
			<input
				type="checkbox"
				bind:checked={response.has_content}
				class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
			/>
			<span class="text-text-label ml-2 text-sm">Has Content</span>
		</label>
	</div>

	{#if response.has_content}
		<div class="mt-2 grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-1">
			<div>
				<label for="mediaType-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Content Media Type</label>
				<select
					id="mediaType-{index}"
					bind:value={response.content_media_type}
					class="border-border focus:ring-accent focus:border-accent bg-background text-text mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				>
					{#each availableMediaTypes as mediaType (mediaType)}
						<option value={mediaType}>{mediaType}</option>
					{/each}
				</select>
			</div>
			<div class="col-span-2 mt-2 border-t pt-2">
				<p class="text-text-label mb-1 text-sm font-medium">Content Schema Definition:</p>
				<div class="mb-2 flex items-center space-x-4">
					<label class="inline-flex items-center">
						<input
							type="radio"
							name="content_schema_definition_type-{index}"
							value="simple"
							bind:group={response.content_schema_definition_type}
							class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded-full border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
						/>
						<span class="ml-2 text-sm">Simple Type</span>
					</label>
					<label class="inline-flex items-center">
						<input
							type="radio"
							name="content_schema_definition_type-{index}"
							value="reference"
							bind:group={response.content_schema_definition_type}
							class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded-full border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
						/>
						<span class="ml-2 text-sm">Reference ($ref)</span>
					</label>
				</div>
				{#if response.content_schema_definition_type === 'simple'}
					<div>
						<label for="schemaType-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Schema Type</label>
						<select
							id="schemaType-{index}"
							bind:value={response.content_schema_simple_type}
							class="border-border focus:ring-accent focus:border-accent bg-background text-text mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
						>
							{#each availableTypes as typeOpt (typeOpt)}
								<option value={typeOpt}>{typeOpt}</option>
							{/each}
						</select>
					</div>
				{/if}
				{#if response.content_schema_definition_type === 'reference'}
					<div>
						<label for="refPath-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Model Reference</label>
						<select
							id="refPath-{index}"
							bind:value={response.content_schema_ref_path}
							class="border-border focus:ring-accent focus:border-accent bg-background text-text mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
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
