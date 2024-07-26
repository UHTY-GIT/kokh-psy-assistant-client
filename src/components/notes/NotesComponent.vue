<!-- src/components/notes/NotesComponent.vue -->
<template>
  <div>
    <div class="title-notification">
      <img class="menu-icon" src="@/assets/icons/Speech%20Balloon.svg" alt="icon Notification">
      <span>Примітка</span>
    </div>
    <div class="button-add-notf">
      <button class="btn" @click="showModalNotes = true">
        <img src="@/assets/icons/more.svg" alt="icon add">
        <span>Додати примітку</span>
      </button>
    </div>
    <div class="block-notification" v-for="note in notes" :key="note.id">
      <div class="notification-text">
        <img src="@/assets/icons/trash-notes.svg" alt="icon delete" @click="openDeleteModal(note.id)">
        <span>{{ note.content }}</span>
      </div>
    </div>
    <!--  Модальне вікно щоб додати нотатку-->
    <ModalNotesAdd
        v-if="showModalNotes"
        :showModal="showModalNotes"
        @close="closeModalNotes"
        @confirm="addNote"
    />
    <!--  Модальне вікно для видалення нотатки -->
    <ModalNotesDelete
        v-if="showDeleteNotes"
        :showModal="showDeleteNotes"
        :idNotes="idNotes"
        @close="closeDeleteNotes"
        @confirm="deleteNote"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import apiService from '@/services/apiService';
import ModalNotesAdd from "@/components/modal/ModalNotesAdd.vue";
import ModalNotesDelete from "@/components/modal/ModalNotesDelete.vue";
import M from "materialize-css";

export default {
  components: {
    ModalNotesAdd,
    ModalNotesDelete
  },
  setup() {
    const notes = ref([]);
    const showModalNotes = ref(false);
    const showDeleteNotes = ref(false);
    const idNotes = ref(null);

    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiService.getNotes(token);
        notes.value = response.data;
      } catch (error) {
        console.error('Error fetching notes:', error);
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

    const openDeleteModal = (noteId) => {
      idNotes.value = noteId;
      showDeleteNotes.value = true;
    };

    onMounted(fetchNotes);

    return {
      notes,
      showModalNotes,
      showDeleteNotes,
      idNotes,
      closeModalNotes,
      closeDeleteNotes,
      addNote,
      deleteNote,
      openDeleteModal
    };
  }
};
</script>
