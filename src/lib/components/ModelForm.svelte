<script lang="ts">
	import { addModel, getModels, updateModel } from '$lib/dataStore';
	import { initialPropertySchema, type PropertySchemaForForm } from '$lib/schemaDefinitions';
	import { transformPropertyForPayload, transformSchemaToForm } from '$lib/schemaUtils';
	import type { Model, ModelProperty } from '$lib/types';
	import PropertyForm from './PropertyForm.svelte';

	let { modelToEdit = undefined, onSave }: { modelToEdit?: Model; onSave: (model: Model) => void } = $props();

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

<div class="bg-background text-text rounded-lg p-4 shadow">
	<h2 class="text-text-heading mb-4 text-xl font-semibold">{modelToEdit ? 'Edit Model: ' + modelToEdit.name : 'Create New Model'}</h2>
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
		{#each properties as property, index (index)}
			<PropertyForm {property} {index} {existingModelNames} onRemove={removeProperty} />
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
