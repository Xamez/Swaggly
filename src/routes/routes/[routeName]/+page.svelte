<script lang="ts">
	import RouteForm from '$lib/components/RouteForm.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { deleteRoute, routes } from '$lib/dataStore';
	import type { Route } from '$lib/types';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import { addNotification } from '$lib/notificationStore';

	let routeName = $derived(decodeURIComponent(page.params.routeName));
	let routeToEdit = $derived($routes.find((r) => r.name.trim() === routeName.trim()));
	let initialLoadDone = $state(false);
	let showDeleteConfirmation = $state(false);

	$effect(() => {
		if (routeName) {
			initialLoadDone = true;
		}
	});

	function handleRouteSaved(savedRoute: Route) {
		addNotification('Route saved successfully.', 'success');
		goto(`/routes/${encodeURIComponent(savedRoute.name)}`);
	}

	function handleRouteDelete() {
		if (!routeToEdit) return;
		showDeleteConfirmation = true;
	}

	function confirmDelete() {
		if (!routeToEdit) return;
		deleteRoute(routeToEdit.name);
		addNotification('Route deleted successfully.', 'success');
		goto('/routes/create');
	}

	function cancelDelete() {
		showDeleteConfirmation = false;
	}
</script>

<div class="text-text mx-auto p-4">
	{#if routeToEdit}
		<RouteForm {routeToEdit} onSave={handleRouteSaved} onDelete={handleRouteDelete} />
	{:else if routeName && !initialLoadDone}
		<p>Loading route data...</p>
	{:else}
		<p>Route not found or does not exist.</p>
	{/if}
</div>

<ConfirmationModal
	bind:show={showDeleteConfirmation}
	title="Confirm Deletion"
	message={`Are you sure you want to delete route "${routeToEdit?.name}"?`}
	onConfirm={confirmDelete}
	onCancel={cancelDelete}
/>
