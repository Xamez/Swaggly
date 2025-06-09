<script lang="ts">
	let {
		minLength = $bindable(),
		maxLength = $bindable(),
		pattern = $bindable()
	} = $props<{
		minLength: number | undefined;
		maxLength: number | undefined;
		pattern: string | undefined;
	}>();
</script>

<div class="mt-2 border-t pt-2">
	<p class="text-text-label mb-1 text-sm font-medium">String Constraints:</p>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<div>
			<label for="minLength" class="text-text-label mb-0.5 block text-sm font-medium">Min Length</label>
			<input
				type="number"
				id="minLength"
				bind:value={minLength}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				min="0"
			/>
		</div>
		<div>
			<label for="maxLength" class="text-text-label mb-0.5 block text-sm font-medium">Max Length</label>
			<input
				type="number"
				id="maxLength"
				bind:value={maxLength}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder appearance-textfield mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				min="0"
			/>
		</div>
		<div>
			<label for="pattern" class="text-text-label mb-0.5 block text-sm font-medium">Pattern (RegExp)</label>
			<input
				type="text"
				id="pattern"
				bind:value={pattern}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				placeholder="^[a-zA-Z_]+$"
			/>
		</div>
	</div>
</div>
