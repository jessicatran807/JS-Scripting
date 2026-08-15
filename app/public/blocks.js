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
        { name: "value", placeholder: "\"helloWorld\"" }
      ]
    },
    print_val: {
      type: "print_val",
      label: "print",
      inputs: [
        { name: "value", placeholder: "myVariable" }
      ]
    }
};


// here we build a block element from a definiton we give
function buildBlockElement(def, includeDeleteButton) {
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

    // includeDeleteButton is only for blocks in the workspace
    if (includeDeleteButton) {
        let upButton = document.createElement("button");
        upButton.id = "move-up";
        upButton.textContent = "▲";
        upButton.addEventListener("click", () => {
            moveBlock(blockDiv, -1);
        });
        blockDiv.append(upButton);

        let downButton = document.createElement("button");
        downButton.id = "move-down";
        downButton.textContent = "▼";
        downButton.addEventListener("click", () => {
            moveBlock(blockDiv, 1);
        });
        blockDiv.append(downButton);
        
        let deleteButton = document.createElement("button");
        deleteButton.id = "delete-block";
        deleteButton.textContent = "X";
        deleteButton.addEventListener("click", () => {
            blockDiv.remove();
            updateCodeView();
        });
        blockDiv.append(deleteButton);
    }



    return blockDiv;
}

// able to move a block up or down to rearrange them in the workspace
function moveBlock(blockDiv, direction) {
    let workspace = document.getElementById("block-workspace");

    let blockList = [];
    for (let child of workspace.children) {
        blockList.push(child);
    }

    let index = blockList.indexOf(blockDiv);
    let targetIndex = index + direction; // direction: -1 for up, 1 for down

    if (targetIndex < 0 || targetIndex >= blockList.length) {
        return; // already at the top/bottom, do nothing
    }

    // swap the two entries in the array
    let temp = blockList[targetIndex];
    blockList[targetIndex] = blockList[index];
    blockList[index] = temp;

    // append everything again in the new order
    for (let block of blockList) {
        workspace.append(block);
    }
    updateCodeView();
}


function renderBlockDefinitions() {
    let blockListContainer = document.getElementById("block-list");

    for (let key in blockDefs) {
        let def = blockDefs[key];
        let blockDiv = buildBlockElement(def, false);

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
        let newBlock = buildBlockElement(def, true);
        workspace.append(newBlock);
        updateCodeView();
    });
}

renderBlockDefinitions();
dropBlocksIntoWorkspace();