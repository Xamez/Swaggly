<script lang="ts">
	import type { PropertySchemaForForm } from '$lib/schemaDefinitions';
	import type { ModelProperty } from '$lib/types';
	import { availableFormats, availableTypes } from '$lib/types';
	import ArrayItemsForm from './ArrayItemsForm.svelte';
	import NumericConstraintsForm from './NumericConstraintsForm.svelte';
	import StringConstraintsForm from './StringConstraintsForm.svelte';
	import { ChevronDown, X } from '@lucide/svelte';

	let { property, index, existingModelNames, onRemove } = $props<{
		property: Partial<ModelProperty> & { schema: PropertySchemaForForm };
		index: number;
		existingModelNames: string[];
		onRemove: (index: number) => void;
	}>();

	let isExpanded = $state(false);

	function remove() {
		onRemove(index);
	}
	
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
			aria-label="Toggle property details"
		>
			<ChevronDown class="w-3.5 h-3.5 transition-transform duration-200 stroke-2 text-text-label {isExpanded ? 'rotate-180' : ''}" />
		</button>

		<div class="flex-1 min-w-0">
			<input
				type="text"
				bind:value={property.name}
				required
				placeholder="Property name"
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>

		<div class="w-24">
			<select
				bind:value={property.schema.type}
				class="w-full px-2 py-1 text-xs border border-gray-600 rounded bg-background focus:border-accent"
			>
				{#each availableTypes as typeOpt (typeOpt)}
					<option value={typeOpt}>{typeOpt}</option>
				{/each}
			</select>
		</div>

		{#if property.schema.type === 'string' || property.schema.type === 'number' || property.schema.type === 'integer'}
			<div class="w-20">
				<select
					bind:value={property.schema.format}
					class="w-full px-2 py-1 text-xs border border-gray-600 rounded bg-background focus:border-accent"
				>
					<option value={undefined}>-</option>
					{#each availableFormats as formatOpt (formatOpt)}
						<option value={formatOpt}>{formatOpt}</option>
					{/each}
				</select>
			</div>
		{/if}

		<label class="flex items-center text-xs">
			<input
				type="checkbox"
				bind:checked={property.required}
				class="w-4 h-4 text-accent border-gray-600 rounded"
			/>
			<span class="ml-1.5 text-text-label">Required</span>
		</label>

		<label class="flex items-center text-xs">
			<input
				type="checkbox"
				bind:checked={property.schema.nullable}
				class="w-4 h-4 text-accent border-gray-600 rounded"
			/>
			<span class="ml-1.5 text-text-label">Nullable</span>
		</label>

		{#if index > 0}
			<button
				type="button"
				onclick={remove}
				class="flex-shrink-0 w-6 h-6 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
				aria-label="Remove property"
			>
				<X class="w-3.5 h-3.5 stroke-2" />
			</button>
		{:else}
			<div class="flex-shrink-0 w-6 h-6"></div>
		{/if}
	</div>

	{#if isExpanded}
		<div class="mt-4 pt-4 border-t border-gray-200 space-y-4">
			<div>
				<label class="block text-xs font-medium text-text-label mb-1" for="propDesc-{index}">Description</label>
				<textarea
					id="propDesc-{index}"
					bind:value={property.schema.description}
					rows="2"
					placeholder="Property description..."
					class="w-full px-3 py-2 text-sm border border-gray-600 rounded bg-background focus:border-accent resize-none"
				></textarea>
			</div>

			<div class="grid grid-cols-3 gap-3">
				<div>
					<label class="block text-xs font-medium text-text-label mb-1" for="propExample-{index}">Example</label>
					<input
						id="propExample-{index}"
						type="text"
						bind:value={property.schema.example_str}
						placeholder='"Sample"'
						class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
					/>
				</div>
				<div>
					<label class="block text-xs font-medium text-text-label mb-1" for="propDefault-{index}">Default</label>
					<input
						id="propDefault-{index}"
						type="text"
						bind:value={property.schema.default_str}
						placeholder='"Default"'
						class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
					/>
				</div>
				<div>
					<label class="block text-xs font-medium text-text-label mb-1" for="propEnum-{index}">Enum (CSV)</label>
					<input
						id="propEnum-{index}"
						type="text"
						bind:value={property.schema.enum_csv}
						placeholder="val1,val2"
						class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
					/>
				</div>
			</div>

			<div class="flex flex-wrap gap-4">
				<label class="inline-flex items-center">
					<input
						type="checkbox"
						bind:checked={property.schema.deprecated}
						class="w-4 h-4 text-accent border-gray-600 rounded"
					/>
					<span class="ml-2 text-xs text-text-label">Deprecated</span>
				</label>
				<label class="inline-flex items-center">
					<input
						type="checkbox"
						bind:checked={property.schema.readOnly}
						class="w-4 h-4 text-accent border-gray-600 rounded"
					/>
					<span class="ml-2 text-xs text-text-label">Read Only</span>
				</label>
				<label class="inline-flex items-center">
					<input
						type="checkbox"
						bind:checked={property.schema.writeOnly}
						class="w-4 h-4 text-accent border-gray-600 rounded"
					/>
					<span class="ml-2 text-xs text-text-label">Write Only</span>
				</label>
			</div>

			{#if property.schema.type === 'string'}
				<StringConstraintsForm
					bind:minLength={property.schema.minLength}
					bind:maxLength={property.schema.maxLength}
					bind:pattern={property.schema.pattern}
				/>
			{/if}

			{#if property.schema.type === 'number' || property.schema.type === 'integer'}
				<NumericConstraintsForm bind:minimum={property.schema.minimum} bind:maximum={property.schema.maximum} />
			{/if}

			{#if property.schema.type === 'array'}
				<ArrayItemsForm
					bind:items_definition_type={property.schema.items_definition_type}
					bind:items_simple_type={property.schema.items_simple_type}
					bind:items_ref_path={property.schema.items_ref_path}
					bind:minItems={property.schema.minItems}
					bind:maxItems={property.schema.maxItems}
					bind:uniqueItems={property.schema.uniqueItems}
					{existingModelNames}
				/>
			{/if}

			{#if property.schema.type === 'object'}
				<div class="border-t border-white pt-4">
					<p class="text-xs font-medium text-text-label mb-2">Object Definition Type:</p>
					<div class="mb-3 flex items-center space-x-4">
						<label class="inline-flex items-center">
							<input
								type="radio"
								name="object_definition_type-{index}"
								value="inline"
								bind:group={property.schema.object_definition_type}
								class="w-4 h-4 text-accent border-border focus:ring-accent focus:ring-1"
							/>
							<span class="ml-2 text-xs text-text">Inline Properties</span>
						</label>
						<label class="inline-flex items-center">
							<input
								type="radio"
								name="object_definition_type-{index}"
								value="reference"
								bind:group={property.schema.object_definition_type}
								class="w-4 h-4 text-accent border-border focus:ring-accent focus:ring-1"
							/>
							<span class="ml-2 text-xs text-text">Reference ($ref)</span>
						</label>
					</div>

					{#if property.schema.object_definition_type === 'inline'}
						<div class="space-y-3">
							<div>
								<label class="block text-xs font-medium text-text-label mb-1" for="objPropsJson-{index}">Properties (JSON format)</label>
								<textarea
									id="objPropsJson-{index}"
									bind:value={property.schema.object_properties_json}
									rows="3"
									placeholder={`{"key1": {"type": "string"}, "key2": {"type": "integer"}}`}
									class="w-full px-3 py-2 text-sm border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder rounded-md border focus:ring-1 focus:outline-none resize-none"
								></textarea>
							</div>
							<div class="grid grid-cols-3 gap-3">
								<div>
									<label class="block text-xs font-medium text-text-label mb-1" for="objRequired-{index}">Required Properties</label>
									<input
										id="objRequired-{index}"
										type="text"
										bind:value={property.schema.object_required_csv}
										placeholder="key1,key2"
										class="w-full px-2 py-1 text-sm border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder rounded border focus:ring-1 focus:outline-none"
									/>
								</div>
								<div>
									<label class="block text-xs font-medium text-text-label mb-1" for="minProps-{index}">Min Properties</label>
									<input
										id="minProps-{index}"
										type="number"
										bind:value={property.schema.minProperties}
										min="0"
										class="w-full px-2 py-1 text-sm border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder rounded border focus:ring-1 focus:outline-none"
									/>
								</div>
								<div>
									<label class="block text-xs font-medium text-text-label mb-1" for="maxProps-{index}">Max Properties</label>
									<input
										id="maxProps-{index}"
										type="number"
										bind:value={property.schema.maxProperties}
										min="0"
										class="w-full px-2 py-1 text-sm border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder rounded border focus:ring-1 focus:outline-none"
									/>
								</div>
							</div>
						</div>
					{/if}

					{#if property.schema.object_definition_type === 'reference'}
						<div>
							<label class="block text-xs font-medium text-text-label mb-1" for="objectRef-{index}">Schema Reference</label>
							<select
								id="objectRef-{index}"
								bind:value={property.schema.object_ref_path}
								class="w-full px-3 py-2 text-sm border-border focus:ring-accent focus:border-accent bg-background text-text rounded-md border focus:ring-1 focus:outline-none"
							>
								<option value={undefined}>Select model to reference...</option>
								{#each existingModelNames as existingModel (existingModel)}
									<option value={`#/components/schemas/${existingModel}`}>{existingModel}</option>
								{/each}
							</select>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
