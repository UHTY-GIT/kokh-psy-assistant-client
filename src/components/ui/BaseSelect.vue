<!-- src/components/ui/BaseSelect.vue -->
<!--
  Випадний список у стилі CRM замість системного <select>.
  Варіанти можна передати як звичайні <option> (як у <select>) або пропом options:
    <BaseSelect v-model="value" placeholder="Оберіть варіант">
      <option v-for="v in variants" :key="v" :value="v">{{ v }}</option>
    </BaseSelect>
    <BaseSelect v-model="value" :options="[{ value: 1, label: 'Один' }, 'Два']" />
  <option disabled value=""> (або :value="undefined") без пропа placeholder стає підказкою.
  Список відкривається окремим шаром у body — його не обрізають попапи; для довгих списків є пошук.
-->
<template>
  <div
      ref="root"
      class="base-select"
      :class="{ 'is-open': isOpen, 'is-disabled': disabled, 'has-value': hasValue }"
  >
    <button
        :id="id"
        ref="trigger"
        type="button"
        class="base-select__trigger"
        :class="{ 'is-invalid': invalid }"
        :disabled="disabled"
        aria-haspopup="listbox"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-controls="listId"
        :aria-invalid="invalid ? 'true' : 'false'"
        @click="toggle"
        @keydown="onTriggerKeydown"
    >
      <span class="base-select__value" :class="{ 'is-placeholder': !hasValue }">{{ hasValue ? selected.label : placeholderText }}</span>
      <svg class="base-select__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <!-- для нативної перевірки форми (required): браузер покаже підказку біля поля -->
    <input
        v-if="required"
        class="base-select__native"
        tabindex="-1"
        aria-hidden="true"
        :value="hasValue ? String(selected.value) : ''"
        required
        @invalid="onInvalid"
    >

    <Teleport to="body">
      <Transition name="base-select-pop" @after-leave="onAfterLeave">
        <div
            v-if="isOpen"
            ref="panel"
            class="base-select__panel"
            :class="{ 'is-up': placement.up }"
            :style="panelStyle"
            @keydown="onListKeydown"
        >
          <div v-if="isSearchable" class="base-select__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input
                ref="search"
                v-model="query"
                type="text"
                class="browser-default"
                placeholder="Пошук…"
                aria-label="Пошук у списку"
                :aria-controls="listId"
                :aria-activedescendant="activeId"
            >
          </div>
          <ul
              :id="listId"
              ref="list"
              class="base-select__list"
              role="listbox"
              tabindex="-1"
              :aria-activedescendant="activeId"
          >
            <li
                v-for="(option, index) in filtered"
                :id="`${listId}-${index}`"
                :key="option.key"
                class="base-select__option"
                :class="{ 'is-active': index === activeIndex, 'is-selected': isSelected(option), 'is-disabled': option.disabled }"
                :style="{ '--i': Math.min(index, 8) }"
                role="option"
                :aria-selected="isSelected(option) ? 'true' : 'false'"
                :aria-disabled="option.disabled ? 'true' : null"
                @mousedown.prevent
                @mousemove="activeIndex = index"
                @click="choose(option)"
            >
              <span class="base-select__label">{{ option.label }}</span>
              <svg v-if="isSelected(option)" class="base-select__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
            </li>
            <li v-if="!filtered.length" class="base-select__empty">Нічого не знайдено</li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick, onBeforeUnmount } from 'vue';

let uid = 0;
const SEARCH_THRESHOLD = 12; // від скількох варіантів з'являється пошук

const textOf = (children) => {
  if (children == null) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map((c) => textOf(c && typeof c === 'object' ? c.children : c)).join('');
  return '';
};

// <option> з дефолтного слота → { value, label, disabled }
function optionsFromSlot(vnodes, out = []) {
  for (const vnode of vnodes || []) {
    if (!vnode) continue;
    if (vnode.type === 'option') {
      const props = vnode.props || {};
      const label = textOf(vnode.children).trim();
      const hasValue = Object.prototype.hasOwnProperty.call(props, 'value');
      const disabled = props.disabled !== undefined && props.disabled !== false;
      out.push({ value: hasValue ? props.value : label, label, disabled, rawValue: hasValue ? props.value : undefined });
    } else if (Array.isArray(vnode.children)) {
      optionsFromSlot(vnode.children, out); // v-for / фрагменти
    }
  }
  return out;
}

