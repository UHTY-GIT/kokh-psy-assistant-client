<!-- src/components/notes/NotesComponent.vue -->
<template>
  <section class="notes">
    <div class="title-notification">
      <IconSpeechBubble class="menu-icon notes__title-icon" />
      <span>Примітка</span>
    </div>

    <button type="button" class="notes-add" @click="showModalNotes = true">
      <span class="notes-add__icon"><IconPlus /></span>
      <span class="notes-add__label">Додати примітку</span>
    </button>

    <TransitionGroup name="note" tag="ul" class="notes-list">
      <li v-for="(note, index) in notes" :key="note.id" class="note-card" :style="{ '--i': Math.min(index, 10) }">
        <p class="note-card__text">{{ note.content }}</p>
        <button
            type="button"
            class="note-card__delete"
            aria-label="Видалити примітку"
            title="Видалити"
            @click="openDeleteModal(note)"
        >
          <IconTrash />
        </button>
      </li>
    </TransitionGroup>

    <p v-if="loaded && !notes.length" class="notes-empty">
      <IconStickyNote class="notes-empty__icon" />
      <span>Поки порожньо. Додайте першу примітку — вона збережеться тут.</span>
    </p>

    <!--  Вікно, щоб додати нотатку -->
    <ModalNotesAdd
        :showModal="showModalNotes"
        @close="closeModalNotes"
        @confirm="addNote"
    />
    <!--  Вікно для видалення нотатки -->
    <ModalNotesDelete
        :showModal="showDeleteNotes"
        :idNotes="idNotes"
        :noteText="noteToDelete"
        @close="closeDeleteNotes"
        @confirm="deleteNote"
    />
  </section>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import apiService from '@/services/apiService';
import ModalNotesAdd from "@/components/modal/ModalNotesAdd.vue";
import ModalNotesDelete from "@/components/modal/ModalNotesDelete.vue";
import M from "materialize-css";
import { IconPlus, IconTrash, IconStickyNote, IconSpeechBubble } from "@/components/icons";

export default {
  components: {
    ModalNotesAdd,
    ModalNotesDelete,
    IconPlus,
    IconTrash,
    IconStickyNote,
    IconSpeechBubble
  },
  emits: ['count'],
  setup(props, { emit }) {
    const notes = ref([]);
    // кількість нотаток для лічильника на панелі навігації
    watch(() => (Array.isArray(notes.value) ? notes.value.length : 0), (count) => emit('count', count), { immediate: true });
    const showModalNotes = ref(false);
    const showDeleteNotes = ref(false);
    const idNotes = ref(null);
    const noteToDelete = ref('');
    const loaded = ref(false);

    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiService.getNotes(token);
        notes.value = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        loaded.value = true;
      }
    };

    const addNote = async (title) => {
      try {
        const token = localStorage.getItem('token');
        await apiService.createNote(token, title);
        showModalNotes.value = false;
        fetchNotes();
        M.toast({ html: `Нотатка успішно додана` });
      } catch (error) {
        console.error('Error adding note:', error);
        M.toast({ html: `Помилка: Нотатка не додана` });
      }
    };

    const deleteNote = async () => {
      try {
        const token = localStorage.getItem('token');
        await apiService.deleteNote(token, idNotes.value);
        showDeleteNotes.value = false;
        fetchNotes();
        M.toast({ html: `Нотатка видалена` });
      } catch (error) {
        console.error('Error deleting note:', error);
        M.toast({ html: `Помилка: Нотатка не видалена` });
      }
    };

    const closeModalNotes = () => {
      showModalNotes.value = false;
    };

    const closeDeleteNotes = () => {
      showDeleteNotes.value = false;
    };

    const openDeleteModal = (note) => {
      idNotes.value = note.id;
      noteToDelete.value = note.content || '';
      showDeleteNotes.value = true;
    };

    onMounted(fetchNotes);

    return {
      notes,
      showModalNotes,
      showDeleteNotes,
      idNotes,
      noteToDelete,
      loaded,
      closeModalNotes,
      closeDeleteNotes,
      addNote,
      deleteNote,
      openDeleteModal
    };
  }
};
</script>

<style scoped lang="scss">
$ink: #494B55;
$gold: #DAB189;
$gold-dark: #BA9571;
$sand: #EFE4D6;
$paper: #FFFDFA;
$red: #DF4545;
$ease: cubic-bezier(.22, 1, .36, 1);

