// ...existing code...
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filters button");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editingTaskId = null;

// Guarda a lista de tarefas no localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Recupera uma tarefa pelo seu ID
function getTaskById(id) {
  return tasks.find(task => task.id === id);
}

//Editar a tarefa via prompt (mantém verificação de existência)
function editTask(id) {
  const task = getTaskById(id);
  if (!task) return;

  const newText = prompt("Editar tarefa:", task.text);
  if (newText !== null) {
    const trimmed = newText.trim();
    if (trimmed !== "") {
      task.text = trimmed;
      saveTasks();
      renderTasks();
    }
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
    li.className = "task-item";

    const textContainer = document.createElement("div");
    textContainer.className = "task-text";

    // Define texto e campo de edição inline
    if (editingTaskId === task.id) {
      const input = document.createElement("input");
      input.className = "edit-input";
      input.value = task.text;

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const val = input.value.trim();
          if (val !== "") task.text = val;
          editingTaskId = null;
          saveTasks();
          renderTasks(filter);
        } else if (e.key === "Escape") {
          editingTaskId = null;
          renderTasks(filter);
        }
      });

      input.addEventListener("blur", () => {
        const val = input.value.trim();
        if (val !== "") task.text = val;
        editingTaskId = null;
        saveTasks();
        renderTasks(filter);
      });

      textContainer.appendChild(input);
      setTimeout(() => input.focus(), 0);

    } else {
      const span = document.createElement("span");
      span.textContent = task.text;

      if (task.completed) {
        span.classList.add("completed-text");
      }

      textContainer.appendChild(span);
    }

    li.appendChild(textContainer);
    // Mantém a classe base e adiciona/remove a classe 'completed'
    li.classList.toggle("completed", task.completed);

    // Clique no item alterna o estado "completed"
    li.addEventListener("click", (e) => {
      // Não alternar quando o clique veio de um botão ou do input de edição
      if (e.target.closest("button") || e.target.tagName === "INPUT") return;

      const originalTask = getTaskById(task.id);
      if (!originalTask) return;
      originalTask.completed = !originalTask.completed;

      saveTasks();
      renderTasks(filter); // re-render mantendo o filtro atual
    });

    // Botão de eliminar (ico de lata do lixo)
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "🗑️";

    // Evita que o clique no botão propague para o <li>
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      // Remove a tarefa da lista em memória
      tasks = tasks.filter(t => t.id !== task.id);

      saveTasks();
      renderTasks(filter);
    });

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      editingTaskId = task.id;
      renderTasks(filter);
    });

    li.appendChild(delBtn);
    li.appendChild(editBtn); // Adiciona botão de editar
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

// Render inicial ao carregar o script
renderTasks();