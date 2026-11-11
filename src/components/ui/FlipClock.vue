<!-- src/components/ui/FlipClock.vue -->
<!--
  Перекидний годинник CRM: години й хвилини на блакитних плитках, день тижня на плитці хвилин.
  Плитка складається з чотирьох половинок: під клапанами вже нове значення,
  старий верх падає вниз на білій лінії, новий низ відкидається з легким відскоком.
  Використання: <FlipClock timezone="Europe/Kyiv" />  (size: 'full' | 'mini' | 'column')
-->
<template>
  <time class="fclock" :class="`fclock--${size}`" :datetime="`${now.hours}:${now.minutes}`" :aria-label="label">
    <div v-for="card in cards" :key="card.name" class="fclock__card" aria-hidden="true">
      <div v-for="half in HALVES" :key="half" :ref="(el) => setHalfRef(card.name, half, el)"
           class="fclock__half" :class="[`fclock__half--${half}`, { 'fclock__half--flap': half.startsWith('flap') }]"
           v-show="!half.startsWith('flap') || card.flipping">
        <span class="fclock__face">
          {{ card[half].text }}
          <span v-if="card[half].weekday" class="fclock__weekday">{{ card[half].weekday }}</span>
        </span>
        <span class="fclock__shade"></span>
      </div>
    </div>
  </time>
</template>

<script>
import { reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

// static-* лежать під клапанами, flap-* рухаються
const HALVES = ['staticTop', 'staticBottom', 'flapTop', 'flapBottom'];
const FLAP_DOWN_MS = 300;
const FLAP_UP_MS = 420;
const HOURS_DELAY_MS = 120; // хвилини перегортаються першими, як у механічного табло

function readTime(timeZone) {
  const date = new Date();
  const parts = Object.fromEntries(
      new Intl.DateTimeFormat('uk-UA', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
          .formatToParts(date)
          .map((part) => [part.type, part.value])
  );
  // день тижня — у тому ж часовому поясі, що й час
  const weekday = new Intl.DateTimeFormat('uk-UA', { timeZone, weekday: 'long' }).format(date);
  const weekdayShort = new Intl.DateTimeFormat('uk-UA', { timeZone, weekday: 'short' }).format(date);
  return { hours: parts.hour, minutes: parts.minute, weekday, weekdayShort };
}

const sameFace = (a, b) => a.text === b.text && a.weekday === b.weekday;

function createCard(name) {
  const empty = { text: '', weekday: '' };
  return { name, current: null, flipId: 0, flipping: false, staticTop: empty, staticBottom: empty, flapTop: empty, flapBottom: empty };
}

export default {
  name: 'FlipClock',
  props: {
    timezone: { type: String, default: 'Europe/Kyiv' },
    size: { type: String, default: 'full', validator: (value) => ['full', 'mini', 'column'].includes(value) },
  },
  setup(props) {
    const now = reactive(readTime(props.timezone));
    const hoursCard = reactive(createCard('hours'));
    const minutesCard = reactive(createCard('minutes'));
    const cards = [hoursCard, minutesCard];
    const halfRefs = { hours: {}, minutes: {} };
    // Анімації тримаємо поза reactive(): через Proxy браузер не дає читати їхні властивості
    const running = { hours: [], minutes: [] };
    const stop = (card) => {
      running[card.name].forEach((animation) => animation.cancel());
      running[card.name] = [];
    };
    const setHalfRef = (card, half, el) => { if (el) halfRefs[card][half] = el; };

    const label = computed(() => `${now.hours}:${now.minutes}, ${now.weekday}`);
    const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setCard(card, face) {
      card.flipId += 1;
      stop(card);
      card.current = face;
      card.flipping = false;
      card.staticTop = card.staticBottom = card.flapTop = card.flapBottom = face;
    }

    async function flipCard(card, face, delay) {
      if (card.current && sameFace(card.current, face)) return;
      const previous = card.current;
      if (!previous || reduceMotion() || document.hidden) {
        setCard(card, face);
        return;
      }
      stop(card);
      // reactive() обгортає об'єкти, тож своє перегортання впізнаємо за номером, а не за ===
      const flipId = ++card.flipId;
      card.current = face;
      card.staticTop = face;
      card.staticBottom = previous;
      card.flapTop = previous;
      card.flapBottom = face;
      card.flipping = true;
      await nextTick();

      const el = halfRefs[card.name];
      const shade = (half) => el[half].querySelector('.fclock__shade');
      const timing = (duration, offset, easing) => ({ duration, delay: delay + offset, easing, fill: 'both' });
      const animations = [
        // старий верх падає до лінії
        el.flapTop.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }],
            timing(FLAP_DOWN_MS, 0, 'cubic-bezier(.55,.05,.85,.35)')),
        shade('flapTop').animate([{ opacity: 0 }, { opacity: 1 }], timing(FLAP_DOWN_MS, 0, 'ease-in')),
        // новий низ відкидається і ледь відскакує, як пластина, що вдарилась
        el.flapBottom.animate([
          { transform: 'rotateX(90deg)', offset: 0 },
          { transform: 'rotateX(0deg)', offset: 0.62 },
          { transform: 'rotateX(12deg)', offset: 0.8 },
          { transform: 'rotateX(0deg)', offset: 1 },
        ], timing(FLAP_UP_MS, FLAP_DOWN_MS, 'cubic-bezier(.25,.6,.4,1)')),
        shade('flapBottom').animate([{ opacity: 0.9 }, { opacity: 0 }], timing(FLAP_DOWN_MS, FLAP_DOWN_MS, 'ease-out')),
        // тінь від клапана на старому низу і світло, що відкривається зверху
        shade('staticBottom').animate([{ opacity: 0 }, { opacity: 0.7 }], timing(FLAP_DOWN_MS, 0, 'ease-in')),
        shade('staticTop').animate([{ opacity: 0.6 }, { opacity: 0 }], timing(FLAP_DOWN_MS, 0, 'ease-out')),
      ];

      try {
        running[card.name] = animations;
        await animations[2].finished;
      } catch {
        return; // перегортання перервали новим
      }
      if (card.flipId === flipId) setCard(card, face);
    }

    function update() {
      Object.assign(now, readTime(props.timezone));
      const weekday = props.size === 'full' ? now.weekday : now.weekdayShort;
      flipCard(minutesCard, { text: now.minutes, weekday }, 0);
      flipCard(hoursCard, { text: now.hours, weekday: '' }, HOURS_DELAY_MS);
    }

    // Оновлюємось рівно на межі хвилини, а не щосекунди
    let timer = null;
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        update();
        schedule();
      }, 60000 - (Date.now() % 60000) + 30);
    }

    // Фонові вкладки браузер пригальмовує — при поверненні підтягуємо час одразу
    function onVisibility() {
      if (document.hidden) return;
      update();
      schedule();
    }

    onMounted(() => {
      update();
      schedule();
      document.addEventListener('visibilitychange', onVisibility);
    });

    onBeforeUnmount(() => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      cards.forEach(stop);
    });

    return { HALVES, now, cards, label, setHalfRef };
  },
};
</script>

