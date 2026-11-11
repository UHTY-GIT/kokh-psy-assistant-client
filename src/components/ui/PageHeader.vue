<!-- src/components/ui/PageHeader.vue -->
<!--
  Хедер сторінки в стилі CRM: підпис над назвою, сама назва (ім'я клієнта або назва сторінки),
  за потреби — номер сесії плиткою, підзаголовок, дата й час чипом і кнопки справа.
  <PageHeader eyebrow="Сесія · заповнення" :number="7" title="Олена" :title-to="{ name: 'ClientInformation', params: { id } }" :date="iso" />
  <PageHeader title="Мій профіль"><template #actions><button class="page-header__btn">Вийти</button></template></PageHeader>
-->
<template>
  <header class="page-header" :class="{ 'has-num': hasNumber }">
    <div class="page-header__row">
      <div v-if="hasNumber" class="page-header__num" aria-hidden="true">
        <small>№</small><span>{{ number }}</span>
      </div>

      <div class="page-header__text">
        <p v-if="eyebrow" class="page-header__eyebrow">{{ eyebrow }}</p>
        <h1 class="page-header__title">
          <router-link v-if="titleTo && title" :to="titleTo" class="page-header__link" title="Відкрити картку клієнта">
            {{ title }}<IconArrowUpRight class="page-header__link-icon" />
          </router-link>
          <template v-else>{{ title }}</template>
        </h1>
        <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
      </div>

      <div v-if="dateParts || $slots.actions" class="page-header__aside">
        <div v-if="dateParts" class="page-header__date">
          <svg class="page-header__date-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="2.75" y="3.75" width="14.5" height="13.5" rx="3.2" stroke="currentColor" stroke-width="1.8" />
            <path d="M2.75 8h14.5M6.6 2.2v3M13.4 2.2v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <circle cx="7" cy="11.6" r="1.05" fill="currentColor" />
            <circle cx="10" cy="11.6" r="1.05" fill="currentColor" />
            <circle cx="13" cy="11.6" r="1.05" fill="currentColor" />
          </svg>
          <span class="page-header__day">{{ dateParts.day }}</span>
          <b v-if="dateParts.time" class="page-header__time">{{ dateParts.time }}</b>
        </div>
        <slot name="actions" />
      </div>
    </div>
    <div class="page-header__line" aria-hidden="true"></div>
  </header>
</template>

<script>
import { computed } from 'vue';
import IconArrowUpRight from '@/components/icons/IconArrowUpRight.vue';

export default {
  name: 'PageHeader',
  components: { IconArrowUpRight },
  props: {
    title: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    number: { type: [String, Number], default: null },
    // дата сесії (рядок ISO або Date) — показується як «27 травня 2026» і окремо час
    date: { type: [String, Date], default: null },
    titleTo: { type: [String, Object], default: null },
  },
  setup(props) {
    const hasNumber = computed(() => props.number !== null && props.number !== undefined && String(props.number) !== '');

    const dateParts = computed(() => {
      if (!props.date) return null;
      const date = new Date(props.date);
      if (Number.isNaN(date.getTime())) return null;
      return {
        day: date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      };
    });

    return { hasNumber, dateParts };
  },
};
</script>

<style scoped lang="scss">
$ink: #494B55;
$blue: #72A8BA;
$teal: #385E6C;
$gold: #DAB189;
$gold-dark: #BA9571;
$sand: #EFE4D6;
$smooth: cubic-bezier(.22, 1, .36, 1);
$spring: cubic-bezier(.34, 1.56, .64, 1);

.page-header {
  margin: 0 30px 28px;
  font-family: "Nunito", sans-serif;
}

.page-header__row {
  display: flex;
  align-items: center;
  gap: 14px 20px;
  padding-bottom: 18px;
}

.page-header__num {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 68px;
  height: 68px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 18px;
  background: $blue;
  box-shadow: 0 4px 0 $teal;
  color: #fff;
  animation: page-header-pop .55s $spring both;

  small {
    align-self: flex-end;
    margin-bottom: 21px;
    font: 800 14px/1 "Nunito", sans-serif;
    opacity: .85;
  }

  span {
    font: 400 34px/1 "Anton", sans-serif;
    letter-spacing: .02em;
  }
}

.page-header__text {
  flex: 1;
  min-width: 0;
  animation: page-header-rise .5s .05s $smooth both;
}

.page-header__eyebrow {
  margin: 0 0 6px;
  color: $gold-dark;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.page-header__title {
  margin: 0;
  color: $ink;
  font-family: "Nunito", sans-serif;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.page-header__link {
  color: inherit;
  text-decoration: none;
  transition: color .25s;

  &:hover,
  &:focus-visible {
    color: $teal;
    outline: none;

    .page-header__link-icon {
      opacity: 1;
      transform: translate(0, 0);
    }
  }
}

.page-header__link-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-left: 6px;
  vertical-align: 2px;
  opacity: 0;
  transform: translate(-6px, 6px);
  transition: opacity .25s, transform .35s $spring;
}

.page-header__subtitle {
  margin: 6px 0 0;
  color: #7E8089;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.page-header__aside {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-left: auto;
  animation: page-header-rise .5s .12s $smooth both;
}

.page-header__date {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 46px;
  padding: 0 6px 0 14px;
  box-sizing: border-box;
  border-radius: 14px;
  background: $sand;
  color: $ink;
  white-space: nowrap;
}

.page-header__date-icon {
  width: 20px;
  height: 20px;
  color: $gold-dark;
}

.page-header__day {
  font-size: 16px;
  font-weight: 700;
}

.page-header__time {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 11px;
  border-radius: 10px;
  background: $teal;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: .02em;
}

// кнопка в хедері (наприклад, «Вийти з акаунту»)
:slotted(.page-header__btn) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 20px;
  border: none;
  border-radius: 14px;
  background: $gold;
  box-shadow: 0 4px 0 $gold-dark;
  color: #fff;
  font: 800 16px/1 "Nunito", sans-serif;
  cursor: pointer;
  transition: transform .3s $spring, box-shadow .2s;

  &:focus {
    background: $gold;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 $gold-dark;
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 $gold-dark;
  }
}

// лінія під хедером: золотий початок, далі графіт — малюється зліва направо
.page-header__line {
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, $gold 0 64px, $ink 64px);
  transform-origin: left center;
  animation: page-header-line .8s .1s $smooth both;
}

.page-header.has-num .page-header__line {
  background: linear-gradient(90deg, $gold 0 68px, $ink 68px);
}

@keyframes page-header-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes page-header-pop {
  from {
    opacity: 0;
    transform: scale(.7) rotate(-6deg);
  }
}

@keyframes page-header-line {
  from {
    transform: scaleX(0);
  }
}

@media (max-width: 1200px) {
  .page-header__title {
    font-size: 26px;
  }
}

@media (max-width: 760px) {
  .page-header {
    margin-bottom: 22px;
  }

  .page-header__row {
    flex-wrap: wrap;
    padding-bottom: 14px;
  }

  .page-header__num {
    min-width: 56px;
    height: 56px;
    border-radius: 15px;

    small {
      margin-bottom: 17px;
      font-size: 12px;
    }

    span {
      font-size: 28px;
    }
  }

  .page-header__title {
    font-size: 23px;
  }

  // дата й кнопки — окремим рядком під назвою
  .page-header__aside {
    flex-basis: 100%;
    justify-content: flex-start;
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-header__num,
  .page-header__text,
  .page-header__aside,
  .page-header__line {
    animation: none;
  }
}
</style>
