const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ['file-path', 'directory-opened', 'dir-content', 'open-external-link'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ['html-content', 'directory-opened', 'dir-content'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  /* Kept for documentation
  invoke: (channel, data) => {
    let validChannels = ['readFile'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
  */
});

/*
This `preload.js` script is a crucial security measure in Electron
applications. It acts as a bridge between the sandboxed renderer process (the
part that renders your UI, running JavaScript in the browser context) and the
privileged main process (which has access to system resources and APIs like
file system and operating system functions).  Here's a breakdown:

**Purpose:**

- **Security:**  Directly exposing Node.js functionality to the renderer
  process would be a major security vulnerability.  Malicious code running in
  the renderer could potentially execute arbitrary code on the user's system.
  The `preload.js` script mitigates this risk by carefully controlling what
  functionalities are exposed.
- **Isolation:** Keeps the renderer process isolated from Node.js APIs, making
  it harder for attackers to exploit vulnerabilities.
- **Controlled Communication:** Establishes a defined communication channel
  between the renderer and the main process, preventing arbitrary messages from
  being sent.

**Code Explanation:**

1. **`const { contextBridge, ipcRenderer } = require('electron');`**

  - **`contextBridge`:** This module allows you to safely expose specific APIs
    from the `preload.js` script to the renderer process.  Think of it as a
    carefully managed gateway.
  - **`ipcRenderer`:** This module allows the renderer process to communicate
    with the main process via inter-process communication (IPC).  It allows the
    renderer to *send* messages and *receive* messages from the main process.

2. **`contextBridge.exposeInMainWorld('api', { ... });`**

  - This is the core of the bridge. It creates a global object named `api` (you
    can choose a different name) in the renderer process.  This `api` object
    will contain functions that the renderer process can use to interact with
    the main process.
  - `exposeInMainWorld` effectively injects this `api` object into the
    renderer's JavaScript context, making it accessible like any other global
    variable (e.g., `window.api`).

3. **`send: (channel, data) => { ... }`**

  - This function allows the renderer process to *send* data to the main
    process.
  - **`channel`:** A string that identifies the type of message being sent.
    This acts like a "topic" or "subject" for the message.
  - **`data`:**  The data you want to send to the main process (can be any
    JavaScript object).
  - **`validChannels = ['file-path', 'directory-opened'];`**:  **Crucially,
    this is a whitelist.**  Only messages sent on the channels listed in
    `validChannels` are allowed to proceed. This prevents the renderer from
    sending arbitrary messages to the main process.
  - **`if (validChannels.includes(channel)) { ipcRenderer.send(channel, data);
    }`**: This check ensures that the specified channel is allowed. If it is,
    the message is sent to the main process using `ipcRenderer.send(channel,
    data)`. `ipcRenderer.send` is an asynchronous operation; it doesn't wait
    for a response.

4. **`receive: (channel, func) => { ... }`**

  - This function allows the renderer process to *receive* data from the main
    process.
  - **`channel`:** The name of the channel on which to listen for messages.  It
    *must* match the channel that the main process is using to send messages
    back to the renderer.
  - **`func`:** A callback function that will be executed when a message is
    received on the specified channel.  This function receives the data sent by
    the main process as arguments.
  - **`validChannels = ['myChannelResponse', 'directory-opened'];`**:  Another
    whitelist!  Only messages received on the channels listed in
    `validChannels` are processed.
  - **`ipcRenderer.on(channel, (event, ...args) => func(...args));`**:  This
    sets up an event listener on the `ipcRenderer` for the specified channel.
      - **`ipcRenderer.on`**: Registers a handler to be called when a new
        message arrives on the channel.
      - **`(event, ...args) => func(...args)`**:  This is the callback
        function.
        - **`event`**: The `event` object is the `IpcRendererEvent`.  This
          contains properties of the IPC event, including `sender`.
          **Importantly, the code deliberately strips this event before passing
          the arguments to the user-defined `func`.**  This is a critical
          security measure.  Exposing the `event.sender` object to the renderer
          would allow the renderer to spoof messages from the main process,
          bypassing the security protections.
        - **`...args`**:  This uses the "rest" parameter syntax to collect all
          the arguments after the `event` object into an array named `args`.
          These are the actual data that was sent by the main process.
        - **`func(...args)`**:  This calls the user-defined callback function
          (`func`) and passes the data received from the main process as
          arguments.  This is how the renderer process gets the data.

5. **`invoke: (channel, data) => { ... }`**

  - This function enables the renderer process to make a *synchronous* request
    to the main process and *receive a response*. It's used when the renderer
    needs a value back from the main process immediately.
  - **`channel`:** The name of the channel to use for the invocation.
  - **`data`:** The data to send to the main process.
  - **`validChannels = ['myInvokeChannel'];`**: Another whitelist!
  - **`return ipcRenderer.invoke(channel, data);`**:  This sends the invocation
    request to the main process. `ipcRenderer.invoke` returns a `Promise` that
    resolves with the value returned by the main process. This makes the
    communication synchronous from the perspective of the renderer process.
*/
