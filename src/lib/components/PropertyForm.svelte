<script lang="ts">
	import type { PropertySchemaForForm } from '$lib/schemaDefinitions';
	import type { ModelProperty } from '$lib/types';
	import { availableFormats, availableTypes } from '$lib/types';

	let {
		property,
		index,
		existingModelNames,
		onRemove // Added prop
	}: {
		property: Partial<ModelProperty> & { schema: PropertySchemaForForm };
		index: number;
		existingModelNames: string[];
		onRemove: (index: number) => void;
	} = $props();

	function remove() {
		onRemove(index);
	}
</script>

<div class="mb-4 rounded-lg border border-white p-4 shadow">
	<div class="mb-2 flex items-center justify-between">
		<h4 class="font-semibold">Property {index + 1}</h4>
        {#if index > 0}
            <button
                type="button"
                onclick={remove}
                class="cursor-pointer rounded px-2 py-1 text-sm font-medium text-red-500 transition-colors duration-150 hover:bg-red-100 hover:text-red-700"
                >Remove</button
            >
        {/if}
	</div>

	<!-- Basic Property Info -->
	<div class="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<label for="propName-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Name</label>
			<input
				type="text"
				id="propName-{index}"
				bind:value={property.name}
				required
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			/>
		</div>
		<div>
			<label for="propType-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Type</label>
			<select
				id="propType-{index}"
				bind:value={property.schema.type}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			>
				{#each availableTypes as typeOpt}
					<option value={typeOpt} class="text-text bg-background">{typeOpt}</option>
				{/each}
			</select>
		</div>
		{#if property.schema.type === 'string' || property.schema.type === 'number' || property.schema.type === 'integer'}
			<div>
				<label for="propFormat-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Format (Optional)</label>
				<select
					id="propFormat-{index}"
					bind:value={property.schema.format}
					class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				>
					<option value={undefined} class="text-text bg-background">None</option>
					{#each availableFormats as formatOpt}
						<option value={formatOpt} class="text-text bg-background">{formatOpt}</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>

	<!-- General Schema Details -->
	<div class="mb-3">
		<label for="propDesc-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Property Description</label>
		<textarea
			id="propDesc-{index}"
			bind:value={property.schema.description}
			rows="2"
			class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block min-h-[40px] w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
		></textarea>
	</div>
	<div class="mb-3 grid grid-cols-1 gap-4 md:grid-cols-3">
		<div>
			<label for="propExample-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Example (JSON String)</label
			>
			<input
				type="text"
				id="propExample-{index}"
				bind:value={property.schema.example_str}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				placeholder={'"Sample" or {"key":"value"}'}
			/>
		</div>
		<div>
			<label for="propDefault-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Default (JSON String)</label
			>
			<input
				type="text"
				id="propDefault-{index}"
				bind:value={property.schema.default_str}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				placeholder={'"DefaultVal" or 42'}
			/>
		</div>
		<div>
			<label for="propEnum-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Enum (comma-separated)</label>
			<input
				type="text"
				id="propEnum-{index}"
				bind:value={property.schema.enum_csv}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				placeholder="value1,value2,value3"
			/>
		</div>
	</div>

	<!-- Boolean Flags -->
	<div class="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
		<label class="inline-flex items-center">
			<input
				type="checkbox"
				bind:checked={property.schema.nullable}
				class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
			/>
			<span class="text-text-label ml-2 text-sm">Nullable</span>
		</label>
		<label class="inline-flex items-center">
			<input
				type="checkbox"
				bind:checked={property.schema.deprecated}
				class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
			/>
			<span class="text-text-label ml-2 text-sm">Deprecated</span>
		</label>
	</div>

	<!-- String Constraints -->
	{#if property.schema.type === 'string'}
		<div class="mt-2 border-t pt-2">
			<p class="text-text-label mb-1 text-sm font-medium">String Constraints:</p>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label for="minLength-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Min Length</label>
					<input
						type="number"
						id="minLength-{index}"
						bind:value={property.schema.minLength}
						class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
						min="0"
					/>
				</div>
				<div>
					<label for="maxLength-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Max Length</label>
					<input
						type="number"
						id="maxLength-{index}"
						bind:value={property.schema.maxLength}
						class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
						min="0"
					/>
				</div>
				<div>
					<label for="pattern-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Pattern (RegExp)</label>
					<input
						type="text"
						id="pattern-{index}"
						bind:value={property.schema.pattern}
						class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
						placeholder="^[a-zA-Z_]+$"
					/>
				</div>
			</div>
		</div>
	{/if}

	<!-- Number/Integer Constraints -->
	{#if property.schema.type === 'number' || property.schema.type === 'integer'}
		<div class="mt-2 border-t pt-2">
			<p class="text-text-label mb-1 text-sm font-medium">Numeric Constraints:</p>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label for="minimum-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Minimum</label>
					<input
						type="number"
						id="minimum-{index}"
						bind:value={property.schema.minimum}
						class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
					/>
				</div>
				<div>
					<label for="maximum-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Maximum</label>
					<input
						type="number"
						id="maximum-{index}"
						bind:value={property.schema.maximum}
						class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
					/>
				</div>
			</div>
		</div>
	{/if}

	<!-- Fields for Array type -->
	{#if property.schema.type === 'array'}
		<div class="col-span-2 mt-2 border-t pt-2">
			<p class="text-text-label mb-1 text-sm font-medium">Array Item Definition:</p>
			<div class="mb-2 flex items-center space-x-4">
				<label class="inline-flex items-center">
					<input
						type="radio"
						name="items_definition_type-{index}"
						value="simple"
						bind:group={property.schema.items_definition_type}
						class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded-full border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
					/>
					<span class="ml-2 text-sm">Simple Type</span>
				</label>
				<label class="inline-flex items-center">
					<input
						type="radio"
						name="items_definition_type-{index}"
						value="reference"
						bind:group={property.schema.items_definition_type}
						class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded-full border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
					/>
					<span class="ml-2 text-sm">Reference ($ref)</span>
				</label>
			</div>

			{#if property.schema.items_definition_type === 'simple'}
				<div>
					<label for="itemType-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Item Type</label>
					<select
						id="itemType-{index}"
						bind:value={property.schema.items_simple_type}
						class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
					>
						<option value={undefined} class="text-text bg-background">Select type...</option>
						{#each availableTypes.filter((t) => t !== 'array' && t !== 'object') as typeOpt}
							<option value={typeOpt} class="text-text bg-background">{typeOpt}</option>
						{/each}
					</select>
				</div>
			{/if}
			{#if property.schema.items_definition_type === 'reference'}
				<div>
					<label for="itemRef-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Item Reference</label>
					<select
						id="itemRef-{index}"
						bind:value={property.schema.items_ref_path}
						class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
					>
						<option value={undefined} class="text-text bg-background">Select model...</option>
						{#each existingModelNames as existingModel}
							<option value={`#/components/schemas/${existingModel}`} class="text-text bg-background"
								>{existingModel}</option
							>
						{/each}
					</select>
				</div>
			{/if}
		</div>
		<div class="mt-1 grid grid-cols-1 gap-4 md:grid-cols-3">
			<div>
				<label for="minItems-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Min Items</label>
				<input
					type="number"
					id="minItems-{index}"
					bind:value={property.schema.minItems}
					class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
					min="0"
				/>
			</div>
			<div>
				<label for="maxItems-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Max Items</label>
				<input
					type="number"
					id="maxItems-{index}"
					bind:value={property.schema.maxItems}
					class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
					min="0"
				/>
			</div>
			<div class="flex items-end">
				<label class="inline-flex items-center">
					<input
						type="checkbox"
						bind:checked={property.schema.uniqueItems}
						class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
					/>
					<span class="text-text-label ml-2 text-sm">Unique Items</span>
				</label>
			</div>
		</div>
	{/if}

	<!-- Fields for Object type -->
	{#if property.schema.type === 'object'}
		<div class="col-span-2 mt-2 border-t pt-2">
			<p class="text-text-label mb-1 text-sm font-medium">Object Definition Type:</p>
			<div class="mb-2 flex items-center space-x-4">
				<label class="inline-flex items-center">
					<input
						type="radio"
						name="object_definition_type-{index}"
						value="inline"
						bind:group={property.schema.object_definition_type}
						class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded-full border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
					/>
					<span class="ml-2 text-sm">Inline Properties</span>
				</label>
				<label class="inline-flex items-center">
					<input
						type="radio"
						name="object_definition_type-{index}"
						value="reference"
						bind:group={property.schema.object_definition_type}
						class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded-full border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
					/>
					<span class="ml-2 text-sm">Reference ($ref)</span>
				</label>
			</div>

			{#if property.schema.object_definition_type === 'inline'}
				<div>
					<label for="objPropsJson-{index}" class="text-text-label mb-0.5 block text-sm font-medium"
						>Properties (JSON format)</label
					>
					<textarea
						id="objPropsJson-{index}"
						bind:value={property.schema.object_properties_json}
						rows="3"
						class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block min-h-[40px] w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
						placeholder={'{"key1": {"type": "string"}, "key2": {"type": "integer"}}'}
					></textarea>
				</div>
				<div class="mt-1 grid grid-cols-1 gap-4 md:grid-cols-3">
					<div class="md:col-span-1">
						<label for="objRequired-{index}" class="text-text-label mb-0.5 block text-sm font-medium"
							>Required Properties (CSV)</label
						>
						<input
							type="text"
							id="objRequired-{index}"
							bind:value={property.schema.object_required_csv}
							class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
							placeholder="key1,key2"
						/>
					</div>
					<div>
						<label for="minProps-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Min Properties</label>
						<input
							type="number"
							id="minProps-{index}"
							bind:value={property.schema.minProperties}
							class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
							min="0"
						/>
					</div>
					<div>
						<label for="maxProps-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Max Properties</label>
						<input
							type="number"
							id="maxProps-{index}"
							bind:value={property.schema.maxProperties}
							class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
							min="0"
						/>
					</div>
				</div>
			{/if}
			{#if property.schema.object_definition_type === 'reference'}
				<div>
					<label for="objectRef-{index}" class="text-text-label mb-0.5 block text-sm font-medium">Schema Reference</label>
					<select
						id="objectRef-{index}"
						bind:value={property.schema.object_ref_path}
						class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
					>
						<option value={undefined} class="text-text bg-background">Select model to reference...</option>
						{#each existingModelNames as existingModel}
							<option value={`#/components/schemas/${existingModel}`} class="text-text bg-background"
								>{existingModel}</option
							>
						{/each}
					</select>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Property Required Checkbox -->
	<div class="mt-3 border-t pt-3">
		<label class="inline-flex items-center">
			<input
				type="checkbox"
				bind:checked={property.required}
				class="text-accent focus:border-accent focus:ring-accent focus:ring-opacity-50 h-4 w-4 rounded border-gray-300 shadow-sm focus:ring focus:ring-offset-0"
			/>
			<span class="text-text-label ml-2 text-sm">This property is Required in the model</span>
		</label>
	</div>
</div>

<style>
	input[type='number'].appearance-textfield::-webkit-outer-spin-button,
	input[type='number'].appearance-textfield::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
