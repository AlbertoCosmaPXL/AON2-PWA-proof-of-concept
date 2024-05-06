<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const notesRef = ref([]);
const showAddNotes = ref(false);
const newNote = ref({ title: "", content: "" });
let db;

onMounted(() => {
  initializeDB();
});

async function initializeDB() {
  const request = indexedDB.open("NotesDatabase", 1);

  request.onerror = (event) => console.error("IndexedDB error:", event);

  request.onupgradeneeded = function (event) {
    console.log("Upgrade needed");
    db = event.target.result;
    const store = db.createObjectStore("Notes", { keyPath: "id", autoIncrement: true });
    store.createIndex("title", "title", { unique: false });
    store.createIndex("content", "content", { unique: false });
  };

  request.onsuccess = async function (event) {
    console.log("IndexedDB success");
    db = event.target.result;
    await fetchNotesFromBackend(); // Haal notities op uit backend
  };
}


async function fetchNotesFromDB() {
  if (!db) return;
  const transaction = db.transaction("Notes", "readonly");
  const store = transaction.objectStore("Notes");
  const getAllNotes = store.getAll();

  return new Promise((resolve, reject) => {
    getAllNotes.onsuccess = function (event) {
      notesRef.value = event.target.result;
      resolve();
    };
    getAllNotes.onerror = function (event) {
      reject(event.target.error);
    };
  });
}

async function fetchNotesFromBackend() {
  try {
    const response = await axios.get("http://localhost:3000/notes");
    await saveNotesToDB(response.data); // Sla notities op in IndexedDB
    await fetchNotesFromDB(); // Haal notities op uit IndexedDB en werk notesRef bij
  } catch (error) {
    console.error("Fout bij het ophalen van notities van de server:", error);
  }
}


async function saveNotesToDB(notes) {
  if (!db) return;

  const transaction = db.transaction("Notes", "readwrite");
  const store = transaction.objectStore("Notes");

  await clearStore(store);

  notes.forEach(note => {
    store.add(note);
  });
}

async function clearStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function addNote() {
  const note = { ...newNote.value };

  if (!note.id) {
    note.id = Date.now() + ""; // Gebruik milliseconden sinds de epoch als ID => altijd uniek
  }

  notesRef.value.push(note);
  saveNoteToDB(note);
  try {
    console.log(note)
    saveNoteToServer(note);
  }
  catch {console.warn("Failed to save note to server")}

  newNote.value = { title: "", content: "" };
  displayAddNote();

}

function saveNoteToDB(note) {
  if (!db) return;
  const transaction = db.transaction("Notes", "readwrite");
  const store = transaction.objectStore("Notes");

  if (!note.id) {
    const request = store.add(note);
    request.onerror = function (event) {
      console.error("IndexedDB add error:", event.target.error);
    };
  } else {
    const request = store.put(note);
    request.onerror = function (event) {
      console.error("IndexedDB put error:", event.target.error);
    };
  }
}

async function deleteNote(id) {
  if (!db) return;
  const transaction = db.transaction("Notes", "readwrite");
  const store = transaction.objectStore("Notes");
  store.delete(id);
  fetchNotesFromDB();

  try {
    await axios.delete(`http://localhost:3000/notes/${id}`);
  }
  catch {
    console.log("Verwijderen van de note uit server niet gelukt")
  }
}

async function removeAllNotesFromServer() {
  try {
    const response = await axios.get("http://localhost:3000/notes");
    const notes = response.data;

    for (const note of notes) {
      await axios.delete(`http://localhost:3000/notes/${note.id}`)
    }

    console.log("Alle notities van de server zijn verwijderd.");
  } catch (error) {
    console.error("Fout bij het verwijderen van notities van de server:", error);
  }
}

async function saveNoteToServer(note) {
  try {
    await axios.post("http://localhost:3000/notes", note);
    console.log("Notitie succesvol opgeslagen op de server:", note);
  } catch (error) {
    console.error("Fout bij het opslaan van notitie op de server:", error);
  }
}

