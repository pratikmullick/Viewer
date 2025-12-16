# Viewer - An Electron-based Markdown Viewer
Viewer is a simple Electron-based application for viewing rendered output of
Markdown files within a given directory structure, with strong emphasis on
security, content and context isolation, and a consistent user experience.

## Features

- **Standardized Markdown Rendering**: Renders Markdown into easily readable
  HTML using [Remarkable](https://github.com/jonschlinkert/remarkable), a fast
  Markdown parser.
- **Dynamic File Browser**: The custom dynamic recursive file browser handles
  complex directory structures with an intuitive tree hierarchy identifier.
- **System Theme Support**: Auto-detects system theme (light / dark) for a
  consistent user experience.
- **Security**: Utilizes optimal security practices to isolate content
  from all external sources. All links are by default opened by the operating
  system's default browser.
- **Configurable**: Can be configured to load a default directory at start-up.
- **Consistent UI**: Uses publicly available high-quality typography for
  exceptional readability in all conditions.

## Getting Started

### Installation

- **Installation from Source**
  1.  Download the git repository
      ```
      git clone https://github.com/pratikmullick/Viewer.git
      ```
  2.  Install dependencies
      ```
      npm install
      ```
  3.  Run
      ```
      npm start
      ```

### Configuration
Viewer can be configured to load a default directory when the application
starts. Given below are the steps to pre-configure the application:
1.  Create a directory named `.viewer` in your home directory
    - Windows: `%USERPROFILE%\.viewer`
    - UNIX: `~/.viewer`
2.  Create a file named `config.json` inside the user directory.
3.  Add the following JSON structure to `config.json`, replacing the path value
    to the path of an actual directory containing Markdown files:
    ```json
    {
      "default_directory": "<path/to/default/directory>"
    }
    ```

## Author
- [Pratik Mullick](https://github.com/pratikmullick)

Further contributions are welcome from other users. Please submit a pull
request with your contributions. If you detect issues, you are more than
welcome to submit them on the
[Issues][issues] tracker.

## License
This software is licensed under the GNU GENERAL PUBLIC LICENSE Version 3. For
more information, refer to the [LICENSE](LICENSE) file attached herewith.

[issues]: https://github.com/pratikmullick/Viewer/issues