const sameValue = (a, b) => a === b || (a != null && b != null && String(a) === String(b));

export default {
  name: 'BaseSelect',
  props: {
    modelValue: { type: [String, Number, Boolean, Object, null], default: undefined },
    options: { type: Array, default: null },
    placeholder: { type: String, default: '' },
    id: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    searchable: { type: Boolean, default: undefined },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    uid += 1;
    const listId = `base-select-list-${uid}`;
    const root = ref(null);
    const trigger = ref(null);
    const panel = ref(null);
    const list = ref(null);
    const search = ref(null);

    const isOpen = ref(false);
    const query = ref('');
    const activeIndex = ref(-1);
    const placement = reactive({ top: 0, left: 0, width: 0, up: false, maxHeight: 300 });

    // усі варіанти: з пропа options або з <option> у слоті
    const allOptions = computed(() => {
      if (props.options) {
        return props.options.map((o) => (o !== null && typeof o === 'object'
            ? { value: o.value, label: String(o.label != null ? o.label : o.value), disabled: !!o.disabled }
            : { value: o, label: String(o), disabled: false }));
      }
      return optionsFromSlot(slots.default ? slots.default() : []);
    });

    // перший вимкнений варіант без значення — це підказка «Оберіть…»
    const placeholderOption = computed(() =>
        allOptions.value.find((o) => o.disabled && (o.rawValue === '' || o.rawValue === undefined)));
    const choices = computed(() => allOptions.value
        .filter((o) => o !== placeholderOption.value)
        .map((o, i) => ({ ...o, key: `${i}-${String(o.value)}` })));
    const placeholderText = computed(() => props.placeholder || (placeholderOption.value && placeholderOption.value.label) || 'Оберіть варіант');

    const selected = computed(() => choices.value.find((o) => sameValue(o.value, props.modelValue)));
    const hasValue = computed(() => !!selected.value);
    const isSelected = (option) => !!selected.value && sameValue(option.value, selected.value.value);

    const isSearchable = computed(() => (props.searchable !== undefined ? props.searchable : choices.value.length >= SEARCH_THRESHOLD));
    const filtered = computed(() => {
      const q = query.value.trim().toLowerCase();
      return q ? choices.value.filter((o) => o.label.toLowerCase().includes(q)) : choices.value;
    });
    watch(query, () => { activeIndex.value = firstEnabled(0, 1); });

    const activeId = computed(() => (activeIndex.value >= 0 && activeIndex.value < filtered.value.length ? `${listId}-${activeIndex.value}` : null));

    const panelStyle = computed(() => ({
      top: `${placement.top}px`,
      left: `${placement.left}px`,
      width: `${placement.width}px`,
      '--max-height': `${placement.maxHeight}px`,
    }));

    function firstEnabled(from, step) {
      const items = filtered.value;
      for (let i = from; i >= 0 && i < items.length; i += step) {
        if (!items[i].disabled) return i;
      }
      return -1;
    }

    // ---------- позиція шару ----------
    function place() {
      if (!trigger.value) return;
      const rect = trigger.value.getBoundingClientRect();
      const gap = 8;
      const margin = 12;
      const below = window.innerHeight - rect.bottom - margin;
      const above = rect.top - margin;
      const wanted = Math.min(320, (isSearchable.value ? 56 : 0) + filtered.value.length * 46 + 16);
      placement.up = below < Math.min(wanted, 220) && above > below;
      placement.maxHeight = Math.max(140, Math.min(320, (placement.up ? above : below) - gap));
      placement.width = Math.max(rect.width, 200);
      placement.left = Math.min(Math.max(margin, rect.left), window.innerWidth - placement.width - margin);
      placement.top = placement.up ? rect.top - gap : rect.bottom + gap;
    }

    let frame = null;
    const onViewportChange = (event) => {
      // прокрутка самого списку не зсуває шар; у resize ціль — window, а не вузол
      if (event && event.target instanceof Node && panel.value && panel.value.contains(event.target)) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };

    function scrollActiveIntoView() {
      nextTick(() => {
        const el = list.value && activeId.value && list.value.querySelector(`#${activeId.value}`);
        if (el) el.scrollIntoView({ block: 'nearest' });
      });
    }

    // ---------- відкрити / закрити ----------
    async function open() {
      if (props.disabled || isOpen.value) return;
      query.value = '';
      const current = filtered.value.findIndex((o) => isSelected(o));
      activeIndex.value = current >= 0 ? current : firstEnabled(0, 1);
      place();
      isOpen.value = true;
      document.addEventListener('pointerdown', onDocumentPointer, true);
      window.addEventListener('resize', onViewportChange);
      window.addEventListener('scroll', onViewportChange, true);
      await nextTick();
      place();
      if (isSearchable.value && search.value) search.value.focus({ preventScroll: true });
      else if (list.value) list.value.focus({ preventScroll: true });
      scrollActiveIntoView();
    }

    function close(returnFocus = true) {
      if (!isOpen.value) return;
      isOpen.value = false;
      document.removeEventListener('pointerdown', onDocumentPointer, true);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
      if (returnFocus && trigger.value) trigger.value.focus({ preventScroll: true });
    }

    const toggle = () => (isOpen.value ? close() : open());
    const onAfterLeave = () => { query.value = ''; };

    function onDocumentPointer(event) {
      const inside = [root.value, panel.value].some((el) => el && el.contains(event.target));
      if (!inside) close(false);
    }

    function choose(option) {
      if (!option || option.disabled) return;
      emit('update:modelValue', option.value);
      emit('change', option.value);
      close();
    }

    // ---------- клавіатура ----------
    let typed = '';
    let typedTimer = null;
    function typeahead(char) {
      clearTimeout(typedTimer);
      typed += char.toLowerCase();
      typedTimer = setTimeout(() => { typed = ''; }, 600);
      const index = filtered.value.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(typed));
      if (index >= 0) {
        activeIndex.value = index;
        scrollActiveIntoView();
      }
      return index;
    }

    function onTriggerKeydown(event) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // друк при закритому списку — одразу вибирає збіг, як у системного select
        const index = typeahead(event.key);
        if (index >= 0) choose(filtered.value[index]);
      }
    }

    function move(from, step) {
      const next = firstEnabled(from, step);
      if (next >= 0) {
        activeIndex.value = next;
        scrollActiveIntoView();
      }
    }

    function onListKeydown(event) {
      const last = filtered.value.length - 1;
      switch (event.key) {
        case 'ArrowDown': event.preventDefault(); move(activeIndex.value + 1, 1); break;
        case 'ArrowUp': event.preventDefault(); move(activeIndex.value - 1, -1); break;
        case 'Home': if (!isSearchable.value) { event.preventDefault(); move(0, 1); } break;
        case 'End': if (!isSearchable.value) { event.preventDefault(); move(last, -1); } break;
        case 'PageDown': event.preventDefault(); move(Math.min(last, activeIndex.value + 6), 1); break;
        case 'PageUp': event.preventDefault(); move(Math.max(0, activeIndex.value - 6), -1); break;
        case 'Enter':
          event.preventDefault();
          choose(filtered.value[activeIndex.value]);
          break;
        case ' ':
          if (!isSearchable.value) { event.preventDefault(); choose(filtered.value[activeIndex.value]); }
          break;
        case 'Escape': event.preventDefault(); close(); break;
        case 'Tab': close(false); break;
        default:
          if (!isSearchable.value && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) typeahead(event.key);
      }
    }

    function onInvalid(event) {
      // браузер не може сфокусувати приховане поле — показуємо помилку на кнопці
      event.preventDefault();
      if (trigger.value) {
        trigger.value.classList.add('is-invalid');
        trigger.value.focus();
      }
    }
    watch(() => props.modelValue, () => {
      if (trigger.value && !props.invalid) trigger.value.classList.remove('is-invalid');
    });

    watch(() => props.disabled, (disabled) => { if (disabled) close(false); });

    onBeforeUnmount(() => {
      close(false);
      cancelAnimationFrame(frame);
      clearTimeout(typedTimer);
    });

    return {
      listId, root, trigger, panel, list, search,
      isOpen, query, activeIndex, activeId, placement, panelStyle,
      filtered, selected, hasValue, placeholderText, isSearchable, isSelected,
      toggle, choose, onAfterLeave, onTriggerKeydown, onListKeydown, onInvalid,
    };
  },
};
</script>

