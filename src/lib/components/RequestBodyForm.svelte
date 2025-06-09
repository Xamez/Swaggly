<script lang="ts">
	import type { RequestBodySchemaForForm } from '$lib/schemaDefinitions';
	import { availableMediaTypes, availableTypes } from '$lib/types';

	let { requestBody = $bindable(), existingModelNames } = $props<{
		requestBody: RequestBodySchemaForForm;
		existingModelNames: string[];
	}>();
</script>

<div class="mb-4 rounded-lg border border-white p-4 shadow">
	<h4 class="mb-2 font-semibold">Request Body</h4>

	<div class="mb-3">
		<label for="reqBodyDesc" class="text-text-label mb-0.5 block text-sm font-medium">Description</label>
		<textarea
			id="reqBodyDesc"
			bind:value={requestBody.description}
			rows="2"
			class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block min-h-[40px] w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
		></textarea>
	</div>

	<div class="mb-4">
		<label class="inline-flex items-center">
			<input
				type="checkbox"
				bind:checked={requestBody.required}
				class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
			/>
			<span class="text-text-label ml-2 text-sm">Required</span>
		</label>
	</div>

	<div class="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-1">
		<div>
			<label for="reqBodyMediaType" class="text-text-label mb-0.5 block text-sm font-medium">Content Media Type</label>
			<select
				id="reqBodyMediaType"
				bind:value={requestBody.content_media_type}
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
						name="content_schema_definition_type"
						value="simple"
						bind:group={requestBody.content_schema_definition_type}
						class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded-full border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
					/>
					<span class="ml-2 text-sm">Simple Type</span>
				</label>
				<label class="inline-flex items-center">
					<input
						type="radio"
						name="content_schema_definition_type"
						value="reference"
						bind:group={requestBody.content_schema_definition_type}
						class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded-full border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
					/>
					<span class="ml-2 text-sm">Reference ($ref)</span>
				</label>
			</div>
			{#if requestBody.content_schema_definition_type === 'simple'}
				<div>
					<label for="reqBodySchemaType" class="text-text-label mb-0.5 block text-sm font-medium">Schema Type</label>
					<select
						id="reqBodySchemaType"
						bind:value={requestBody.content_schema_simple_type}
						class="border-border focus:ring-accent focus:border-accent bg-background text-text mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
					>
						{#each availableTypes as typeOpt (typeOpt)}
							<option value={typeOpt}>{typeOpt}</option>
						{/each}
					</select>
				</div>
			{/if}
			{#if requestBody.content_schema_definition_type === 'reference'}
				<div>
					<label for="reqBodyRefPath" class="text-text-label mb-0.5 block text-sm font-medium">Model Reference</label>
					<select
						id="reqBodyRefPath"
						bind:value={requestBody.content_schema_ref_path}
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
</div>
