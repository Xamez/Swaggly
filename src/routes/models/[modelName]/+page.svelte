<script lang="ts">
	import ModelForm from '$lib/components/ModelForm.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getModels } from '$lib/dataStore';
	import type { Model } from '$lib/types';

	let modelName = $derived($page.params.modelName);
	let modelToEdit = $derived(getModels().find((m) => m.name === modelName));
	let initialLoadDone = $state(false);

	$effect(() => {
		if (modelName) {
			initialLoadDone = true;
		}
	});

	function handleModelSaved(savedModel: Model) {
		// The ModelForm now calls updateModel internally if it's an edit.
		// So, we just need to navigate.
		// If it was a new model, ModelForm calls addModel.
		// The onSave prop is consistent for both.
		goto(`/models/${savedModel.name}`);
		// Consider a toast notification for success
	}
</script>

<div class="text-text mx-auto p-4">
	{#if modelToEdit}
		<ModelForm {modelToEdit} onSave={handleModelSaved} />
	{:else if modelName && !initialLoadDone}
		<p>Loading model data...</p>
	{:else}
		<p>Model not found or does not exist.</p>
	{/if}
</div>

<style>
</style>
