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

<div class="border-t border-white pt-3">
	<p class="text-xs font-medium text-text-label mb-2">String Constraints</p>
	<div class="grid grid-cols-3 gap-3">
		<div>
			<label class="block text-xs text-text-label mb-1" for="minLength">Min Length</label>
			<input
				id="minLength"
				type="number"
				bind:value={minLength}
				min="0"
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>
		<div>
			<label class="block text-xs text-text-label mb-1" for="maxLength">Max Length</label>
			<input
				id="maxLength"
				type="number"
				bind:value={maxLength}
				min="0"
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>
		<div>
			<label class="block text-xs text-text-label mb-1" for="pattern">Pattern</label>
			<input
				id="pattern"
				type="text"
				bind:value={pattern}
				placeholder="^[a-zA-Z_]+$"
				class="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-background focus:border-accent"
			/>
		</div>
	</div>
</div>
