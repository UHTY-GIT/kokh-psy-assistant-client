<!-- src/components/ui/DatePicker.vue -->
<!--
  Пікер дати у стилі CRM. Значення — рядок 'YYYY-MM-DD' (як у <input type="date">) або ''.
  Використання: <DatePicker id="birthdate" v-model="profile.birthdate" :max="today" :invalid="hasError" />
-->
<template>
  <div ref="root" class="date-picker" :class="{ 'date-picker--open': isOpen, 'date-picker--disabled': disabled }" @focusout="onFocusOut">
    <input
        :id="id"
        ref="input"
        class="date-picker__input browser-default"
        :class="{ 'is-invalid': invalid }"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        maxlength="10"
        :placeholder="placeholder"
        :value="text"
        :disabled="disabled"
        aria-haspopup="dialog"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-invalid="invalid ? 'true' : 'false'"
        @input="onType"
        @blur="onBlur"
        @click="open()"
        @keydown="onInputKeydown"
    >
    <button
        type="button"
        class="date-picker__toggle"
        :disabled="disabled"
        :aria-label="isOpen ? 'Закрити календар' : 'Відкрити календар'"
        tabindex="-1"
        @mousedown.prevent
        @click="toggle"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </svg>
    </button>

    <div
        v-if="isOpen"
        ref="panel"
        class="date-picker__panel"
        :class="{ 'date-picker__panel--up': openUp }"
        :style="{ left: shiftX + 'px' }"
        role="dialog"
        aria-label="Вибір дати"
        @keydown="onPanelKeydown"
    >
      <div class="date-picker__head">
        <button type="button" class="date-picker__title" :aria-label="titleLabel" @click="zoomOut">
          {{ title }}
          <svg v-if="view !== 'years'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <div class="date-picker__nav">
          <button type="button" class="date-picker__arrow" :aria-label="prevLabel" @click="step(-1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" class="date-picker__arrow" :aria-label="nextLabel" @click="step(1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      <!-- Дні -->
      <div v-if="view === 'days'" class="date-picker__days" role="grid" :aria-label="title">
        <div class="date-picker__row" role="row">
          <span v-for="(name, i) in WEEKDAYS" :key="name" class="date-picker__weekday" :class="{ 'date-picker__weekday--weekend': i > 4 }" role="columnheader">{{ name }}</span>
        </div>
        <div v-for="(week, w) in weeks" :key="w" class="date-picker__row" role="row">
          <button
              v-for="day in week"
              :key="day.key"
              type="button"
              class="date-picker__day"
              :class="{
                'date-picker__day--outside': !day.inMonth,
                'date-picker__day--today': day.isToday,
                'date-picker__day--selected': day.isSelected,
              }"
              role="gridcell"
              :aria-selected="day.isSelected ? 'true' : 'false'"
              :aria-label="day.label"
              :aria-current="day.isToday ? 'date' : null"
              :disabled="day.isDisabled"
              :tabindex="day.key === cursorKey ? 0 : -1"
              :data-key="day.key"
              @click="pick(day.date)"
          >{{ day.date.d }}</button>
        </div>
      </div>

      <!-- Місяці -->
      <div v-else-if="view === 'months'" class="date-picker__tiles">
        <button
            v-for="(name, m) in MONTHS_SHORT"
            :key="name"
            type="button"
            class="date-picker__tile"
            :class="{ 'date-picker__tile--selected': selected && selected.y === viewYear && selected.m === m }"
            :disabled="isMonthDisabled(viewYear, m)"
            @click="openMonth(m)"
        >{{ name }}</button>
      </div>

      <!-- Роки -->
      <div v-else class="date-picker__tiles">
        <button
            v-for="year in years"
            :key="year"
            type="button"
            class="date-picker__tile"
            :class="{ 'date-picker__tile--selected': selected && selected.y === year, 'date-picker__tile--today': year === today.y }"
            :disabled="isYearDisabled(year)"
            @click="openYear(year)"
        >{{ year }}</button>
      </div>

      <div class="date-picker__foot">
        <button type="button" class="date-picker__clear" @click="clear">Очистити</button>
        <button type="button" class="date-picker__today" :disabled="isDisabled(today)" @click="pick(today)">Сьогодні</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
