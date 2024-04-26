// app.js

const notesContainer = document.getElementById('notes-container');
const noteForm = document.getElementById('note-form');

// Fetch notes from backend and display on page load
window.onload = () => {
  fetch('/notes')
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
  noteElement.innerHTML = `
    <h3>${note.title}</h3>
    <p>${note.content}</p>
    <button onclick="deleteNote(${note.id})">Delete</button>
  `;
  notesContainer.appendChild(noteElement);
}

// Function to add a new note
noteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  fetch('/notes', {
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
  });
});

// Function to delete a note
function deleteNote(id) {
  fetch(`/notes/${id}`, {
    method: 'DELETE'
  })
  .then(() => {
    document.getElementById(`note-${id}`).remove();
  });
}
