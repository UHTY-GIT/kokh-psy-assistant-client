<!-- Кошик (видалити). Кришка — окрема група .icon-trash__lid: при наведенні її можна підняти анімацією.
     Колір — через CSS color (currentColor), розмір — через width/height або CSS -->
<template>
  <svg class="icon-trash" viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <g class="icon-trash__lid">
      <path d="M3.4 5.4h13.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M7.75 5.4V4.1c0-.7.55-1.25 1.25-1.25h2c.7 0 1.25.55 1.25 1.25v1.3" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
    </g>
    <path d="M5 7.6l.75 8.15c.1 1 .9 1.75 1.9 1.75h4.7c1 0 1.8-.75 1.9-1.75L15 7.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M8.5 10.1v4.6M11.5 10.1v4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
  </svg>
</template>
