<script lang="ts">
	import ModelForm from '$lib/components/ModelForm.svelte';
	import { goto } from '$app/navigation';
	import type { Model } from '$lib/types';

	function handleModelCreated(model: Model) {
		// Changed event type to Model directly
		// const newModel = event.detail; // No longer needed with Svelte 5 props
		// Optionally, navigate to the newly created model's detail page or model list
		// For now, let's navigate to a placeholder or back to home.
		// goto(`/models/${model.id}`); // If you have a model detail page
		goto('/'); // Or back to home / dashboard
		// Or show a success message
	}
</script>

<div class="mx-auto p-4">
	<ModelForm onSave={handleModelCreated} />
	<!-- Pass the handler directly -->
</div>

<style>
</style>