const MONTHS_GENITIVE = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
const MONTHS_SHORT = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
const YEARS_PER_PAGE = 12;

const pad = (n) => String(n).padStart(2, '0');
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
// Дата як {y, m (0–11), d}; локальний час, без toISOString — щоб не з'їжджав день через часовий пояс
const toDate = (js) => ({ y: js.getFullYear(), m: js.getMonth(), d: js.getDate() });
const toIso = ({ y, m, d }) => `${y}-${pad(m + 1)}-${pad(d)}`;
const toText = ({ y, m, d }) => `${pad(d)}.${pad(m + 1)}.${y}`;
const compare = (a, b) => (a.y - b.y) || (a.m - b.m) || (a.d - b.d);
const addDays = ({ y, m, d }, n) => toDate(new Date(y, m, d + n));
const addMonths = ({ y, m, d }, n) => {
  const first = new Date(y, m + n, 1);
  return { y: first.getFullYear(), m: first.getMonth(), d: Math.min(d, daysIn(first.getFullYear(), first.getMonth())) };
};

function parseIso(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  if (!match) return null;
  return checked(+match[1], +match[2] - 1, +match[3]);
}

function parseText(value) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value || '');
  if (!match) return null;
  return checked(+match[3], +match[2] - 1, +match[1]);
}

function checked(y, m, d) {
  if (y < 1000 || m < 0 || m > 11 || d < 1 || d > daysIn(y, m)) return null;
  return { y, m, d };
}

