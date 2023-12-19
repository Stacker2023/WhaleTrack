<script>
  const minTransferSTX = 5000
  let inputMinTransferSTX = 10000
  let actionList = [];
  let fetchStatus = ''

  async function clickFetch() {
    fetchStatus = ''
    if (inputMinTransferSTX < minTransferSTX) {
      alert(`Min ${minTransferSTX} STX`)
      return
    }
    fetchStatus = 'fetching..'
    const response = await fetch(`http://localhost:3000/api/fetchWhaleActions?minTransferSTX=${inputMinTransferSTX * 1000000}`);
    if (response.status != 200) {
      alert(`status=${response.status}`)
      fetchStatus = ''
      return
    }
    const data = await response.json();
    // console.log('action data', data)
    actionList = []
    for (const actionData of data.resultList) {
      actionList.push(actionData)
    }
    fetchStatus = 'Fetch finish'
  }
</script>

<h1>Whale track</h1>

<div>
  Transfer more than:
  <input bind:value={inputMinTransferSTX} placeholder="enter subject address" />
  STX
</div>

<p>
  <button on:click={() => clickFetch()}>Fetch</button>
  <span>{fetchStatus}</span>
</p>

{#if actionList.length > 0 }
<table>
  <tr>
    <th>Amount</th>
    <th>Address</th>
    <th>Hash</th>
  </tr>
  {#each actionList as item, index (item.hash)}
  <tr>
    <td>{item.stxAmount/1000000}</td>
    <td>{item.debitAddress}</td>
    <td>{item.hash}</td>
  </tr>
  {/each}
</table>
{/if}

<style>
  button {
    height: 36px;
    margin-right: 8px;
  }
</style>
