const statusDiv = document.getElementById('Status');
const fileBrowserDiv = document.getElementById('FileBrowser');
const viewerDiv = document.getElementById('Viewer');

let selectedFile = null;
let currentRootDirectory = null; // Store the root directory path

api.receive('directory-opened', (directoryPath) => {
    statusDiv.textContent = `Loaded: ${directoryPath}`;
    currentRootDirectory = directoryPath;
});

api.receive('dir-content', (dirContent) => {
    renderDirectory(dirContent, fileBrowserDiv, "", currentRootDirectory);
});

api.receive('myChannelResponse', (htmlContent) => {
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('html-content');
  contentDiv.innerHTML = htmlContent;
  while (viewerDiv.firstChild) {
    viewerDiv.removeChild(viewerDiv.firstChild);
  }
  viewerDiv.appendChild(contentDiv);
});

function renderDirectory(dirContent, parentElement, currentPath, rootDirectoryPath, isRoot = true) {
  if (!dirContent) return;

  // Render Folders
  if (dirContent.folders && dirContent.folders.length > 0) {
    dirContent.folders.forEach(folder => {
      const folderDiv = document.createElement('div');
      folderDiv.classList.add('folder');
      folderDiv.textContent = folder.name;

      const folderContentDiv = document.createElement('div');
      folderContentDiv.classList.add('folder-content', 'hidden');
      if (isRoot) {
        folderContentDiv.classList.add('folder-content-parent');
      }

      // Construct the path for the current folder.
      const newPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;

      // Recursively call renderDirectory to render the content of the current folder.
      renderDirectory(folder.items, folderContentDiv, newPath, rootDirectoryPath, false);

      // Add a click event listener to toggle the visibility of the folder's content.
      folderDiv.addEventListener('click', (event) => {
        event.stopPropagation();
        folderContentDiv.classList.toggle('hidden');
      });

      // Append the folderContentDiv to the folderDiv, and folderDiv to parentElement.
      folderDiv.appendChild(folderContentDiv);
      parentElement.appendChild(folderDiv);
    });
  }

  // Render Files
  if (dirContent.files && dirContent.files.length > 0) {
    dirContent.files.forEach(file => {
      const fileDiv = document.createElement('div');
      fileDiv.classList.add('file');
      fileDiv.textContent = file;

      fileDiv.addEventListener('click', (event) => {
        event.stopPropagation();

        // Deselect previously selected file
        if (selectedFile) {
          selectedFile.classList.remove('selected');
        }

        // Select current file
        fileDiv.classList.add('selected');
        selectedFile = fileDiv;

        // Construct the full file path.
        let filePath = rootDirectoryPath;
        if (currentPath)  {
          filePath = `${rootDirectoryPath}/${currentPath}/${file}`;
        } else {
          filePath = `${rootDirectoryPath}/${file}`;
        }

        // Send the file path to the Electron backend using the 'myChannel' channel.
        api.send('myChannel', filePath);
        // Update the status display to show the selected file path.
        statusDiv.textContent = `Selected: ${filePath}`;
      });

      // Append the fileDiv to the parentElement, adding the file to the directory listing.
      parentElement.appendChild(fileDiv);
    });
  }
}
