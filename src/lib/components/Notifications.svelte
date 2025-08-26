<script lang="ts">
	import { notifications, removeNotification } from '$lib/notificationStore';
	import { fly } from 'svelte/transition';
	import { X } from '@lucide/svelte';

	const typeClasses = {
		info: 'bg-blue-500',
		success: 'bg-green-500',
		warning: 'bg-yellow-500',
		error: 'bg-red-500'
	};
</script>

{#if $notifications.length > 0}
	<div class="fixed top-4 right-4 z-[1000] flex flex-col gap-2">
		{#each $notifications as notification (notification.id)}
			<div
				class="flex max-w-[400px] min-w-[250px] items-center justify-between rounded p-4 text-white {typeClasses[
					notification.type
				]}"
				in:fly={{ y: -20, duration: 300 }}
				out:fly={{ y: -20, duration: 300 }}
			>
				<p class="mr-4 max-h-[100px] overflow-y-auto">{notification.message}</p>
				<button
					on:click={() => removeNotification(notification.id)}
					title="Close notification"
					aria-label="Close notification"
					class="cursor-pointer border-none bg-transparent text-base text-white opacity-70 transition-opacity duration-200 hover:opacity-100"
				>
					<X size={16} />
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
</style>
