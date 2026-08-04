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

function renderBlockDefinitions() {
    let blockListContainer = document.getElementById("block-list");

    for (let key in blockDefs) {
        let def = blockDefs[key];

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

        blockListContainer.append(blockDiv);
    }
}

renderBlockDefinitions();