<script lang="ts">
	let { minimum = $bindable(), maximum = $bindable() } = $props<{
		minimum: number | undefined;
		maximum: number | undefined;
	}>();
</script>

<div class="border-t border-white pt-3">
	<p class="text-xs font-medium text-text-label mb-2">Numeric Constraints</p>
	<div class="grid grid-cols-2 gap-3">
		<div>
			<label class="block text-xs text-text-label mb-1" for="minimum">Minimum</label>
			<input
				id="minimum"
				type="number"
				bind:value={minimum}
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>
		<div>
			<label class="block text-xs text-text-label mb-1" for="maximum">Maximum</label>
			<input
				id="maximum"
				type="number"
				bind:value={maximum}
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>
	</div>
</div>
