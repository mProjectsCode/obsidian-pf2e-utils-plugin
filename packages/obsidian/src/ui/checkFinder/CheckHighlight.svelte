<script lang="ts" generics="System extends GameSystem">
	import type { CheckScanResult } from '../../rolls/NaturalLanguageCheckScanner';
	import { GameSystem } from '../../rolls/Pf2eCheck';

	let { check = $bindable() }: { check: CheckScanResult<System> } = $props();

	let pre = $derived(check.line.substring(0, check.lineStartIndex));
	let post = $derived(check.line.substring(check.lineEndIndex));
</script>

{pre}<span class="ulmf-mention-highlight">{check.text}</span>{post}
