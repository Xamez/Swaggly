<script lang="ts">
	import { addModel, getModels, updateModel } from '$lib/dataStore';
	import { initialPropertySchema, type PropertySchemaForForm } from '$lib/schemaDefinitions';
	import type { Model, ModelProperty, SchemaObject, SchemaOrReference } from '$lib/types';
	import { availableFormats, availableTypes } from '$lib/types';

	let { modelToEdit = undefined, onSave }: { modelToEdit?: Model; onSave: (model: Model) => void } = $props();

	let modelName = $state(modelToEdit?.name || '');
	let modelDescription = $state(modelToEdit?.description || '');

	function transformSchemaToForm(schema: SchemaOrReference): PropertySchemaForForm {
		const formSchema: PropertySchemaForForm = { ...initialPropertySchema };

		if ('$ref' in schema) {
			// It's a ReferenceObject
			// If the property schema is a direct reference, it's treated as an object reference
			formSchema.type = 'object'; // Set the type to 'object' for the form
			formSchema.object_definition_type = 'reference';
			formSchema.object_ref_path = schema.$ref;
			// Clear/reset other fields from initialPropertySchema that might conflict
			formSchema.format = undefined;
			formSchema.description = undefined; // Keep description if it's on the $ref itself? OpenAPI doesn't place it there.
			formSchema.example_str = undefined;
			formSchema.default_str = undefined;
			formSchema.enum_csv = undefined;
			formSchema.nullable = false;
			formSchema.deprecated = false;
			formSchema.minLength = undefined;
			formSchema.maxLength = undefined;
			formSchema.pattern = undefined;
			formSchema.minimum = undefined;
			formSchema.maximum = undefined;
			// Reset array specific fields
			formSchema.items_definition_type = 'simple';
			formSchema.items_simple_type = undefined;
			formSchema.items_ref_path = undefined;
			formSchema.minItems = undefined;
			formSchema.maxItems = undefined;
			formSchema.uniqueItems = false;
			// Reset inline object specific fields
			formSchema.object_properties_json = undefined;
			formSchema.object_required_csv = undefined;
			formSchema.minProperties = undefined;
			formSchema.maxProperties = undefined;
		} else {
			// It's a SchemaObject (inline definition)
			formSchema.type = schema.type || 'string'; // Default to string if type is missing
			formSchema.format = schema.format;
			formSchema.description = schema.description;
			formSchema.example_str = schema.example !== undefined ? JSON.stringify(schema.example) : undefined;
			formSchema.default_str = schema.default !== undefined ? JSON.stringify(schema.default) : undefined;
			formSchema.enum_csv = schema.enum?.join(',');
			formSchema.nullable = schema.nullable || false;
			formSchema.deprecated = schema.deprecated || false;

			if (schema.type === 'string') {
				formSchema.minLength = schema.minLength;
				formSchema.maxLength = schema.maxLength;
				formSchema.pattern = schema.pattern;
			} else if (schema.type === 'number' || schema.type === 'integer') {
				formSchema.minimum = schema.minimum;
				formSchema.maximum = schema.maximum;
			} else if (schema.type === 'array') {
				formSchema.minItems = schema.minItems;
				formSchema.maxItems = schema.maxItems;
				formSchema.uniqueItems = schema.uniqueItems || false;
				if (schema.items) {
					if ('$ref' in schema.items) {
						// Array items are a reference
						formSchema.items_definition_type = 'reference';
						formSchema.items_ref_path = schema.items.$ref;
						formSchema.items_simple_type = undefined; // Clear simple type
					} else {
						// Array items are an inline SchemaObject
						formSchema.items_definition_type = 'simple';
						formSchema.items_simple_type = schema.items.type;
						formSchema.items_ref_path = undefined; // Clear ref path
					}
				} else {
					// Default for array items if not specified in loaded data
					formSchema.items_definition_type = 'simple';
					formSchema.items_simple_type = 'string'; // Default item type to string
				}
			} else if (schema.type === 'object') {
				// This is for an inline object definition (not a $ref for the property itself)
				formSchema.object_definition_type = 'inline';
				formSchema.object_properties_json = schema.properties ? JSON.stringify(schema.properties, null, 2) : undefined;
				formSchema.object_required_csv = schema.required?.join(',');
				formSchema.minProperties = schema.minProperties;
				formSchema.maxProperties = schema.maxProperties;
				formSchema.object_ref_path = undefined; // Ensure no $ref path for inline object definition
			}
		}
		return formSchema;
	}

	let properties = $state<Array<Partial<ModelProperty> & { schema: PropertySchemaForForm }>>([]);

	$effect(() => {
		if (modelToEdit) {
			modelName = modelToEdit.name;
			modelDescription = modelToEdit.description || '';
			properties = modelToEdit.properties.map((p) => ({
				name: p.name,
				required: p.required || false,
				schema: transformSchemaToForm(p.schema)
			}));
		} else {
			// Reset for 'create' mode
			modelName = '';
			modelDescription = '';
			properties = [{ name: '', schema: { ...initialPropertySchema, type: 'string' } }];
		}
	});

	let existingModelNames = $derived(getModels().map((m) => m.name));

	function addProperty() {
		properties.push({ name: '', schema: { ...initialPropertySchema, type: 'string' } });
	}

	function removeProperty(index: number) {
		properties.splice(index, 1);
	}

	function handleSubmit() {
		const modelDataPayload: Model = {
			name: modelName,
			description: modelDescription,
			properties: properties.map((p) => {
				const propertyName = p.name!;
				const propertyRequired = p.required || false;
				let propertySchema: SchemaOrReference;

				if (p.schema.type === 'object' && p.schema.object_definition_type === 'reference' && p.schema.object_ref_path) {
					propertySchema = { $ref: p.schema.object_ref_path };
				} else {
					const inlineSchema: Partial<SchemaObject> = {
						type: p.schema.type
					};

					if (p.schema.format) inlineSchema.format = p.schema.format;
					if (p.schema.description) inlineSchema.description = p.schema.description;

					if (p.schema.example_str) {
						try {
							inlineSchema.example = JSON.parse(p.schema.example_str);
						} catch (e) {
							console.error('Invalid JSON for example:', p.schema.example_str, e);
						}
					}

					if (p.schema.default_str) {
						try {
							inlineSchema.default = JSON.parse(p.schema.default_str);
						} catch (e) {
							console.error('Invalid JSON for default:', p.schema.default_str, e);
						}
					}

					if (p.schema.enum_csv) {
						const enumValues = p.schema.enum_csv
							.split(',')
							.map((s) => s.trim())
							.filter((s) => s);
						if (enumValues.length > 0) {
							const allNumeric = enumValues.every((val) => !isNaN(Number(val)));
							if (allNumeric) {
								inlineSchema.enum = enumValues.map(Number);
							} else {
								inlineSchema.enum = enumValues;
							}
						}
					}

					if (p.schema.nullable) inlineSchema.nullable = true;
					if (p.schema.deprecated) inlineSchema.deprecated = true;

					if (p.schema.type === 'string') {
						if (p.schema.minLength !== null && p.schema.minLength !== undefined) inlineSchema.minLength = p.schema.minLength;
						if (p.schema.maxLength !== null && p.schema.maxLength !== undefined) inlineSchema.maxLength = p.schema.maxLength;
						if (p.schema.pattern) inlineSchema.pattern = p.schema.pattern;
					} else if (p.schema.type === 'number' || p.schema.type === 'integer') {
						if (p.schema.minimum !== null && p.schema.minimum !== undefined) inlineSchema.minimum = p.schema.minimum;
						if (p.schema.maximum !== null && p.schema.maximum !== undefined) inlineSchema.maximum = p.schema.maximum;
					} else if (p.schema.type === 'array') {
						if (p.schema.items_definition_type === 'simple' && p.schema.items_simple_type) {
							inlineSchema.items = { type: p.schema.items_simple_type };
						} else if (p.schema.items_definition_type === 'reference' && p.schema.items_ref_path) {
							inlineSchema.items = { $ref: p.schema.items_ref_path };
						}
						if (p.schema.minItems !== null && p.schema.minItems !== undefined) inlineSchema.minItems = p.schema.minItems;
						if (p.schema.maxItems !== null && p.schema.maxItems !== undefined) inlineSchema.maxItems = p.schema.maxItems;
						if (p.schema.uniqueItems) inlineSchema.uniqueItems = true;
					} else if (p.schema.type === 'object') {
						// This implies object_definition_type === 'inline'
						try {
							if (p.schema.object_properties_json) {
								inlineSchema.properties = JSON.parse(p.schema.object_properties_json);
							}
						} catch (e) {
							console.error('Invalid JSON for object properties:', p.schema.object_properties_json, e);
						}
						if (p.schema.object_required_csv) {
							const requiredProps = p.schema.object_required_csv
								.split(',')
								.map((s) => s.trim())
								.filter((s) => s);
							if (requiredProps.length > 0) inlineSchema.required = requiredProps;
						}
						if (p.schema.minProperties !== null && p.schema.minProperties !== undefined)
							inlineSchema.minProperties = p.schema.minProperties;
						if (p.schema.maxProperties !== null && p.schema.maxProperties !== undefined)
							inlineSchema.maxProperties = p.schema.maxProperties;
					}
					propertySchema = inlineSchema as SchemaObject;
				}

				return {
					name: propertyName,
					required: propertyRequired,
					schema: propertySchema
				};
			})
		};

		if (modelToEdit) {
			// Editing existing model
			const updatedModelData: Model = { ...modelDataPayload, name: modelName };
			updateModel(updatedModelData);
			onSave(updatedModelData);
		} else {
			// Creating new model
			const newModel = addModel(modelDataPayload);
			onSave(newModel);
			// Reset form only on creation
			modelName = '';
			modelDescription = '';
			properties = [{ name: '', schema: { ...initialPropertySchema, type: 'string' } }];
		}
	}
