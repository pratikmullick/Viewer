const statusDiv = document.getElementById('Status');
const fileBrowserDiv = document.getElementById('FileBrowser');
const viewerDiv = document.getElementById('Viewer');

let selectedFile = null;
let currentRootDirectory = null;
let htmlContentCallCount = 0;

/* API Calls */
api.receive('directory-opened', (directoryPath) => {
    statusDiv.textContent = `Loaded: ${directoryPath}`;
    currentRootDirectory = directoryPath;
});

api.receive('dir-content', (dirContent) => {
  while (fileBrowserDiv.firstChild) {
    fileBrowserDiv.removeChild(fileBrowserDiv.firstChild);
  }
  renderDirectory(dirContent, fileBrowserDiv, "", currentRootDirectory);
});

api.receive('html-content', (htmlContent) => {
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('html-content');
  contentDiv.innerHTML = htmlContent;
  while (viewerDiv.firstChild) {
    viewerDiv.removeChild(viewerDiv.firstChild);
  }
  if (htmlContentCallCount)
    viewerDiv.removeEventListener('click', linkClick);
  viewerDiv.addEventListener('click', linkClick);
  viewerDiv.appendChild(contentDiv);
  htmlContentCallCount++;
});

api.receive('theme-update', (theme) => {
  document.documentElement.setAttribute('system-theme', theme);
});

/* Function Definitions */
function renderDirectory(dirContent, parentElement, currentPath, rootDirectoryPath, isRoot = true) {
  if (!dirContent) return;

  /* Render Folders */
  if (dirContent.folders && dirContent.folders.length > 0) {
    dirContent.folders.forEach(folder => {
      const folderDiv = document.createElement('div');
      folderDiv.classList.add('folder');
      folderDiv.textContent = folder.name;

      const folderContentDiv = document.createElement('div');
      folderContentDiv.classList.add('folder-content', 'hidden');

      const newPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
      renderDirectory(folder.items, folderContentDiv, newPath, rootDirectoryPath, false);
      folderDiv.addEventListener('click', (event) => {
        event.stopPropagation();
        folderContentDiv.classList.toggle('hidden');
      });

      /* Append the folderContentDiv to the folderDiv, and folderDiv to parentElement. */
      folderDiv.appendChild(folderContentDiv);
      parentElement.appendChild(folderDiv);
    });
  }

  /* Render Files */
  if (dirContent.files && dirContent.files.length > 0) {
    dirContent.files.forEach(file => {
      const fileDiv = document.createElement('div');
      fileDiv.classList.add('file');
      fileDiv.textContent = file;

      fileDiv.addEventListener('click', (event) => {
        event.stopPropagation();

        /* Deselect previously selected file */
        if (selectedFile) {
          selectedFile.classList.remove('selected');
        }

        /* Select current file */
        fileDiv.classList.add('selected');
        selectedFile = fileDiv;

        /* Construct the full file path. */
        let filePath = rootDirectoryPath;
        if (currentPath)  {
          filePath = `${rootDirectoryPath}/${currentPath}/${file}`;
        } else {
          filePath = `${rootDirectoryPath}/${file}`;
        }

        /* Send file path to backend. */
        api.send('file-path', filePath);
        statusDiv.textContent = `Selected: ${filePath}`;
      });
      parentElement.appendChild(fileDiv);
    });
  }
}

function linkClick(event) {
  if (event.target.tagName === 'A') {
    event.preventDefault();
    const url = event.target.href;
    api.send('open-external-link', url);
  }
}