<script setup>
  import { ref, onMounted, watch } from "vue";
  import axios from "axios";

  const notesRef = ref([]);
  const showAddNotes = ref(false);
  const newNote = ref({ title: "", content: "" });

  let db;

  onMounted(() => {
    const request = indexedDB.open("NotesDatabase", 1);

    request.onerror = function (event) {
      console.error("IndexedDB error");
      console.error(event);
    };

    request.onupgradeneeded = function () {
      db = request.result;
      const store = db.createObjectStore("Notes", { keyPath: "id", autoIncrement: true });
      store.createIndex("title", "title", { unique: false });
      store.createIndex("content", "content", { unique: false });
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      fetchNotesFromDB();
      if (navigator.onLine) {
        fetchNotesFromBackend(); // Probeer notities van de backend op te halen als er een internetverbinding is
      }
    };
  });

  // Haal notities op van IndexedDB
  function fetchNotesFromDB() {
    if (!db) return;
    const transaction = db.transaction("Notes", "readonly");
    const store = transaction.objectStore("Notes");
    const getAllNotes = store.getAll();

    getAllNotes.onsuccess = function(event) {
      notesRef.value = event.target.result;
    };
  }

  // Haal notities op van de backend
  function fetchNotesFromBackend() {
    axios.get("http://localhost:3000/notes")
      .then(response => {
        notesRef.value = response.data;
        saveNotesToDB(response.data); // Sla notities op in IndexedDB
      })
      .catch(error => {
        console.error("Fout bij het ophalen van notities van de server:", error);
      });
  }

  // Sla notities op in IndexedDB
  function saveNotesToDB(notes) {
    if (!db) return;
    const transaction = db.transaction("Notes", "readwrite");
    const store = transaction.objectStore("Notes");
    notes.forEach(note => {
      store.add(note);
    });
  }

// Voeg een nieuwe notitie toe
function addNote() {
  const note = { ...newNote.value };

  // Als de notitie geen ID heeft, voeg een nieuwe ID toe
  if (!note.id) {
    note.id = Date.now(); // Gebruik milliseconden sinds de epoch als ID
  }

  notesRef.value.push(note);
  saveNoteToDB(note); // Sla notitie op in IndexedDB
  newNote.value = { title: "", content: "" }; // Leeg het invoerveld
}



// Sla een enkele notitie op in IndexedDB
function saveNoteToDB(note) {
  if (!db) return;
  const transaction = db.transaction("Notes", "readwrite");
  const store = transaction.objectStore("Notes");

  if (!note.id) {
    const request = store.add(note); // Voeg een nieuwe notitie toe met een auto-incremented ID
    request.onerror = function(event) {
      console.error("IndexedDB add error:", event.target.error);
    };
  } else {
    const request = store.put(note); // Werk de bestaande notitie bij
    request.onerror = function(event) {
      console.error("IndexedDB put error:", event.target.error);
    };
  }
}


  // Verwijder een notitie
  function deleteNote(id) {
    if (!db) return;
    const transaction = db.transaction("Notes", "readwrite");
    const store = transaction.objectStore("Notes");
    store.delete(id);
    fetchNotesFromDB(); // Opnieuw laden van notities na verwijdering
  }

  // Kijk naar veranderingen in de internetverbinding
  watch(
    () => navigator.onLine,
    (isOnline) => {
      if (isOnline) {
        fetchNotesFromBackend(); // Haal notities opnieuw op van de backend als de internetverbinding hersteld is
      }
    }
  );

  // Functie om het weergeven van de notitie toevoegen/verbergen te schakelen
  const displayAddNote = () => {
    showAddNotes.value = !showAddNotes.value;
  };
</script>

<template>
  <main>
    <header>
      <h1>Mijn notities</h1>
      <button class="AddNoteButton" @click="displayAddNote()">+</button>
    </header>

    <section id="notes-container">
      <div v-bind:key="note.id" v-for="note in notesRef" class="note">
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
        <button class="closeWindow" @click="displayAddNote()">X</button>
      </div>
      <div class="form" id="note-form">
        <input type="text" id="addTitle" placeholder="Titel" v-model="newNote.title">
        <textarea id="addContent" placeholder="Omschrijving" v-model="newNote.content"></textarea>
        <button @click="addNote()">Toevoegen</button>
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
  .noteHeader{
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
  margin-left:72px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  line-height:12px;
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
  margin-left:72px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  line-height:12px;
}
</style>