</script>

<div class="bg-background text-text rounded-lg p-4 shadow">
	<h2 class="text-text-heading mb-4 text-xl font-semibold">{modelToEdit ? 'Edit Model' : 'Create New Model'}</h2>
	<form onsubmit={handleSubmit}>
		<div class="mb-4">
			<label for="modelName" class="text-text-label mb-0.5 block text-sm font-medium">Model Name</label>
			<input
				type="text"
				id="modelName"
				bind:value={modelName}
				required
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			/>
		</div>
		<div class="mb-4">
			<label for="modelDescription" class="text-text-label mb-0.5 block text-sm font-medium">Model Description</label>
			<textarea
				id="modelDescription"
				bind:value={modelDescription}
				rows="3"
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block min-h-[40px] w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			></textarea>
		</div>

		<h3 class="text-text-heading mb-2 text-lg font-medium">Properties</h3>
		{#each properties as property, index}
			<div class="mb-4 rounded-lg border border-white p-4 shadow">
				<div class="mb-2 flex items-center justify-between">
					<h4 class="font-semibold">Property {index + 1}</h4>
					<button
						type="button"
						onclick={() => removeProperty(index)}
						class="cursor-pointer rounded px-2 py-1 text-sm font-medium text-red-500 transition-colors duration-150 hover:bg-red-100 hover:text-red-700"
						>Remove</button
					>
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
							placeholder={'e.g., "Sample" or {"key":"value"}'}
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
							placeholder={'e.g., "DefaultVal" or 42"'}
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
		{/each}
		<button
			type="button"
			onclick={addProperty}
			class="text-accent hover:text-accent-dark mb-4 cursor-pointer text-sm font-medium transition-colors duration-150"
			>+ Add Property</button
		>

		<div class="mt-6 flex justify-end">
			<button
				type="submit"
				class="bg-accent hover:bg-accent-dark focus:ring-accent-dark cursor-pointer rounded-md px-6 py-2 text-white transition-colors duration-150 focus:ring-2 focus:ring-offset-2 focus:outline-none"
			>
				{modelToEdit ? 'Save Changes' : 'Create Model'}
			</button>
		</div>
	</form>
</div>

<style>
	input[type='number'].appearance-textfield::-webkit-outer-spin-button,
	input[type='number'].appearance-textfield::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