.notes {
  // бічний відступ задає місце, де стоїть блок (сайдбар, панель «Острова»)
  --notes-pad: 20px;
}

.notes__title-icon {
  // загальний .menu-icon зсуває картинки вгору; векторній іконці це не потрібно
  position: static;
  top: 0;
  flex: none;
  width: 34px;
  height: 34px;
  margin-right: 10px;
  padding: 0;
}

// кнопка «Додати примітку»: плитка з плюсом, при наведенні плюс провертається, кнопкою пробігає відблиск
.notes-add {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - var(--notes-pad) * 2);
  height: 50px;
  margin: 0 var(--notes-pad) 18px;
  padding: 0 16px 0 7px;
  overflow: hidden;
  border: none;
  border-radius: 15px;
  background: $gold;
  box-shadow: 0 4px 0 $gold-dark;
  color: #fff;
  font: 800 16px/1 "Nunito", sans-serif;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform .5s $ease, box-shadow .35s $ease;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, .26) 50%, transparent 70%);
    opacity: 0;
    transform: translateX(-100%);
    transition: transform 0s linear .5s, opacity .3s ease;
    pointer-events: none;
  }

  &:focus {
    background: $gold;
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0 4px 0 $gold-dark, 0 0 0 4px rgba(56, 94, 108, .3);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 $gold-dark, 0 14px 22px -14px rgba(186, 149, 113, .9);

    &::after {
      opacity: 1;
      transform: translateX(100%);
      transition: transform 1.1s cubic-bezier(.45, 0, .2, 1), opacity .25s ease;
    }

    .notes-add__icon {
      transform: rotate(90deg);
    }
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 $gold-dark;
    transition-duration: .12s;
  }
}

.notes-add__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: rgba(255, 255, 255, .24);
  transition: transform .55s $ease;

  svg {
    width: 20px;
    height: 20px;
  }
}

.notes-add__label {
  flex: 1;
  text-align: center;
  margin-right: 36px; // текст по центру кнопки, а не по центру залишку після плитки
}

// примітки — картки
.notes-list {
  position: relative;
  margin: 0;
  padding: 0 var(--notes-pad);
  list-style: none;
}

.note-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0 0 10px;
  padding: 10px 6px 10px 14px;
  border: 2px solid $sand;
  border-radius: 14px;
  background: $paper;
  box-shadow: 0 3px 0 $sand;
  list-style: none;
  animation: note-in .5s $ease backwards; // не both: інакше анімація блокує плавний підйом при наведенні
  animation-delay: calc(var(--i, 0) * 50ms);
  transition: transform .5s $ease, border-color .35s ease, box-shadow .35s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #E3D3BF;
    box-shadow: 0 5px 0 #E3D3BF;
  }
}

.note-card__text {
  flex: 1;
  min-width: 0;
  margin: 4px 0;
  color: $ink;
  font: 700 15px/1.4 "Nunito", sans-serif;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.note-card__delete {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #A3A5AD;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color .3s ease, color .3s ease;

  svg {
    width: 19px;
    height: 19px;
  }

  :deep(.icon-trash__lid) {
    transform-box: fill-box;
    transform-origin: 20% 100%;
    transition: transform .4s $ease;
  }

  &:focus {
    background: transparent;
    outline: none;
  }

  &:hover,
  &:focus-visible {
    background: #FCE4E4;
    color: $red;

    :deep(.icon-trash__lid) {
      transform: translateY(-1.5px) rotate(-14deg);
    }
  }
}

// щойно видалена картка м'яко зсувається вбік і зникає, решта плавно підтягується
.note-move {
  transition: transform .45s $ease;
}

.note-leave-active {
  position: absolute;
  left: var(--notes-pad);
  right: var(--notes-pad);
  transition: opacity .3s ease, transform .35s $ease;
}

.note-leave-to {
  opacity: 0;
  transform: translateX(-16px) scale(.96);
}

@keyframes note-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.notes-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 var(--notes-pad) 16px;
  padding: 12px 14px;
  border: 2px dashed #E3D3BF;
  border-radius: 14px;
  color: #8A8C94;
  font: 700 14px/1.4 "Nunito", sans-serif;
}

.notes-empty__icon {
  flex: none;
  width: 24px;
  height: 24px;
  color: $gold-dark;
}

@media (prefers-reduced-motion: reduce) {
  .notes-add,
  .notes-add::after,
  .notes-add__icon,
  .note-card {
    animation: none;
    transition: none;
  }
}
</style>