// 12345678 → 12.34.5678 під час набору
function maskDigits(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

export default {
  name: 'DatePicker',
  props: {
    modelValue: { type: String, default: '' },
    id: { type: String, default: undefined },
    placeholder: { type: String, default: 'дд.мм.рррр' },
    min: { type: String, default: '' },
    max: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const root = ref(null);
    const input = ref(null);
    const panel = ref(null);

    const today = toDate(new Date());
    const selected = computed(() => parseIso(props.modelValue));
    const minDate = computed(() => parseIso(props.min));
    const maxDate = computed(() => parseIso(props.max));

    const text = ref(selected.value ? toText(selected.value) : '');
    watch(selected, (value) => {
      // Не перебиваємо набір, якщо в полі вже ця сама дата
      if (!value || parseText(text.value) === null || compare(parseText(text.value), value) !== 0) {
        text.value = value ? toText(value) : '';
      }
    });

    const isOpen = ref(false);
    const openUp = ref(false);
    const shiftX = ref(0);
    const view = ref('days');
    const cursor = ref(today); // день, на якому фокус у сітці
    const viewYear = computed(() => cursor.value.y);
    const cursorKey = computed(() => toIso(cursor.value));

    const isDisabled = (date) =>
        (minDate.value && compare(date, minDate.value) < 0) ||
        (maxDate.value && compare(date, maxDate.value) > 0) || false;
    const isMonthDisabled = (y, m) =>
        isDisabled({ y, m, d: daysIn(y, m) }) && isDisabled({ y, m, d: 1 });
    const isYearDisabled = (y) => isDisabled({ y, m: 11, d: 31 }) && isDisabled({ y, m: 0, d: 1 });
    const clamp = (date) => {
      if (minDate.value && compare(date, minDate.value) < 0) return minDate.value;
      if (maxDate.value && compare(date, maxDate.value) > 0) return maxDate.value;
      return date;
    };

    const weeks = computed(() => {
      const { y, m } = cursor.value;
      const offset = (new Date(y, m, 1).getDay() + 6) % 7; // понеділок — перший
      const start = addDays({ y, m, d: 1 }, -offset);
      const rows = [];
      for (let w = 0; w < 6; w++) {
        const row = [];
        for (let i = 0; i < 7; i++) {
          const date = addDays(start, w * 7 + i);
          row.push({
            date,
            key: toIso(date),
            inMonth: date.m === m,
            isToday: compare(date, today) === 0,
            isSelected: !!selected.value && compare(date, selected.value) === 0,
            isDisabled: isDisabled(date),
            label: `${date.d} ${MONTHS_GENITIVE[date.m]} ${date.y}`,
          });
        }
        rows.push(row);
      }
      return rows;
    });

    const yearsStart = computed(() => viewYear.value - (((viewYear.value % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE));
    const years = computed(() => Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearsStart.value + i));

    const title = computed(() => {
      if (view.value === 'days') return `${MONTHS[cursor.value.m]} ${cursor.value.y}`;
      if (view.value === 'months') return String(cursor.value.y);
      return `${yearsStart.value}–${yearsStart.value + YEARS_PER_PAGE - 1}`;
    });
    const titleLabel = computed(() => (view.value === 'days' ? 'Обрати місяць і рік' : view.value === 'months' ? 'Обрати рік' : title.value));
    const prevLabel = computed(() => ({ days: 'Попередній місяць', months: 'Попередній рік', years: 'Попередні роки' })[view.value]);
    const nextLabel = computed(() => ({ days: 'Наступний місяць', months: 'Наступний рік', years: 'Наступні роки' })[view.value]);

    const focusCursor = async () => {
      await nextTick();
      const button = panel.value && panel.value.querySelector(`[data-key="${cursorKey.value}"]`);
      if (button) button.focus();
    };

    // Панель не має вилазити за екран: зсуваємо вліво або відкриваємо вгору
    const place = async () => {
      await nextTick();
      if (!panel.value || !root.value) return;
      shiftX.value = 0;
      openUp.value = false;
      const rect = panel.value.getBoundingClientRect();
      const overflowRight = rect.right - (window.innerWidth - 8);
      if (overflowRight > 0) shiftX.value = -Math.min(overflowRight, rect.left - 8);
      const below = window.innerHeight - root.value.getBoundingClientRect().bottom;
      const above = root.value.getBoundingClientRect().top;
      if (below < rect.height + 12 && above > below) openUp.value = true;
    };

    const onDocumentPointer = (event) => {
      if (root.value && !root.value.contains(event.target)) close();
    };

    function open(focusGrid = false) {
      if (props.disabled) return;
      if (!isOpen.value) {
        cursor.value = clamp(selected.value || today);
        view.value = 'days';
        isOpen.value = true;
        document.addEventListener('pointerdown', onDocumentPointer);
        place();
      }
      if (focusGrid) focusCursor();
    }

    function close(returnFocus = false) {
      if (!isOpen.value) return;
      isOpen.value = false;
      document.removeEventListener('pointerdown', onDocumentPointer);
      if (returnFocus && input.value) input.value.focus();
    }

    const toggle = () => (isOpen.value ? close(true) : open(true));

    function pick(date) {
      if (isDisabled(date)) return;
      emit('update:modelValue', toIso(date));
      text.value = toText(date);
      close(true);
    }

    function clear() {
      emit('update:modelValue', '');
      text.value = '';
      close(true);
    }

    function step(direction) {
      if (view.value === 'days') cursor.value = addMonths(cursor.value, direction);
      else if (view.value === 'months') cursor.value = addMonths(cursor.value, direction * 12);
      else cursor.value = addMonths(cursor.value, direction * 12 * YEARS_PER_PAGE);
    }

    function zoomOut() {
      if (view.value === 'days') view.value = 'months';
      else if (view.value === 'months') view.value = 'years';
    }

    function openYear(y) {
      cursor.value = { y, m: cursor.value.m, d: Math.min(cursor.value.d, daysIn(y, cursor.value.m)) };
      view.value = 'months';
    }

    function openMonth(m) {
      const { y } = cursor.value;
      cursor.value = clamp({ y, m, d: Math.min(cursor.value.d, daysIn(y, m)) });
      view.value = 'days';
      focusCursor();
    }

    function onType(event) {
      const masked = maskDigits(event.target.value);
      text.value = masked;
      event.target.value = masked;
      if (!masked) {
        emit('update:modelValue', '');
        return;
      }
      const date = parseText(masked);
      if (date && !isDisabled(date)) {
        emit('update:modelValue', toIso(date));
        cursor.value = date;
      }
    }

    // Недописану або неможливу дату повертаємо до збереженої
    function onBlur() {
      const date = parseText(text.value);
      if (text.value && (!date || isDisabled(date))) {
        text.value = selected.value ? toText(selected.value) : '';
      }
    }

    function onInputKeydown(event) {
      if (event.key === 'ArrowDown' || (event.key === 'Enter' && !isOpen.value)) {
        event.preventDefault();
        open(true);
      } else if (event.key === 'Escape' && isOpen.value) {
        event.preventDefault();
        close();
      }
    }

    function onPanelKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
        return;
      }
      if (view.value !== 'days' || !event.target.classList.contains('date-picker__day')) return;
      const moves = {
        ArrowLeft: () => addDays(cursor.value, -1),
        ArrowRight: () => addDays(cursor.value, 1),
        ArrowUp: () => addDays(cursor.value, -7),
        ArrowDown: () => addDays(cursor.value, 7),
        Home: () => addDays(cursor.value, -((new Date(cursor.value.y, cursor.value.m, cursor.value.d).getDay() + 6) % 7)),
        End: () => addDays(cursor.value, 6 - ((new Date(cursor.value.y, cursor.value.m, cursor.value.d).getDay() + 6) % 7)),
        PageUp: () => addMonths(cursor.value, event.shiftKey ? -12 : -1),
        PageDown: () => addMonths(cursor.value, event.shiftKey ? 12 : 1),
      };
      if (moves[event.key]) {
        event.preventDefault();
        cursor.value = moves[event.key]();
        focusCursor();
      }
    }

    // Фокус пішов за межі пікера (Tab) — закриваємо
    function onFocusOut(event) {
      if (isOpen.value && root.value && event.relatedTarget && !root.value.contains(event.relatedTarget)) close();
    }

    onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointer));

    return {
      WEEKDAYS, MONTHS_SHORT,
      root, input, panel,
      today, selected, text, isOpen, openUp, shiftX, view, viewYear, cursorKey,
      weeks, years, title, titleLabel, prevLabel, nextLabel,
      isDisabled, isMonthDisabled, isYearDisabled,
      open, toggle, pick, clear, step, zoomOut, openYear, openMonth,
      onType, onBlur, onInputKeydown, onPanelKeydown, onFocusOut,
    };
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
$paper: #FFFDFA;
$grey: #C8C8C8;
$muted: #7E8089;

