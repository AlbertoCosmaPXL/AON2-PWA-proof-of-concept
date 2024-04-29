// app.js

const notesContainer = document.getElementById('notes-container');
const noteForm = document.getElementById('note-form');

// Fetch notes from backend and display on page load
window.onload = () => {
  fetch('http://localhost:3000/items')
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
    <h3>${note.id}</h3>
    <p>${note.name}</p>
    <p>${note.done}</p>
    <button onclick="deleteNote(${note.id})">Delete</button>
  `;
  notesContainer.appendChild(noteElement);
}

 //function to add a new note
noteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const done = document.getElementById('done').value;
  fetch('http://localhost:3000/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, done })
  })
  .then(response => response.json())
  .then(data => {
    displayNote({ id: data.id, name, done });
    noteForm.reset();
  });
});

// Function to delete a note
function deleteNote(id) {
  fetch(`http://localhost:3000/items/${id}`, {
    method: 'DELETE'
  })
  .then(() => {
    document.getElementById(`note-${id}`).remove();
  });
}