<style scoped lang="scss">
$ink: #494B55;
$blue: #72A8BA;
$teal: #385E6C;
$gold: #DAB189;
$sand: #EFE4D6;
$paper: #FFFDFA;
$spring: cubic-bezier(.34, 1.56, .64, 1);
$smooth: cubic-bezier(.22, 1, .36, 1);

.base-select {
  position: relative;
  width: 100%;
  font-family: "Nunito", sans-serif;
}

// кнопка-поле: як інші поля CRM — графіт, білий текст, золота стрілка
.base-select__trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  min-height: 44px;
  margin: 0;
  padding: 9px 14px 9px 15px;
  border: none;
  border-radius: 10px;
  background-color: $ink;
  color: #fff;
  font-family: inherit;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
  transition: box-shadow .2s, background-color .2s;

  &:focus {
    background-color: $ink;
    outline: none;
  }

  &:focus-visible {
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

.base-select__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.is-placeholder {
    color: #C8C8C8;
    font-weight: 500;
  }
}

.base-select__chevron {
  flex: none;
  width: 22px;
  height: 22px;
  color: $gold;
  transition: transform .35s $spring;
}

.is-open .base-select__chevron {
  transform: rotate(180deg);
}

.base-select__trigger:disabled .base-select__chevron {
  color: #C8C8C8;
}

