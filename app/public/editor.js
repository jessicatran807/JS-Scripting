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
function translateBlock(blockDiv) {
    let translator = blockTranslators[blockDiv.id];
    return translator(getBlockValues(blockDiv));
}

// translate every block currently in the workspace
function generateCode() {
    let workspace = document.getElementById("block-workspace");
    let code = "";
    for (let blockDiv of workspace.children) {
        code += translateBlock(blockDiv) + "\n";
    }
    return code;
}

// update the generated code shown in the code panel
function updateCodeView() {
    let codeElem = document.getElementById("code-output");
    codeElem.textContent = generateCode();
}

// set up the <pre><code> output area and a manual translate button to update the code
function setupCodeViewer() {
    let codePanel = document.getElementById("code-panel");

    let translateButton = document.createElement("button");
    translateButton.id = "refresh-code";
    translateButton.textContent = "Translate Blocks";
    translateButton.addEventListener("click", updateCodeView);
    codePanel.append(translateButton);

    // <pre> preserves the line breaks/whitespace
    // <code> marks it as code
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

setupCodeViewer();