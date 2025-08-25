<script lang="ts">
	let {
		show = $bindable(),
		onConfirm,
		onCancel,
		title = 'Are you sure?',
		message = 'Do you want to proceed?'
	}: {
		show: boolean;
		onConfirm: () => void;
		onCancel: () => void;
		title?: string;
		message?: string;
	} = $props();

	function handleConfirm() {
		onConfirm();
		show = false;
	}

	function handleCancel() {
		onCancel();
		show = false;
	}
</script>

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
		onclick={handleCancel}
		role="button"
		tabindex="0"
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="bg-background text-text rounded-lg p-6 shadow-xl" onclick={(e) => e.stopPropagation()}>
			<h2 class="mb-4 text-lg font-bold">{title}</h2>
			<p>{message}</p>
			<div class="mt-6 flex justify-end gap-x-4">
				<button
					onclick={handleCancel}
					class="bg-secondary hover:bg-secondary-dark rounded-md px-4 py-2 text-white transition-colors duration-150"
				>
					Cancel
				</button>
				<button
					onclick={handleConfirm}
					class="bg-danger hover:bg-danger-dark border border-danger hover:border-danger-dark rounded-md px-4 py-2 text-white transition-colors duration-150"
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}
