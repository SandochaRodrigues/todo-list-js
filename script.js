const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filters button");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Guarda a lista de tarefas no localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//Editar a tarefa
function editTask(id) {
  const task = getTaskById(id);

  const newText = prompt("Editar tarefa:", task.text);

  if (newText !== null && newText.trim() !== "") {
    task.text = newText.trim();
    saveTasks();
  }
} 

// Renderiza a lista de tarefas no DOM, com filtro opcional:
// filter = "all" | "completed" | "incomplete"
function renderTasks(filter = "all") {
  // Limpa a lista atual
  taskList.innerHTML = "";

  // Aplica filtro às tarefas em memória
  let filtered = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  // Cria elementos <li> para cada tarefa filtrada
  filtered.forEach(task => {
    const li = document.createElement("li");
    // Define texto e classe visual para tarefa concluída
    li.textContent = task.text;
    li.className = task.completed ? "completed" : "";

    // Clique no item alterna o estado "completed"
    li.addEventListener("click", () => {
      const originalTask = tasks.find(t => t.id === task.id);
      if (!originalTask) return;
      originalTask.completed = !originalTask.completed;

      saveTasks();
      renderTasks(filter); // re-render mantendo o filtro atual
    });

    // Botão de eliminar (ico de lata do lixo)
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";

    // Evita que o clique no botão propague para o <li>
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      // Remove a tarefa da lista em memória
      tasks = tasks.filter(t => t.id !== task.id);

      saveTasks();
      renderTasks(filter);
    });

    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
}

// Adiciona nova tarefa quando o utilizador clica no botão
addBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();

  if (taskText !== "") {
    tasks.push({
      id: Date.now(),      // id simples baseado em timestamp
      text: taskText,
      completed: false
    });

    taskInput.value = ""; // limpa o input
    saveTasks();
    renderTasks();
  }
});

// Configura os botões de filtro para re-renderizar com o filtro escolhido
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    renderTasks(btn.dataset.filter);
  });
});

const editBtn = document.createElement("button");
editBtn.textContent = "✏️";
editBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const li = e.target.closest("li");
  if (!li) return;
  const taskId = tasks.find(t => t.id === li.dataset.id);
  if (!taskId) return;
  editTask(taskId);
});

// Render inicial ao carregar o script
renderTasks();