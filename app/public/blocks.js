/*
Defintions for code blocks.
Will handle block creation logic here and how the blocks represent data
*/

let blockDefs = {
    make_var: {
      type: "make_var",
      label: "make variable",
      inputs: [
        { name: "name", placeholder: "myVariable" }
      ]
    },
    set_var: {
      type: "set_var",
      label: "set",
      inputs: [
        { name: "name", placeholder: "myVariable" },
        { name: "value", placeholder: "hello" }
      ]
    }
};


// here we build a block element from a definiton we give
function buildBlockElement(def) {
    let blockDiv = document.createElement("div");
    blockDiv.id = def.type;

    let labelSpan = document.createElement("span");
    labelSpan.id = "block-label";
    labelSpan.textContent = def.label;
    blockDiv.append(labelSpan);

    let index = 0;
    for (let input of def.inputs) {
        if (def.type === "set_var" && index === 1) {
            let toSpan = document.createElement("span");
            toSpan.textContent = " to "; 
            blockDiv.append(toSpan);
        }

        let inputElem = document.createElement("input");
        inputElem.type = "text";
        inputElem.name = input.name;
        inputElem.placeholder = input.placeholder;
        blockDiv.append(inputElem);

        index = index + 1;
    }

    return blockDiv;
}


function renderBlockDefinitions() {
    let blockListContainer = document.getElementById("block-list");

    for (let key in blockDefs) {
        let def = blockDefs[key];
        let blockDiv = buildBlockElement(def);

        // here we use the drag and drop api to tag different block types
        blockDiv.draggable = true;
        blockDiv.setAttribute("data-block-type", def.type);
        blockDiv.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", def.type);
        });

        blockListContainer.append(blockDiv);
    }
}

function dropBlocksIntoWorkspace() {
  let workspace = document.getElementById("block-workspace");

    workspace.addEventListener("dragover", (event) => {
        // to implement drop and stop the browser from blocking it
        event.preventDefault();
    });

    workspace.addEventListener("drop", (event) => {
        event.preventDefault();
        let type = event.dataTransfer.getData("text/plain");
        let def = blockDefs[type];
        let newBlock = buildBlockElement(def);
        workspace.append(newBlock);
    });
}

renderBlockDefinitions();
dropBlocksIntoWorkspace();
