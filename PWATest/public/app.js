// app.js

const notesContainer = document.getElementById('notes-container');
const noteForm = document.getElementById('note-form');

// Fetch notes from backend and display on page load
window.onload = () => {
  fetch('http://localhost:3000/notes')
    .then(response => response.json())
    .then(notes => {
      notes.forEach(note => {
        displayNote(note);
      });
    });
};

// Function to display a single note
function displayNote(note) {
  const noteElement = document.createElement('div');
  noteElement.classList.add('note');
  noteElement.setAttribute("id",`note-${note.id}`)
  noteElement.innerHTML = `
    <div class="noteHeader">
    <h3>${note.title}</h3>
    <button class="deleteButton" onclick="deleteNote(${note.id})">X</button>
    </div>
    <p>${note.content}</p>
    
  `;
  notesContainer.appendChild(noteElement);
}

 //function to add a new note
noteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById('addTitle').value;
  const content = document.getElementById('addContent').value;
  fetch('http://localhost:3000/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, content })
  })
  .then(response => response.json())
  .then(data => {
    displayNote({ id: data.id, title, content });
    noteForm.reset();
    displayAddNote();
  });
});

// Function to delete a note
function deleteNote(id) {
  fetch(`http://localhost:3000/notes/${id}`, {
    method: 'DELETE'
  })
  .then(() => {
    document.getElementById(`note-${id}`).remove();
  });
}

function displayAddNote() {
  const addNoteView = document.getElementsByClassName('AddNote')[0];
  if (addNoteView.style.display === 'none') {
    addNoteView.style.display = 'block'; // Set this to whatever it was initially
  } else {
    addNoteView.style.display = 'none';
  }
}
