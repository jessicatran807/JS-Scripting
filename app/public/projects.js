function renderProjects(projects) {
    let projectsList = document.getElementById("projects-list");
    projectsList.textContent = "";

    if (projects.length === 0) {
        let empty = document.createElement("p");
        empty.textContent = "No saved projects yet.";
        projectsList.append(empty);
        return;
    }

    let table = document.createElement("table");

    let headerRow = document.createElement("tr");
    let nameHeader = document.createElement("th");
    nameHeader.textContent = "Name";
    let dateHeader = document.createElement("th");
    dateHeader.textContent = "Created";
    headerRow.append(nameHeader, dateHeader);
    table.append(headerRow);

    for (let project of projects) {
        let row = document.createElement("tr");

        let nameCell = document.createElement("td");
        let link = document.createElement("a");
        link.href = "/?project=" + project.id;
        link.textContent = project.name;
        nameCell.append(link);

        let dateCell = document.createElement("td");
        dateCell.textContent = project.created_at;

        row.append(nameCell, dateCell);
        table.append(row);
    }

    projectsList.append(table);
}

function loadProjects() {
    let projectsList = document.getElementById("projects-list");

    fetch("/api/projects").then((response) => {
        if (response.status === 403) {
            projectsList.textContent = "";
            let message = document.createElement("p");
            message.textContent = "Log in to see your projects.";
            projectsList.append(message);
            return null;
        }
        return response.json();
    }).then((result) => {
        if (!result) return;
        if (result.error) {
            projectsList.textContent = "Failed to load projects: " + result.error;
            return;
        }
        renderProjects(result.projects);
    }).catch((error) => {
        projectsList.textContent = "Failed to load projects: " + error.message;
    });
}

loadProjects();