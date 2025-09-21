<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		reverse = false,
		stretchChildren = false,
		children,
	}: {
		reverse?: boolean;
		stretchChildren?: boolean;
		children: Snippet;
	} = $props();

	const classes = $derived([reverse ? 'pf2e-flex-row-reverse' : 'pf2e-flex-row', stretchChildren ? 'pf2e-flex-row-stretch' : ''].join(' '));
</script>

<div class={classes}>
	{@render children()}
</div>
