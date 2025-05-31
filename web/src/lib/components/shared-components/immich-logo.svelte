<script lang="ts">
  import { t } from 'svelte-i18n';
  import type { HTMLImgAttributes } from 'svelte/elements';

  interface Props extends HTMLImgAttributes {
    noText?: boolean;
    class?: string | undefined;
  }

  let { noText = false, class: cssClass }: Props = $props();
  const viewBox = $derived(`0 0 ${noText ? '260' : '792'} 266.25`);
</script>

<svg {viewBox} class={cssClass}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 196.32 170.02"
    ><defs
      ><style>
        .cls-1 {
          fill: #42b883;
        }
        .cls-2 {
          fill: #35495e;
        }
      </style></defs
    ><title>logo</title><polygon
      class="cls-1"
      points="120.83 0 98.16 39.26 75.49 0 0 0 98.16 170.02 196.32 0 120.83 0"
    /><polygon class="cls-2" points="120.83 0 98.16 39.26 75.49 0 39.26 0 98.16 102.01 157.06 0 120.83 0" /></svg
  >
</svg>

<style>
  .st0 {
    fill: #4251b0;
  }
  .st1 {
    fill: #fa2921;
  }
  .st2 {
    fill: #ed79b5;
  }
  .st3 {
    fill: #ffb400;
  }
  .st4 {
    fill: #1e83f7;
  }
  .st5 {
    fill: #18c249;
  }
</style>
