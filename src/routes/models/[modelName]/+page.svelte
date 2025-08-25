<script lang="ts">
	import ModelForm from '$lib/components/ModelForm.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { deleteModel, models } from '$lib/dataStore';
	import type { Model } from '$lib/types';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import { addNotification } from '$lib/notificationStore';

	let modelName = $derived(page.params.modelName);
	let modelToEdit = $derived($models.find((m) => m.name === modelName));
	let initialLoadDone = $state(false);
	let showDeleteConfirmation = $state(false);

	$effect(() => {
		if (modelName) {
			initialLoadDone = true;
		}
	});

	function handleModelSaved(savedModel: Model) {
		addNotification('Model saved successfully.', 'success');
		goto(`/models/${encodeURIComponent(savedModel.name)}`);
	}

	function handleModelDelete() {
		if (!modelToEdit) return;
		showDeleteConfirmation = true;
	}

	function confirmDelete() {
		if (!modelToEdit) return;
		const result = deleteModel(modelToEdit.name);
		if (result.success) {
			addNotification('Model deleted successfully.', 'success');
			goto('/models/create');
		} else {
			addNotification(`Failed to delete model: ${result.message}`, 'error');
		}
	}

	function cancelDelete() {
		showDeleteConfirmation = false;
	}
</script>

<div class="text-text mx-auto p-4">
	{#if modelToEdit}
		<ModelForm {modelToEdit} onSave={handleModelSaved} onDelete={handleModelDelete} />
	{:else if modelName && !initialLoadDone}
		<p>Loading model data...</p>
	{:else}
		<p>Model not found or does not exist.</p>
	{/if}
</div>

<ConfirmationModal
	bind:show={showDeleteConfirmation}
	title="Confirm Deletion"
	message={`Are you sure you want to delete the model "${modelToEdit?.name}"?`}
	onConfirm={confirmDelete}
	onCancel={cancelDelete}
/>