// прихований input лише для перевірки required
.base-select__native {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 1px;
  height: 1px;
  margin: 0;
  padding: 0;
  border: 0;
  opacity: 0;
  pointer-events: none;
}

// ---------- шар зі списком ----------
.base-select__panel {
  position: fixed;
  z-index: 2000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  max-height: var(--max-height);
  padding: 8px;
  border: 2px solid $sand;
  border-radius: 16px;
  background: $paper;
  box-shadow: 0 18px 40px rgba(56, 94, 108, .25), 0 4px 0 $sand;
  font-family: "Nunito", sans-serif;
  transform-origin: 50% 0;

  &.is-up {
    transform: translateY(-100%);
    transform-origin: 50% 100%;
  }
}

.base-select__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
  margin: 0 0 6px;
  padding: 0 12px;
  border-radius: 10px;
  background: $sand;
  color: #7E8089;

  svg {
    flex: none;
    width: 18px;
    height: 18px;
  }

  input {
    flex: 1;
    min-width: 0;
    height: 40px;
    border: none;
    outline: none;
    background: transparent;
    color: $ink;
    font: 600 16px "Nunito", sans-serif; // 16px — iOS не збільшує сторінку при фокусі
  }
}

.base-select__list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  outline: none;
  overscroll-behavior: contain;
}

.base-select__option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 9px 12px;
  box-sizing: border-box;
  border-radius: 10px;
  color: $ink;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  cursor: pointer;
  animation: base-select-option-in .35s $smooth both;
  animation-delay: calc(var(--i) * 18ms);
  transition: background-color .15s, color .15s, padding-left .25s $smooth;

  &.is-active {
    background: $sand;
    padding-left: 16px;
  }

  // обраний — блакитний з білим текстом і білою галочкою, як активний пункт меню
  &.is-selected {
    background: $blue;
    color: #fff;
  }

  &.is-selected.is-active {
    background: #6699AA;
  }

  &.is-disabled {
    color: #B5B6BB;
    cursor: not-allowed;
    background: transparent;
  }
}

.base-select__label {
  flex: 1;
  min-width: 0;
}

.base-select__check {
  flex: none;
  width: 18px;
  height: 18px;
  color: #fff;
}

.base-select__empty {
  padding: 14px 12px;
  color: #7E8089;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
}

@keyframes base-select-option-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: none; }
}

// поява шару: «виростає» від поля
.base-select-pop-enter-active {
  transition: opacity .18s ease, transform .3s $spring;
}

.base-select-pop-leave-active {
  transition: opacity .14s ease, transform .16s ease-in;
}

.base-select-pop-enter-from,
.base-select-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(.97);

  &.is-up {
    transform: translateY(calc(-100% + 6px)) scale(.97);
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-select__chevron,
  .base-select__option,
  .base-select-pop-enter-active,
  .base-select-pop-leave-active {
    animation: none;
    transition: none;
  }
}
</style>