.date-picker {
  position: relative;
  width: 100%;
  font-family: "Nunito", sans-serif;
}

.date-picker__input {
  box-sizing: border-box;
  width: 100%;
  height: auto;
  min-height: 54px;
  margin: 0;
  padding: 14px 56px 14px 18px;
  border: none;
  border-radius: 12px;
  outline: none;
  background-color: $ink;
  color: #fff;
  font-family: inherit;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: .02em;
  transition: box-shadow .2s;

  &::placeholder {
    color: $grey;
    font-weight: 500;
  }

  // смуга під полем — зовні, щоб відступи всередині лишались рівними
  &:focus {
    box-shadow: 0 4px 0 $gold;
  }

  &.is-invalid {
    box-shadow: 0 4px 0 #DF4545;
  }

  &:disabled {
    background-color: #8E9097;
    color: #ECECEE;
    cursor: not-allowed;
  }
}

.date-picker__toggle {
  position: absolute;
  top: 27px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background-color: transparent;
  color: $gold;
  cursor: pointer;
  transform: translateY(-50%);
  transition: background-color .2s, color .2s;

  svg {
    width: 22px;
    height: 22px;
  }

  &:hover,
  &:focus {
    background-color: rgba(218, 177, 137, .16);
  }

  &:disabled {
    color: #ECECEE;
    cursor: not-allowed;
  }
}