async function syncNotesWithBackend() {
  console.log('Syncing with backend.')
  await removeAllNotesFromServer();

  const transaction = db.transaction("Notes", "readonly");
  const store = transaction.objectStore("Notes");
  const getAllNotes = store.getAll();

  getAllNotes.onsuccess = async function (event) {
    const notes = event.target.result;
    for (const note of notes) {
      await saveNoteToServer(note);
    }
    await fetchNotesFromBackend();
    console.log("Alle notities zijn gesynchroniseerd met de server.");
  };
}

window.addEventListener("online", () => {
  syncNotesWithBackend();
});

const displayAddNote = () => {
  showAddNotes.value = !showAddNotes.value;
};
</script>

<template>
  <main>
    <header>
      <h1>Mijn notities</h1>
      <button class="AddNoteButton" @click="displayAddNote">+</button>
    </header>

    <section id="notes-container">
      <div v-bind:key="note.id" v-for="note of notesRef" class="note">
        <div class="noteHeader">
          <h3>{{ note.title }}</h3>
          <button class="deleteButton" @click="deleteNote(note.id)">X</button>
        </div>
        <p class="notep">{{ note.content }}</p>
      </div>
    </section>
  </main>

  <div v-if="showAddNotes" class="AddNote">
    <div class="AddNoteInner">
      <div class="addNoteHeader">
        <h1>Notitie toevoegen:</h1>
        <button class="closeWindow" @click="displayAddNote">X</button>
      </div>
      <div class="form" id="note-form">
        <input type="text" id="addTitle" placeholder="Titel" v-model="newNote.title">
        <textarea id="addContent" placeholder="Omschrijving" v-model="newNote.content"></textarea>
        <button @click="addNote">Toevoegen</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: Arial, sans-serif;
}

main {
  margin-top: 10px;
  width: 70%;
  margin-left: auto;
  margin-right: auto;
}

header {
  display: flex;
  justify-content: space-between;
}

h1 {
  margin-left: 15px;
  font-weight: bold;
}

#notes-container {
  display: flex;
  justify-content: start;
  flex-flow: wrap;
}

p {
  margin: 0;
  margin-bottom: 15px;
}

.note {
  border-radius: 40px;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 10px;
  padding-bottom: 20px;
  background: #ffe992;
  margin: 10px;
  width: 31%;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;

}

.AddNoteButton {
  border-radius: 100%;
  width: 70px;
  height: 70px;
  border: 0px;
  background: darkgrey;
  color: white;
  font-size: 40px;
  cursor: pointer;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

.noteHeader {
  display: flex;
  justify-content: space-between;
}

.noteHeader h3 {
  font-weight: bold;
  font-size: 1.3em;
}

.deleteButton {
  top: 0;
  background: #ff6f6f;
  color: white;
  border: 0;
  padding: 10px;
  border-radius: 15px;
  height: 30px;
  width: 30px;
  margin-left: 72px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  line-height: 12px;
}

.AddNote {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.57);
  height: 100%;
  width: 100%;
}

.AddNoteInner {
  background-color: white;
  width: 50%;
  height: 50%;
  position: absolute;
  top: 25%;
  left: 25%;
  padding: 20px;
  display: flex;
  flex-direction: column;

  border-radius: 25px;
  z-index: 15;
}

.AddNoteInner h1 {
  margin-left: 10%;
}

.form {
  display: flex;
  flex-direction: column;
  width: 80%;
  margin-left: 10%;
  margin-right: 10%;
}

input {
  margin-bottom: 20px;
  height: 40px;
  font-size: 20px;
  padding-left: 10px;
  border-radius: 15px;
  border: 2px solid lightgray;
}

textarea {
  margin-bottom: 20px;
  font-size: 20px;
  padding-left: 10px;
  height: 300px;
  border-radius: 15px;
  border: 2px solid lightgray;
}

.form button {
  height: 40px;
  font-size: 20px;
  background: #027705;
  color: white;
  border: 0;
  border-radius: 15px;
}

.addNoteHeader {
  display: flex;
  justify-content: space-between;
}

.closeWindow {
  background: #ff6f6f;
  color: white;
  border: 0;
  padding: 10px;
  border-radius: 15px;
  height: 30px;
  width: 30px;
  margin-left: 72px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  line-height: 12px;
}
</style>