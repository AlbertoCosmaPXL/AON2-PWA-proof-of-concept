<script setup>
  import {ref} from "vue";
  import axios from "axios"

  const notesRef = ref([]);
  const showAddNotes = ref(false);

  const newNote = ref(
    {
      title: "",
      content: ""
    }
  )

  fetch('http://localhost:3000/notes')
    .then(response => response.json())
    .then(notes => {
      notes.forEach(note => {
        notesRef.value.push(note);
      });
    });


  function deleteNote(id) {
    fetch(`http://localhost:3000/notes/${id}`, {
      method: 'DELETE'
    })
    .then(() => {
      location.reload();
    });
  }
  function displayAddNote() {
    if (showAddNotes.value === false) {
      showAddNotes.value = true; // Set this to whatever it was initially
    } else {
      showAddNotes.value = false;
    }
  }

  function addNote(){
    axios.post(`http://localhost:3000/notes/`, newNote.value);
    displayAddNote()
    location.reload();
  }
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
          <h3>{{note.title}}</h3>
          <button class="deleteButton" @click="deleteNote(note.id)">X</button>
      </div>
      <p class="notep">{{note.content}}</p>
    </div>
  </section>
  </main>
  <div v-if="showAddNotes" class="AddNote" >
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