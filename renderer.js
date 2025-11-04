//const { api } = window;

const statusDiv = document.getElementById('Status');

api.receive('directory-opened', (directoryPath) => {
  statusDiv.textContent = `Loaded: ${directoryPath}`;
});

api.receive('dir-content', (dirContent) => {
  console.log(dirContent);
});