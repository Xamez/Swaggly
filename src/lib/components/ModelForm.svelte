<script lang="ts">
	import { addModel, models, updateModel } from '$lib/dataStore';
	import { initialPropertySchema, type PropertySchemaForForm } from '$lib/schemaDefinitions';
	import { transformPropertyForPayload, transformSchemaToForm } from '$lib/schemaUtils';
	import type { Model, ModelProperty } from '$lib/types';
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
			// Reset for 'create' mode
			modelName = '';
			modelDescription = '';
			properties = [{ name: '', schema: { ...initialPropertySchema, type: 'string' } }];
		}
	});

	let existingModelNames = $derived($models.map((m) => m.name));

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
			properties: properties.map(transformPropertyForPayload)
		};

		if (modelToEdit) {
			const updatedModelData: Model = { ...modelDataPayload, name: modelName };
			updateModel(modelToEdit.name, updatedModelData);
			onSave(updatedModelData);
		} else {
			const newModel = addModel(modelDataPayload);
			onSave(newModel);
			modelName = '';
			modelDescription = '';
			properties = [{ name: '', schema: { ...initialPropertySchema, type: 'string' } }];
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
				class="bg-accent hover:bg-secondary cursor-pointer rounded-md px-6 py-2 text-white transition-colors duration-150 focus:outline-none"
			>
				{modelToEdit ? 'Save Changes' : 'Create Model'}
			</button>
		</div>
	</form>
</div>
