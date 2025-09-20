<script lang="ts">
	import type { CheckScanResult } from '../rolls/NaturalLanguageCheckScanner';

	let { check }: { check: CheckScanResult } = $props();

	let c = $state(check);

	let pre = $derived(c.line.substring(0, c.lineStartIndex));
	let post = $derived(c.line.substring(c.lineEndIndex));
</script>

{pre}<span class="ulmf-mention-highlight">{c.text}</span>{post}
