<!-- Картатий фінішний прапорець (завершення сесії). Колір — через CSS color (currentColor), розмір — через width/height або CSS.
     Полотнище — група .icon-flag__cloth: її можна «розвівати» анімацією. id обрізки унікальний для кожного екземпляра -->
<template>
  <svg class="icon-flag" viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath :id="clipId">
        <path :d="cloth" />
      </clipPath>
    </defs>
    <path d="M4.75 21.25V3.25" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" />
    <g class="icon-flag__cloth">
      <g :clip-path="`url(#${clipId})`" fill="currentColor">
        <rect x="4.75" y="2" width="3.6" height="6.9" />
        <rect x="11.95" y="2" width="3.6" height="6.9" />
        <rect x="8.35" y="8.9" width="3.6" height="7.2" />
        <rect x="15.55" y="8.9" width="3.8" height="7.2" />
      </g>
      <path :d="cloth" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" />
    </g>
  </svg>
</template>

<script>
let uid = 0;

export default {
  name: 'IconFlagFinish',
  data() {
    uid += 1;
    return {
      clipId: `icon-flag-clip-${uid}`,
      // полотнище з легкою хвилею
      cloth: 'M4.75 4.6C7.15 3.2 9.55 3.2 11.95 4.6C14.35 6 16.75 6 19.15 4.6V13.6C16.75 15 14.35 15 11.95 13.6C9.55 12.2 7.15 12.2 4.75 13.6Z',
    };
  },
};
</script>
