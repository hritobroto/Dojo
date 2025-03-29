# Dojo

A modern to-do list application featuring sticky note-style tasks in a Kanban board layout. Built with Javalin (backend) and TypeScript (frontend), supporting drag-and-drop across columns and light/dark themes.

## Features
- **Kanban Board**: Organize tasks into columns (e.g., To Do, In Progress, Done).
- **Sticky Notes**: Tasks styled as colorful sticky notes.
- **Drag-and-Drop**: Move tasks within and across columns.
- **Theme Toggle**: Switch between dark and light modes.
- **Responsive Design**: Works on desktop and mobile.
- **REST API**: Backend powered by Javalin 6.4.0.

## Prerequisites
- **Java 17**: Ensure JDK 17 is installed (run `java -version` to check).
- **Maven**: For building the Java backend.
- **Node.js and npm**: For building the TypeScript frontend.
- **Make**: Optional, for using the Makefile.

## Setup and Running

### Using Makefile (Recommended)
1. **Build the project**: Run `make build` in the terminal.
2. **Run the application**: Run `make run` in the terminal.
3. Open `http://localhost:8080` in your browser.

### Manual Steps
1. **Build the frontend**: Navigate to the frontend directory with `cd src/main/resources/public`, then run `npm install` followed by `npm run build`.
2. **Build the backend**: Return to the root directory with `cd -`, then run `mvn clean package`.
3. **Run the application**: Execute `java -jar target/Dojo-1.0-SNAPSHOT-jar-with-dependencies.jar`.
4. Open `http://localhost:8080` in your browser.

## Usage
- **Add Tasks**: Use the form in each column to add tasks.
- **Move Tasks**: Drag tasks within a column to reorder, or across columns to change categories.
- **Toggle Completion**: Check the box to mark a task as completed.
- **Delete Tasks**: Click the ✕ button to remove a task.
- **Add Columns**: Click the + button to add a new column.
- **Switch Themes**: Use the "Toggle Theme" button in the sidebar.

## Development
- **Frontend**: Edit `app.ts` and `styles.css` in `src/main/resources/public/`. Run `npm run build` to compile TypeScript.
- **Backend**: Edit Java files in `src/main/java/com/dojo/`. Use `mvn clean package` to build.

## Notes
- Tasks are stored in memory and will reset on server restart.
- The cyberpunk theme uses neon colors and animations for a futuristic feel. (Deprecated - theme too bright for the app simplicity)

## License
MIT License