/*
This will connect blocks to their JS equivalent code
*/

// returns the given value, or a placeholder if it's empty
function fillOrPlaceholder(value) {
    if (value === "") {
        return "____";
    }
    return value;
}

// translator function per block type:
// takes the block's input values (keyed by input name, from blockDefs in blocks.js) and returns a line of JS
let blockTranslators = {
    make_var: (values) => `let ${fillOrPlaceholder(values.name)};`,
    set_var: (values) => `${fillOrPlaceholder(values.name)} = ${fillOrPlaceholder(values.value)};`,
    print_val: (values) => `console.log(${fillOrPlaceholder(values.value)});`
};

// pull the current input values out of a block element, keyed by input name
function getBlockValues(blockDiv) {
    let values = {};
    for (let inputElem of blockDiv.querySelectorAll("input")) {
        values[inputElem.name] = inputElem.value;
    }
    return values;
}

// turn a single block element into its line of JS code
function translateBlock(type, values) {
    let translator = blockTranslators[type];
    return translator(values);
}

// translate every block currently in the workspace
function generateCode() {
    let workspace = document.getElementById("block-workspace");
    let code = "";
    for (let blockDiv of workspace.children) {
        code += translateBlock(blockDiv.id, getBlockValues(blockDiv)) + "\n";
    }
    return code;
}

function generateCodeFromBlocks(blocks) {
    let code = "";
    for (let block of blocks) {
        code += translateBlock(block.type, block.values) + "\n";
    }
    return code;
}

// update the generated code shown in the code panel
function updateCodeView() {
    let codeElem = document.getElementById("code-output");
    codeElem.textContent = generateCode();
}

function setupCodeViewer() {
    let codePanel = document.getElementById("code-panel");

    let translateButton = document.createElement("button");
    translateButton.id = "refresh-code";
    translateButton.textContent = "Translate Blocks";
    translateButton.addEventListener("click", updateCodeView);
    codePanel.append(translateButton);

    let runButton = document.createElement("button");
    runButton.id = "run-code";
    runButton.textContent = "Run";
    runButton.addEventListener("click", runCode);
    codePanel.append(runButton);

    let pre = document.createElement("pre");
    let code = document.createElement("code");
    code.id = "code-output";
    pre.append(code);
    codePanel.append(pre);

    updateCodeView();
}

function runCode() {
    let code = generateCode();
    let outputElem = document.getElementById("run-output");

    fetch("/run", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: code })
    }).then((response) => {
        return response.json();
    }).then((result) => {
        if (result.error) {
            outputElem.textContent = "Error: " + result.error;
        } else {
            let text = "";
            for (let line of result.output) {
                text += line + "\n";
            }
            outputElem.textContent = text;
        }
    }).catch((error) => {
        outputElem.textContent = "Error: " + error.message;
    });
}

function serializeWorkspace() {
    let workspace = document.getElementById("block-workspace");
    let blocks = [];
    for (let blockDiv of workspace.children) {
        blocks.push({ type: blockDiv.id, values: getBlockValues(blockDiv) });
    }
    return blocks;
}

function loadWorkspace(blocks) {
    let workspace = document.getElementById("block-workspace");
    workspace.textContent = "";
    for (let saved of blocks) {
        let def = blockDefs[saved.type];
        let blockDiv = buildBlockElement(def, true);
        for (let inputElem of blockDiv.querySelectorAll("input")) {
            if (saved.values.hasOwnProperty(inputElem.name)) {
                inputElem.value = saved.values[inputElem.name];
            }
        }
        workspace.append(blockDiv);
    }
    updateCodeView();
}

function saveProject() {
    let name = document.getElementById("project-name-input").value;
    let messageElem = document.getElementById("save-message");

    fetch("/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, blocks: serializeWorkspace() })
    }).then((r) => r.json()).then((result) => {
        if (result.error) {
            messageElem.textContent = "Save failed: " + result.error;
        } else {
            messageElem.textContent = "Saved!";
        }
    }).catch((error) => {
        messageElem.textContent = "Save failed: " + error.message;
    });
}

function setupSaveButton() {
    let saveButton = document.getElementById("save-button");
    saveButton.addEventListener("click", saveProject);
}

function showSaveIfLoggedIn() {
    fetch("/current-user").then((response) => {
        if (response.ok) {
            document.getElementById("save-bar").style.display = "block";
        }
    });
}

setupCodeViewer();
setupSaveButton();
showSaveIfLoggedIn();