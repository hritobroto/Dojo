interface Task {
    id: string;
    title: string;
    completed: boolean;
    order: number;
    category: string;
}

class DojoApp {
    private board: HTMLElement;
    private addColumnBtn: HTMLButtonElement;
    private menuToggle: HTMLButtonElement;
    private sidebar: HTMLElement;
    private themeToggle: HTMLButtonElement;
    private categories: string[] = ['To Do', 'In Progress', 'Done'];

    constructor() {
        this.board = document.getElementById('board') as HTMLElement;
        this.addColumnBtn = document.getElementById('addColumnBtn') as HTMLButtonElement;
        this.menuToggle = document.getElementById('menuToggle') as HTMLButtonElement;
        this.sidebar = document.getElementById('sidebar') as HTMLElement;
        this.themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
        this.init();
    }

    private async init(): Promise<void> {
        this.loadTheme();
        this.loadTasks();
        this.setupEventListeners();
    }

    private loadTheme(): void {
        const theme = localStorage.getItem('theme') || 'light';
        document.body.classList.add(theme);
    }

    private toggleTheme(): void {
        const isLight = document.body.classList.contains('light');
        document.body.classList.toggle('light', !isLight);
        document.body.classList.toggle('dark', isLight);
        localStorage.setItem('theme', isLight ? 'dark' : 'light');
    }

    private toggleSidebar(): void {
        this.sidebar.classList.toggle('active');
    }

    private setupEventListeners(): void {
        this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.addColumnBtn.addEventListener('click', () => this.addColumn());
        this.board.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.board.addEventListener('drop', (e) => this.handleDrop(e));
        this.board.addEventListener('dragend', () => this.handleDragEnd());
        this.setupColumnListeners();
        this.setupColumnDragListeners();
    }

    private setupColumnListeners(): void {
        this.categories.forEach(category => {
            const column = document.querySelector(`.column[data-category="${category}"]`) as HTMLElement;
            if (column) {
                const form = column.querySelector('.task-form') as HTMLFormElement;
                const taskList = column.querySelector('.task-list') as HTMLElement;
                const removeBtn = column.querySelector('.remove-column') as HTMLButtonElement;
                form.addEventListener('submit', (e) => this.handleSubmit(e, category));
                taskList.addEventListener('dragstart', (e) => this.handleDragStart(e));
                removeBtn.addEventListener('click', () => this.removeColumn(category));
            }
        });
    }

    private setupColumnDragListeners(): void {
        this.categories.forEach(category => {
            const column = document.querySelector(`.column[data-category="${category}"]`) as HTMLElement;
            if (column) {
                column.draggable = true;
                column.addEventListener('dragstart', (e) => this.handleColumnDragStart(e));
            }
        });
    }

    private async loadTasks(): Promise<void> {
        const response = await fetch('/api/tasks');
        const tasks: Task[] = await response.json();
        this.categories.forEach(category => {
            const column = document.querySelector(`.column[data-category="${category}"]`) as HTMLElement;
            if (column) {
                const taskList = column.querySelector('.task-list') as HTMLElement;
                taskList.innerHTML = '';
                const categoryTasks = tasks.filter(task => task.category === category)
                    .sort((a, b) => a.order - b.order);
                categoryTasks.forEach(task => this.renderTask(task, taskList));
            }
        });
    }

