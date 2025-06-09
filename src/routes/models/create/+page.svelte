<script lang="ts">
	import { goto } from '$app/navigation';
	import ModelForm from '$lib/components/ModelForm.svelte';
	import { addNotification } from '$lib/notificationStore';

	function handleModelCreated() {
		addNotification('Model created successfully.', 'success');
		goto('/');
	}
</script>

<div class="mx-auto p-4">
	<ModelForm onSave={handleModelCreated} />
</div>