<style scoped lang="scss">
$blue: #72A8BA;

.fclock {
  --w: 124px;
  --h: 156px;
  --gap: 6px;
  --radius: 8px;
  --font: 85px;
  --track: 6px;
  --weekday: 17px;
  --line: 5px;

  position: relative;
  display: inline-flex;
  gap: var(--gap);
  vertical-align: top;

  // одна біла лінія через обидві плитки, як і раніше; вона ж «петля», навколо якої падає клапан
  &::after {
    content: "";
    position: absolute;
    z-index: 5;
    top: 50%;
    left: 0;
    right: 0;
    height: var(--line);
    margin-top: calc(var(--line) / -2);
    background: #fff;
    pointer-events: none;
  }
}

.fclock--mini {
  --w: 62px;
  --h: 78px;
  --gap: 4px;
  --font: 42px;
  --track: 3px;
  --weekday: 10px;
  --line: 2px;
}

.fclock--column {
  --w: 60px;
  --h: 58px;
  --gap: 4px;
  --font: 34px;
  --track: 2px;
  --weekday: 9px;
  --line: 2px;

  flex-direction: column;

  &::after {
    display: none;
  }

  .fclock__card::after {
    content: "";
    position: absolute;
    z-index: 5;
    top: 50%;
    left: 0;
    right: 0;
    height: var(--line);
    margin-top: calc(var(--line) / -2);
    background: #fff;
  }
}

.fclock__card {
  position: relative;
  width: var(--w);
  height: var(--h);
  border-radius: var(--radius);
  perspective: calc(var(--h) * 4);
}

.fclock__half {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  background: $blue;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;

  &--staticTop,
  &--flapTop {
    top: 0;
    border-radius: var(--radius) var(--radius) 0 0;
    transform-origin: 50% 100%;
  }

  &--staticBottom,
  &--flapBottom {
    top: 50%;
    border-radius: 0 0 var(--radius) var(--radius);
    transform-origin: 50% 0;
  }

  &--flap {
    z-index: 2;
  }

  &--flapTop {
    z-index: 3;
  }
}

// обличчя на всю висоту плитки: верхня половинка показує його верх, нижня — низ
.fclock__face {
  position: absolute;
  left: 0;
  width: 100%;
  height: var(--h);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: "Anton", sans-serif;
  font-size: var(--font);
  letter-spacing: var(--track);
  text-indent: var(--track);
  line-height: 1;
}

.fclock__half--staticBottom .fclock__face,
.fclock__half--flapBottom .fclock__face {
  top: -100%;
}

.fclock__weekday {
  position: absolute;
  right: calc(var(--w) * 0.1);
  bottom: calc(var(--h) * 0.07);
  font-family: "Nunito", sans-serif;
  font-size: var(--weekday);
  font-weight: 700;
  letter-spacing: 0;
  text-indent: 0;
}

.fclock__shade {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}

.fclock__half--staticTop .fclock__shade,
.fclock__half--flapTop .fclock__shade {
  background: linear-gradient(to bottom, rgba(30, 50, 60, 0.05), rgba(30, 50, 60, 0.45));
}

.fclock__half--staticBottom .fclock__shade,
.fclock__half--flapBottom .fclock__shade {
  background: linear-gradient(to bottom, rgba(30, 50, 60, 0.45), rgba(30, 50, 60, 0.05));
}
</style>
