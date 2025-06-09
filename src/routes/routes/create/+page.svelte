<script lang="ts">
	import RouteForm from '$lib/components/RouteForm.svelte';
	import { goto } from '$app/navigation';
	import type { Route } from '$lib/types';
	import { addNotification } from '$lib/notificationStore';

	function handleRouteSaved(savedRoute: Route) {
		addNotification('Route created successfully.', 'success');
		goto(`/routes/${encodeURIComponent(savedRoute.name)}`);
	}
</script>

<div class="mx-auto p-4">
	<RouteForm onSave={handleRouteSaved} />
</div>
