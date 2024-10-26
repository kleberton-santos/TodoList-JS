class Task {
    constructor(year, month, day, type, description, completed = false){
        this.year = year;
        this.month = month;
        this.day = day;
        this.type = type;
        this.description = description;
        this.completed = completed;
    }

    validateData() {
        for (let key in this){
            if(this[key] === undefined || this[key] === ""){
                console.error(`O campo ${key} é obrigatório.`);
                return false;
            }
        }
        return true;
    }
}

class Database {

    constructor(){
        this.initDatabase()
    }

    initDatabase() {
        const id = localStorage.getItem('id')

        if(id === null){
            localStorage.setItem('id', '0')
        }
    }

    loadTasks() {
        let tasks = []
        let id = localStorage.getItem('id')

        for(let i = 1; i <= id; i++){
            try {
                let task = JSON.parse(localStorage.getItem(i))
                tasks.push(task)
            } catch (error){
                console.error(`Erro ao carregar a tarefa com id ${id}`)
            }
        }
        return tasks
    }

    createTask(task) {
        let id = this.getNextId()
        localStorage.setItem(id, JSON.stringify(task))
        localStorage.setItem('id', id.toString())
    }
    
    removeTask(id){
        localStorage.removeItem(id)
    }

    searchTasks(task){
        let tasks = this.loadTasks(); 
        let filterTasks = tasks.filter(f => {
            
            return (task.year === "" || f.year === task.year) &&
                   (task.month === "" || f.month === task.month) &&
                   (task.day === "" || f.day === task.day) &&
                   (task.type === "" || f.type === task.type) &&
                   (task.description === "" || f.description === task.description);
        });
        
        return filterTasks; 
        
    }

    getNextId(){
        let currentId = localStorage.getItem('id')
        return parseInt(currentId) + 1
    }
    toggleCompleteTask(id) {
        let task = JSON.parse(localStorage.getItem(id));
        if (task) {
            task.completed = !task.completed; 
            localStorage.setItem(id, JSON.stringify(task));
        }
    }
}

const database = new Database()

function registerTask(){
    let year = document.getElementById('year').value
    let month = document.getElementById('month').value
    let day = document.getElementById('day').value
    let type = document.getElementById('type').value
    let description = document.getElementById('description').value

    let task = new Task(year, month, day, type, description)

    if(task.validateData()){
        database.createTask(task)
        alert('Tarefa criada com sucesso!')
    } else {
        alert('Preencha todos os campos.')
    }
}

function loadTasks() {
    let listTask = document.getElementById('listTasks');
    listTask.innerHTML = '';

    let id = localStorage.getItem('id');
    if (id === null) return;

    for (let i = 1; i <= id; i++) {
        let task = JSON.parse(localStorage.getItem(i));
        if (task) {
            let row = listTask.insertRow();

            row.className = task.completed ? 'completed-task' : '';

            row.insertCell(0).innerHTML = `<span id="date-${i}">${task.day}/${task.month}/${task.year}</span>`;
            row.insertCell(1).innerHTML = `<span id="type-${i}">${getTaskTypeName(task.type)}</span>`;
            row.insertCell(2).innerHTML = `<span id="description-${i}">${task.description}</span>`;

            let completeBtn = document.createElement('button');
            completeBtn.className = 'btn btn-success';
            completeBtn.id = `complete-${i}`;
            completeBtn.innerHTML = task.completed ? 'Desmarcar' : 'Concluir';

            completeBtn.onclick = () => {
                database.toggleCompleteTask(i);
                loadTasks(); 
            };
            row.insertCell(3).append(completeBtn);

            let deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.id = i;
            deleteBtn.innerHTML = 'Deletar';

            deleteBtn.onclick = () => {
                if (confirm('Você tem certeza que quer excluir esta tarefa?')) {
                    removeTask(i);
                    loadTasks();
                }
            };
            row.insertCell(4).append(deleteBtn);

            let editBtn = document.createElement('button');
            editBtn.className = 'btn btn-warning';
            editBtn.id = `edit-${i}`;
            editBtn.innerHTML = 'Editar';

            editBtn.onclick = () => {
                enableEdit(i, task);
            };
            
            row.insertCell(5).append(editBtn);
        }
    }
}


function removeTask(id) {
    localStorage.removeItem(id); 
    console.log(`Tarefa com ID ${id} removida do localStorage`);
}


function enableEdit(id, task) {
    
    document.getElementById(`date-${id}`).innerHTML = `<input type="text" id="input-date-${id}" value="${task.day}/${task.month}/${task.year}" placeholder="dd/mm/yyyy">`;

    document.getElementById(`type-${id}`).innerHTML = `
        <select id="input-type-${id}">
            <option value="1" ${task.type == '1' ? 'selected' : ''}>Studies</option>
            <option value="2" ${task.type == '2' ? 'selected' : ''}>Work</option>
            <option value="3" ${task.type == '3' ? 'selected' : ''}>Home</option>
            <option value="4" ${task.type == '4' ? 'selected' : ''}>Health</option>
            <option value="5" ${task.type == '5' ? 'selected' : ''}>Family</option>
        </select>`;

    document.getElementById(`description-${id}`).innerHTML = `<input type="text" id="input-description-${id}" value="${task.description}">`;

    document.getElementById(`edit-${id}`).innerHTML = 'Salvar';
    document.getElementById(`edit-${id}`).onclick = () => saveEdit(id); 
}


function saveEdit(id) {

    let dateValue = document.getElementById(`input-date-${id}`).value;
    let [day, month, year] = dateValue.split('/'); 

    let updatedTask = new Task(
        year.trim(),
        month.trim(),
        day.trim(),
        document.getElementById(`input-type-${id}`).value,
        document.getElementById(`input-description-${id}`).value
    );

    if (!updatedTask.validateData()) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    localStorage.setItem(id, JSON.stringify(updatedTask));
    alert('Tarefa editada com sucesso!');

    loadTasks();
}

function getTaskTypeName(type){
    switch(type) {
        case '1':
            return 'Studies'
            break
        case '2':
            return 'Work'
            break
        case '3':
            return 'Home'
            break
        case '4': 
            return 'health'
            break
        case '5':
            return 'Family'
            break
        default: 
            return 'Desconhecido'
    }
}

function searchTasks() {
    let year = document.getElementById('year').value;
    let month = document.getElementById('month').value;
    let day = document.getElementById('day').value;
    let type = document.getElementById('type').value;
    let description = document.getElementById('description').value;

    let task = new Task(year, month, day, type, description); 

    let filterTasks = database.searchTasks(task); 

    loadTasks(filterTasks); 
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.body.contains(document.getElementById('listTasks'))){
        loadTasks()
    }
})