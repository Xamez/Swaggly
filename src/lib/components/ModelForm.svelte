<script lang="ts">
	import { addModel, models, updateModel } from '$lib/dataStore';
	import { addNotification } from '$lib/notificationStore';
	import { initialPropertySchema, type PropertySchemaForForm } from '$lib/schemaDefinitions';
	import { transformPropertyForPayload, transformSchemaToForm } from '$lib/schemaUtils';
	import type { Model, ModelProperty } from '$lib/types';
	import { AlertTriangle } from '@lucide/svelte';
	import PropertyForm from './PropertyForm.svelte';

	let {
		modelToEdit = undefined,
		onSave,
		onDelete
	}: { modelToEdit?: Model; onSave: (model: Model) => void; onDelete?: () => void } = $props();

	let modelName = $state(modelToEdit?.name || '');
	let modelDescription = $state(modelToEdit?.description || '');

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
			modelName = '';
			modelDescription = '';
			properties = [{ name: '', schema: { ...initialPropertySchema, type: 'string' } }];
		}
	});

	let existingModelNames = $derived($models.map((m) => m.name));

	let validationErrors = $derived.by(() => {
		const errors: string[] = [];
		const trimmedModelName = modelName.trim();
		
		if (!trimmedModelName) {
			errors.push('Model name cannot be empty.');
		}

		if (!modelToEdit && existingModelNames.includes(trimmedModelName)) {
			errors.push(`A model with the name "${trimmedModelName}" already exists.`);
		}

		const propertyNames = new Set();
		for (let i = 0; i < properties.length; i++) {
			const property = properties[i];
			const trimmedPropertyName = property.name?.trim() || '';
			
			if (!trimmedPropertyName) {
				errors.push(`Property at position ${i + 1} cannot have an empty name.`);
				continue;
			}
			
			if (propertyNames.has(trimmedPropertyName)) {
				errors.push(`Duplicate property name "${trimmedPropertyName}" found.`);
			} else {
				propertyNames.add(trimmedPropertyName);
			}
		}

		return errors;
	});

	let hasValidationErrors = $derived(validationErrors.length > 0);

	function addProperty() {
		properties.push({ name: '', schema: { ...initialPropertySchema, type: 'string' } });
	}

	function removeProperty(index: number) {
		properties.splice(index, 1);
	}

	function handleSubmit() {
		if (hasValidationErrors) {
			return;
		}

		const trimmedModelName = modelName.trim();
		const validProperties = properties.map(property => ({
			...property,
			name: property.name?.trim() || ''
		}));

		const modelDataPayload: Model = {
			name: trimmedModelName,
			description: modelDescription,
			properties: validProperties.map(transformPropertyForPayload)
		};

		if (modelToEdit) {
			const updatedModelData: Model = { ...modelDataPayload };
			updateModel(modelToEdit.name, updatedModelData);
			onSave(updatedModelData);
		} else {
			const result = addModel(modelDataPayload);
			if (result.success && result.model) {
				onSave(result.model);
				modelName = '';
				modelDescription = '';
				properties = [{ name: '', schema: { ...initialPropertySchema, type: 'string' } }];
			} else {
				addNotification(result.message || 'Failed to create model', 'error');
			}
		}
	}
</script>

<div class="bg-background text-text rounded-lg p-4">
	<h2 class="mb-4 text-center text-xl font-semibold">{modelToEdit ? 'Edit Model: ' + modelToEdit.name : 'Create New Model'}</h2>
	<form onsubmit={handleSubmit}>
		<div class="mb-4">
			<label for="modelName" class="mb-0.5 block text-sm">Model Name</label>
			<input
				type="text"
				id="modelName"
				bind:value={modelName}
				required
				class="mt-1 block w-full px-3 py-2 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>
		<div class="mb-4">
			<label for="modelDescription" class=" mb-0.5 block text-sm">Model Description</label>
			<textarea
				id="modelDescription"
				bind:value={modelDescription}
				rows="3"
				class="mt-1 block min-h-[40px] w-full px-3 py-2 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			></textarea>
		</div>

		<div class="flex items-center justify-between mb-3">
			<h3 class="text-text-heading text-base">Properties</h3>
			<button
				type="button"
				onclick={addProperty}
				class="px-3 py-1 text-xs bg-accent text-white rounded-md hover:bg-accent-dark transition-colors duration-150 cursor-pointer">+ Add Property</button
			>
		</div>
		<div class="space-y-1">
			{#each properties as property, index (index)}
				<PropertyForm {property} {index} {existingModelNames} onRemove={removeProperty} />
			{/each}
		</div>

		{#if hasValidationErrors}
			<div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
				<div class="flex items-start gap-3">
					<AlertTriangle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
					<div>
						<h4 class="text-sm font-medium text-red-800 mb-2">Please fix the following issues:</h4>
						<ul class="text-sm text-red-700 space-y-1">
							{#each validationErrors as error}
								<li>• {error}</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		{/if}

		<div class="mt-6 flex justify-end gap-x-4">
			{#if modelToEdit}
				<button
					type="button"
					onclick={onDelete}
					class="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer rounded-md px-6 py-2 transition-colors duration-150 focus:outline-none"
				>
					Delete
				</button>
			{/if}
			<button
				type="submit"
				disabled={hasValidationErrors}
				class="bg-accent hover:bg-secondary cursor-pointer rounded-md px-6 py-2 text-white transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent"
			>
				{modelToEdit ? 'Save Changes' : 'Create Model'}
			</button>
		</div>
	</form>
</div>