    private async handleSubmit(e: Event, category: string): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const input = form.querySelector('input') as HTMLInputElement;
        const task: Task = {
            id: '',
            title: input.value,
            completed: false,
            order: 0,
            category: category
        };

        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        const newTask = await response.json();
        const taskList = form.nextElementSibling as HTMLElement;
        this.renderTask(newTask, taskList);
        input.value = '';
    }

    private renderTask(task: Task, taskList: HTMLElement): void {
        const li = document.createElement('div');
        li.className = 'task-item';
        li.draggable = true;
        li.dataset.id = task.id;
        li.dataset.category = task.category;
        li.innerHTML = `
            <div class="task-item-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span>${task.title}</span>
                <button>✖</button>
            </div>
        `;
        if (task.completed) li.classList.add('completed');

        li.querySelector('input')?.addEventListener('change', () => this.toggleTask(task));
        li.querySelector('button')?.addEventListener('click', () => this.deleteTask(task.id));
        taskList.appendChild(li);
    }

    private async toggleTask(task: Task): Promise<void> {
        task.completed = !task.completed;
        await fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        this.refreshTasks();
    }

    private async deleteTask(id: string): Promise<void> {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        this.refreshTasks();
    }

    private handleDragStart(e: DragEvent): void {
        const target = e.target as HTMLElement;
        if (target.classList.contains('task-item')) {
            e.dataTransfer?.setData('text/plain', target.dataset.id || '');
            target.classList.add('dragging');
        }
    }

    private handleColumnDragStart(e: DragEvent): void {
        const target = e.target as HTMLElement;
        if (target.classList.contains('column')) {
            e.dataTransfer?.setData('text/plain', target.dataset.category || '');
            target.classList.add('dragging');
        }
    }

    private handleDragOver(e: DragEvent): void {
        e.preventDefault();
        const dragging = this.board.querySelector('.dragging') as HTMLElement;
        if (dragging.classList.contains('task-item')) {
            const target = (e.target as HTMLElement).closest('.task-item') as HTMLElement | null;
            const targetList = (e.target as HTMLElement).closest('.task-list') as HTMLElement | null;
            if (target && target !== dragging) {
                const allItems = Array.from(target.parentElement!.children) as HTMLElement[];
                const draggingIndex = allItems.indexOf(dragging);
                const targetIndex = allItems.indexOf(target);
                if (draggingIndex < targetIndex) {
                    target.after(dragging);
                } else {
                    target.before(dragging);
                }
            } else if (targetList && !targetList.contains(dragging)) {
                targetList.appendChild(dragging);
            }
        } else if (dragging.classList.contains('column')) {
            const target = (e.target as HTMLElement).closest('.column') as HTMLElement | null;
            if (target && target !== dragging && !target.classList.contains('add-column')) {
                const allColumns = Array.from(this.board.children) as HTMLElement[];
                const draggingIndex = allColumns.indexOf(dragging);
                const targetIndex = allColumns.indexOf(target);
                if (draggingIndex < targetIndex) {
                    target.after(dragging);
                } else {
                    target.before(dragging);
                }
            }
        }
    }

    private async handleDrop(e: DragEvent): Promise<void> {
        e.preventDefault();
        const draggedId = e.dataTransfer?.getData('text/plain');
        const draggedElement = document.querySelector(`[data-id="${draggedId}"]`) as HTMLElement;
        const draggedColumn = document.querySelector(`.column[data-category="${draggedId}"]`) as HTMLElement;

        if (draggedElement) {
            // Task drop
            const newCategory = draggedElement.closest('.column')?.getAttribute('data-category') || draggedElement.dataset.category;
            draggedElement.dataset.category = newCategory;

            const allTasks: Task[] = [];
            this.categories.forEach(category => {
                const taskList = document.querySelector(`.column[data-category="${category}"] .task-list`) as HTMLElement;
                if (taskList) {
                    const items = Array.from(taskList.children) as HTMLElement[];
                    items.forEach((item, index) => {
                        allTasks.push({
                            id: item.dataset.id || '',
                            title: item.querySelector('span')?.textContent || '',
                            completed: item.classList.contains('completed'),
                            order: index,
                            category: category
                        });
                    });
                }
            });

            await fetch('/api/tasks/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allTasks)
            });
            this.refreshTasks();
        } else if (draggedColumn) {
            // Column drop
            this.categories = Array.from(this.board.children)
                .filter(child => child.classList.contains('column') && !child.classList.contains('add-column'))
                .map(column => column.getAttribute('data-category') || '');
        }
    }

    private handleDragEnd(): void {
        const dragging = this.board.querySelector('.dragging') as HTMLElement;
        if (dragging) dragging.classList.remove('dragging');
    }

    private async refreshTasks(): Promise<void> {
        this.loadTasks();
    }

    private addColumn(): void {
        const category = prompt('Enter new column name:');
        if (category && !this.categories.includes(category)) {
            this.categories.push(category);
            const column = document.createElement('div');
            column.className = 'column';
            column.dataset.category = category;
            column.draggable = true;
            column.innerHTML = `
                <div class="column-header">
                    <h2>${category}</h2>
                    <button class="remove-column">✖</button>
                </div>
                <form class="task-form">
                    <input type="text" placeholder="Add new task..." required>
                    <button type="submit">+</button>
                </form>
                <div class="task-list"></div>
            `;
            this.board.insertBefore(column, this.addColumnBtn.parentElement);
            this.setupColumnListeners();
            this.setupColumnDragListeners();
        }
    }

    private removeColumn(category: string): void {
        if (this.categories.length <= 1) {
            alert('You must have at least one column.');
            return;
        }
        if (confirm(`Are you sure you want to remove the "${category}" column? All tasks will be deleted.`)) {
            this.categories = this.categories.filter(cat => cat !== category);
            const column = document.querySelector(`.column[data-category="${category}"]`) as HTMLElement;
            column.remove();
            // Optionally, delete tasks from the backend
            fetch(`/api/tasks/category/${category}`, { method: 'DELETE' });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new DojoApp());