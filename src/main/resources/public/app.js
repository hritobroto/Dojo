"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class DojoApp {
    constructor() {
        this.categories = ['To Do', 'In Progress', 'Done'];
        this.board = document.getElementById('board');
        this.addColumnBtn = document.getElementById('addColumnBtn');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadTheme();
            this.loadTasks();
            this.setupEventListeners();
        });
    }
    loadTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.body.classList.add(theme);
    }
    toggleTheme() {
        const isLight = document.body.classList.contains('light');
        document.body.classList.toggle('light', !isLight);
        document.body.classList.toggle('dark', isLight);
        localStorage.setItem('theme', isLight ? 'dark' : 'light');
    }
    toggleSidebar() {
        this.sidebar.classList.toggle('active');
    }
    setupEventListeners() {
        this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.addColumnBtn.addEventListener('click', () => this.addColumn());
        this.board.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.board.addEventListener('drop', (e) => this.handleDrop(e));
        this.board.addEventListener('dragend', () => this.handleDragEnd());
        this.setupColumnListeners();
        this.setupColumnDragListeners();
    }
    setupColumnListeners() {
        this.categories.forEach(category => {
            const column = document.querySelector(`.column[data-category="${category}"]`);
            if (column) {
                const form = column.querySelector('.task-form');
                const taskList = column.querySelector('.task-list');
                const removeBtn = column.querySelector('.remove-column');
                form.addEventListener('submit', (e) => this.handleSubmit(e, category));
                taskList.addEventListener('dragstart', (e) => this.handleDragStart(e));
                removeBtn.addEventListener('click', () => this.removeColumn(category));
            }
        });
    }
    setupColumnDragListeners() {
        this.categories.forEach(category => {
            const column = document.querySelector(`.column[data-category="${category}"]`);
            if (column) {
                column.draggable = true;
                column.addEventListener('dragstart', (e) => this.handleColumnDragStart(e));
            }
        });
    }
    loadTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('/api/tasks');
            const tasks = yield response.json();
            this.categories.forEach(category => {
                const column = document.querySelector(`.column[data-category="${category}"]`);
                if (column) {
                    const taskList = column.querySelector('.task-list');
                    taskList.innerHTML = '';
                    const categoryTasks = tasks.filter(task => task.category === category)
                        .sort((a, b) => a.order - b.order);
                    categoryTasks.forEach(task => this.renderTask(task, taskList));
                }
            });
        });
    }
    handleSubmit(e, category) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const form = e.target;
            const input = form.querySelector('input');
            const task = {
                id: '',
                title: input.value,
                completed: false,
                order: 0,
                category: category
            };
            const response = yield fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });
            const newTask = yield response.json();
            const taskList = form.nextElementSibling;
            this.renderTask(newTask, taskList);
            input.value = '';
        });
    }
    renderTask(task, taskList) {
        var _a, _b;
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
        if (task.completed)
            li.classList.add('completed');
        (_a = li.querySelector('input')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', () => this.toggleTask(task));
        (_b = li.querySelector('button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.deleteTask(task.id));
        taskList.appendChild(li);
    }
    toggleTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            task.completed = !task.completed;
            yield fetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });
            this.refreshTasks();
        });
    }
    deleteTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            this.refreshTasks();
        });
    }
    handleDragStart(e) {
        var _a;
        const target = e.target;
        if (target.classList.contains('task-item')) {
            (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', target.dataset.id || '');
            target.classList.add('dragging');
        }
    }
    handleColumnDragStart(e) {
        var _a;
        const target = e.target;
        if (target.classList.contains('column')) {
            (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', target.dataset.category || '');
            target.classList.add('dragging');
        }
    }
    handleDragOver(e) {
        e.preventDefault();
        const dragging = this.board.querySelector('.dragging');
        if (dragging.classList.contains('task-item')) {
            const target = e.target.closest('.task-item');
            const targetList = e.target.closest('.task-list');
            if (target && target !== dragging) {
                const allItems = Array.from(target.parentElement.children);
                const draggingIndex = allItems.indexOf(dragging);
                const targetIndex = allItems.indexOf(target);
                if (draggingIndex < targetIndex) {
                    target.after(dragging);
                }
                else {
                    target.before(dragging);
                }
            }
            else if (targetList && !targetList.contains(dragging)) {
                targetList.appendChild(dragging);
            }
        }
        else if (dragging.classList.contains('column')) {
            const target = e.target.closest('.column');
            if (target && target !== dragging && !target.classList.contains('add-column')) {
                const allColumns = Array.from(this.board.children);
                const draggingIndex = allColumns.indexOf(dragging);
                const targetIndex = allColumns.indexOf(target);
                if (draggingIndex < targetIndex) {
                    target.after(dragging);
                }
                else {
                    target.before(dragging);
                }
            }
        }
    }
    handleDrop(e) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            e.preventDefault();
            const draggedId = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain');
            const draggedElement = document.querySelector(`[data-id="${draggedId}"]`);
            const draggedColumn = document.querySelector(`.column[data-category="${draggedId}"]`);
            if (draggedElement) {
                // Task drop
                const newCategory = ((_b = draggedElement.closest('.column')) === null || _b === void 0 ? void 0 : _b.getAttribute('data-category')) || draggedElement.dataset.category;
                draggedElement.dataset.category = newCategory;
                const allTasks = [];
                this.categories.forEach(category => {
                    const taskList = document.querySelector(`.column[data-category="${category}"] .task-list`);
                    if (taskList) {
                        const items = Array.from(taskList.children);
                        items.forEach((item, index) => {
                            var _a;
                            allTasks.push({
                                id: item.dataset.id || '',
                                title: ((_a = item.querySelector('span')) === null || _a === void 0 ? void 0 : _a.textContent) || '',
                                completed: item.classList.contains('completed'),
                                order: index,
                                category: category
                            });
                        });
                    }
                });
                yield fetch('/api/tasks/reorder', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(allTasks)
                });
                this.refreshTasks();
            }
            else if (draggedColumn) {
                // Column drop
                this.categories = Array.from(this.board.children)
                    .filter(child => child.classList.contains('column') && !child.classList.contains('add-column'))
                    .map(column => column.getAttribute('data-category') || '');
            }
        });
    }
    handleDragEnd() {
        const dragging = this.board.querySelector('.dragging');
        if (dragging)
            dragging.classList.remove('dragging');
    }
    refreshTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadTasks();
        });
    }
    addColumn() {
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
    removeColumn(category) {
        if (this.categories.length <= 1) {
            alert('You must have at least one column.');
            return;
        }
        if (confirm(`Are you sure you want to remove the "${category}" column? All tasks will be deleted.`)) {
            this.categories = this.categories.filter(cat => cat !== category);
            const column = document.querySelector(`.column[data-category="${category}"]`);
            column.remove();
            // Optionally, delete tasks from the backend
            fetch(`/api/tasks/category/${category}`, { method: 'DELETE' });
        }
    }
}
document.addEventListener('DOMContentLoaded', () => new DojoApp());