.date-picker--open .date-picker__toggle {
  background-color: $gold;
  color: #fff;
}

.date-picker__panel {
  position: absolute;
  z-index: 1000;
  top: calc(100% + 10px);
  box-sizing: border-box;
  width: 320px;
  max-width: calc(100vw - 16px);
  padding: 16px 16px 14px;
  border: 2px solid $sand;
  border-radius: 18px;
  background-color: $paper;
  box-shadow: 0 18px 40px rgba(56, 94, 108, .22), 0 4px 0 $sand;
  color: $ink;
  animation: date-picker-in .16s ease-out;

  &--up {
    top: auto;
    bottom: calc(100% + 10px);
  }
}

@keyframes date-picker-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: none; }
}

.date-picker__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.date-picker__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 10px;
  border: none;
  border-radius: 10px;
  background-color: transparent;
  color: $ink;
  font-family: inherit;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
    color: $gold;
  }

  &:hover,
  &:focus {
    background-color: $sand;
  }
}

.date-picker__nav {
  display: flex;
  gap: 6px;
}

.date-picker__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: $blue;
  color: #fff;
  cursor: pointer;
  transition: background-color .2s;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover,
  &:focus {
    background-color: $teal;
  }
}

.date-picker__days {
  display: grid;
  gap: 2px;
}

.date-picker__row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
}

.date-picker__weekday {
  padding: 4px 0 6px;
  color: $blue;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: .04em;

  &--weekend {
    color: $gold-dark;
  }
}

.date-picker__day {
  aspect-ratio: 1;
  width: 100%;
  min-height: 36px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background-color: transparent;
  color: $ink;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color .15s, color .15s;

  &:hover,
  &:focus {
    background-color: $sand;
  }

  &--outside {
    color: #B5B6BB;
    font-weight: 600;
  }

  &--today {
    box-shadow: inset 0 0 0 2px $gold;
  }

  // обраний день — як поле у фокусі: бірюза і золота смуга під ним
  &--selected,
  &--selected:hover,
  &--selected:focus {
    background-color: $teal;
    color: #fff;
    box-shadow: 0 3px 0 $gold;
  }

  &:disabled {
    background-color: transparent;
    color: #D5D6DA;
    cursor: not-allowed;
  }
}

.date-picker__tiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 4px 0;
}

.date-picker__tile {
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background-color: $sand;
  color: $ink;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color .15s, color .15s;

  &:hover,
  &:focus {
    background-color: $blue;
    color: #fff;
  }

  &--today {
    box-shadow: inset 0 0 0 2px $gold;
  }

  &--selected,
  &--selected:hover,
  &--selected:focus {
    background-color: $teal;
    color: #fff;
    box-shadow: 0 3px 0 $gold;
  }

  &:disabled {
    background-color: transparent;
    color: #D5D6DA;
    cursor: not-allowed;
  }
}

.date-picker__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px dashed $sand;
}

.date-picker__clear {
  height: 34px;
  padding: 0 10px;
  border: none;
  border-radius: 10px;
  background-color: transparent;
  color: $muted;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:hover,
  &:focus {
    background-color: $sand;
    color: $ink;
  }
}

// як золоті кнопки CRM: з «полицею» знизу
.date-picker__today {
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background-color: $gold;
  box-shadow: 0 3px 0 $gold-dark;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;

  &:hover,
  &:focus {
    background-color: $gold;
    filter: brightness(1.04);
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 $gold-dark;
  }

  &:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
}

.date-picker button:focus-visible {
  outline: 2px solid $teal;
  outline-offset: 2px;
}

@media (max-width: 800px) {
  .date-picker__input {
    font-size: 16px; // iOS не збільшує сторінку при фокусі
  }
}

@media (max-width: 500px) {
  .date-picker__panel {
    width: 300px;
    padding: 14px 12px 12px;
  }

  .date-picker__title {
    font-size: 17px;
  }
}
</style>
