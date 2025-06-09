<script lang="ts">
	let { minimum = $bindable(), maximum = $bindable() } = $props<{
		minimum: number | undefined;
		maximum: number | undefined;
	}>();
</script>

<div class="mt-2 border-t pt-2">
	<p class="text-text-label mb-1 text-sm font-medium">Numeric Constraints:</p>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<label for="minimum" class="text-text-label mb-0.5 block text-sm font-medium">Minimum</label>
			<input
				type="number"
				id="minimum"
				bind:value={minimum}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			/>
		</div>
		<div>
			<label for="maximum" class="text-text-label mb-0.5 block text-sm font-medium">Maximum</label>
			<input
				type="number"
				id="maximum"
				bind:value={maximum}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			/>
		</div>
	</div>
</div>
