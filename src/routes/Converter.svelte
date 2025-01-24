<script lang="ts">
	import { onMount } from 'svelte';

    //initialization of all variable states
	let amount = $state(0);
	let fromCurrency = $state('');
	let toCurrency = $state('');
	let result = $state<number | null>(null);
	let currencies = $state<[string, string][]>([]);

	const apiKey = 'eeb82de43c3805981e02303a';

	// Derived state to check if all have values
	let canConvert = $derived(fromCurrency && toCurrency && amount > 0);

    //function to get the name of the currency to be appended to the result text later
	function getCurrencyName(code: string): string {
		const currency = currencies.find(([currencyCode]) => currencyCode === code);
		return currency ? currency[1] : code;
	}

    //function to run onmount to fetch data from the API
	onMount(async () => {
		const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/codes`);
		const data = await response.json();
		currencies = data.supported_codes;
	});

    //function to convert the currency using an API call
	async function convertCurrency() {
		if (canConvert) {
			const response = await fetch(
				`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}/${amount}`
			);
			const data = await response.json();
			result = data.conversion_result;
		}
	}

    //function to reset the data after successful conversion
	function reset() {
		amount = 0;
		fromCurrency = '';
		toCurrency = '';
		result = null;
	}
    
</script>

<div class="w-full max-w-3xl h-full space-y-5">
	<header class="text-center text-white py-4">
		<h1 class="text-3xl font-bold">Simple Currency Conversion App</h1>
	</header>

	<div class="bg-white rounded-lg mx-auto space-y-3" style="width: 100%;">
		<div class="grid grid-cols-3 gap-4 p-5">
			<div class="bg-white rounded-lg p-4 shadow-md space-y-3">
				<label for="amount">Enter amount:</label>
				<input
					type="number"
					id="amount"
					bind:value={amount}
					class="bg-slate-50 border border-slate-950 text-gray-900 text-sm rounded-lg block w-full p-2.5 hover:cursor-pointer"
					placeholder=""
					required
				/>
			</div>

			<div class="bg-white rounded-lg p-4 shadow-md space-y-3">
				<label for="convertFrom" class="text-gray-500">From</label>
				<select
					name="convertFrom"
					id="from"
					bind:value={fromCurrency}
					class="bg-slate-50 border border-slate-950 text-gray-900 text-sm rounded-lg block w-full p-2.5 hover:cursor-pointer"
				>
					{#each currencies as [code, name]}
						<option value={code}>{name} ({code})</option>
					{/each}
				</select>
			</div>

			<div class="bg-white rounded-lg p-4 shadow-md space-y-3">
				<label for="convertTo" class="text-gray-500">To</label>
				<select
					name="convertTo"
					id="to"
					bind:value={toCurrency}
					class="bg-slate-50 border border-slate-950 text-gray-900 text-sm rounded-lg block w-full p-2.5 hover:cursor-pointer"
				>
					{#each currencies as [code, name]}
						<option value={code}>{name} ({code})</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="flex mx-auto py-2">
			<button
				onclick={result !== null ? reset : convertCurrency}
				class="py-2 px-3 bg-slate-950 rounded-lg text-white mx-auto hover:bg-slate-300 hover:text-slate-950 hover:cursor-pointer"
				disabled={!canConvert && result === null}
			>
				{#if result !== null}
					Reset
				{:else}
					Convert
				{/if}
			</button>
		</div>

		{#if result !== null}
			<div class="p-5 text-slate-950 space-y-4">
				<h3 class="text-slate-500 font-semibold text-2xl">
					{amount}
					{getCurrencyName(fromCurrency)} =
				</h3>
				<h1 class="text-dark text-4xl font-extrabold">{result} {getCurrencyName(toCurrency)}</h1>
			</div>
		{/if}
	</div>
</div>
