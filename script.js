// Initialize an object to store table data
let tableData = {};

let tape = Array.from({ length: 49 }, (_, index) => (index === 9 ? '1' : '0'));
let tapePointer = 9; // Initial position of the tape pointer
let currentState = 1; // Initial state of the Turing machine

// Function to add a row
function addRow() {
  let table = document.getElementById("tmTable");
  let newRow = table.insertRow(table.rows.length);

  // Insert cells with empty content and make them editable
  let rowData = { state: table.rows.length - 1 };
  cell = newRow.insertCell(0);
  cell.innerHTML = (table.rows.length - 1).toString();
  for (let i = 0; i < 3; i++) {
    let cell = newRow.insertCell(i+1);
    cell.contentEditable = "true";
    rowData[i] = ""; // Initialize data for the cell
    // Add an event listener to update tableData on cell content change
    cell.addEventListener("input", function () {
    rowData[i] = cell.innerHTML;
    updateTableData();
  });
  }

  // Add the new row data to the object
  tableData[table.rows.length - 1] = rowData;
  saveStateTableToURL();
}

// Function to update tableData when cell content changes
function updateTableData() {

  let table = document.getElementById("tmTable");
  // Iterate through rows and cells
  for (let i = 1; i < table.rows.length ; i++) {
    let row = table.rows[i];
    for (let j = 1; j < row.cells.length; j++) {
      tableData[i][j - 1] = row.cells[j].innerHTML;
    }
  }

  // Log the updated tableData (you can customize this part)
  logTableData();
  saveStateTableToURL();
}

// Example function to log the table data
function logTableData() {
  console.log(tableData);
}

// Function to toggle the value of the tape cell between '0' and '1'
function toggleCellValue(cell, index) {
  const newValue = cell.innerHTML === '0' ? '1' : '0';
  tape[index] = newValue;
  renderTape();
}

// Initial rendering of the tape
function renderTape() {
  let tapeTable = document.getElementById("tape").getElementsByTagName('tr')[0];
  tape.forEach((value, index) => {
    tapeTable.cells[index].innerHTML = value;
  });
}

// Function to add the highlighted class to the cell at the pointer position
function highlightPointerCell() {
  let tapeTable = document.getElementById("tape").getElementsByTagName('tr')[0];

  // Remove the highlighted class from all cells
  for (let i = 0; i < tapeTable.cells.length; i++) {
    tapeTable.cells[i].classList.remove("highlighted");
  }

  // Add the highlighted class to the cell at the pointer position
  tapeTable.cells[tapePointer].classList.add("highlighted");
}

// Initial rendering of the tape
function renderTape() {
  let tapeTable = document.getElementById("tape").getElementsByTagName('tr')[0];
  tape.forEach((value, index) => {
    tapeTable.cells[index].innerHTML = value;
  });

  // Highlight the cell at the pointer position
  highlightPointerCell();
}

renderTape();

// Function to move the tape pointer left
function movePointerLeft() {
  if (tapePointer > 0) {
    tapePointer--;
    renderTape();
    renderTableWithState();
  }
}

// Function to move the tape pointer right
function movePointerRight() {
  if (tapePointer < tape.length - 1) {
    tapePointer++;
    renderTape();
    renderTableWithState();
  }
}

// Function to reset the tape to its initial state
function resetTape() {
  tape = Array.from({ length: 49 }, (_, index) => (index === 9 ? '1' : '0'));
  tapePointer = 9;
  renderTape();
  renderTableWithState();
}

// Function to reset the tape and the state of the Turing machine
function resetMachine() {
  resetTape(); // Reset the tape
  currentState = 1; // Reset the state of the Turing machine
  renderTableWithState();
}

function renderTableWithState() {
  let table = document.getElementById("tmTable");

  // Iterate through rows and cells
  for (let i = 1; i < table.rows.length; i++) {
    let row = table.rows[i];
    let rowState = parseInt(row.cells[0].innerHTML);

    // Add or remove the highlighted-state class based on the current state
    if (rowState == currentState) {
      row.classList.add("highlighted-state");
    } else {
      row.classList.remove("highlighted-state");
    }
  }
}

// Function to perform a step in the Turing machine
function performStep() {
  const instruction = fetchInstruction(tape[tapePointer], currentState);
  if (instruction.halt) {
    console.log("halt");
    return;
  }
  if (instruction.accept) {
    console.log("accept");
    return;
  }
  if (instruction.accept) {
    console.log("reject");
    return;
  }
  tape[tapePointer] = instruction.set;
  tapePointer += instruction.move == "R" ? 1 : -1;
  currentState = instruction.state;
  renderTape();
  renderTableWithState();
}

function fetchInstruction(symbol, state) {
  let instruction = {};
  rawStr = tableData[state][symbol];
  if (rawStr == "halt") {
    instruction.halt = true;
    return
  }
  else if (rawStr == "accept") {
    instruction.accept = true;
    return
  }
  else if (rawStr == "reject") {
    instruction.reject = true;
    return
  }
  try {
    instruction.set = rawStr[0];
    instruction.move = rawStr[1];
    instruction.state = rawStr.substring(2);
  } catch (error) {
    console.log(rawStr, instruction);
    console.error("The instruction is in improper form");
  }
  return instruction;
}

function saveStateTableToURL() {
  const encodedStateTable = encodeURIComponent(JSON.stringify(tableData));
  const newURL = window.location.origin + window.location.pathname + `?table=${encodedStateTable}`;
  window.history.replaceState({ path: newURL }, '', newURL);
}

function loadStateTableFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedStateTable = urlParams.get('table');

  if (encodedStateTable) {
    try {
      const decodedStateTable = JSON.parse(decodeURIComponent(encodedStateTable));
      // Update the tableData object with the decoded state table
      tableData = decodedStateTable;
      // Render the loaded state table
      renderStateTable();
    } catch (error) {
      console.error('Error loading state table from URL:', error.message);
    }
  }
}

function renderStateTable() {
  let table = document.getElementById("tmTable");
  // Clear existing rows
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  // Render the state table
  for (let state in tableData) {
    let rowData = tableData[state];
    let newRow = table.insertRow(table.rows.length);

    // Insert cells with state and notes
    let cell = newRow.insertCell(0);
    cell.innerHTML = state;

    for (let i = 0; i < 3; i++) {
      cell = newRow.insertCell(i + 1);
      cell.contentEditable = "true";
      cell.innerHTML = rowData[i] || ''; // Initialize data for the cell
      // Add an event listener to update tableData on cell content change
      cell.addEventListener("input", function () {
        rowData[i] = cell.innerHTML;
        updateTableData();
      });
    }
  }
}

// Call the function to load the state table from the URL when the page loads
loadStateTableFromURL();

let autoStepInterval; // Variable to store the interval ID

function toggleAutoStep() {
  if (autoStepInterval) {
    // If auto stepping is active, stop it
    clearInterval(autoStepInterval);
    autoStepInterval = undefined;
  } else {
    // If auto stepping is not active, start it with a 50ms interval (adjust as needed)
    autoStepInterval = setInterval(performStep, 50);
  }
}

// Add this function to clear the interval when the page is unloaded
window.addEventListener('beforeunload', function() {
  clearInterval(autoStepInterval);
});

function clearRows() {
  let table = document.getElementById("tmTable");

  // Clear the rows from the table
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  // Clear the data in the tableData object
  tableData = {};

  // Update the URL with the modified state table
  saveStateTableToURL();
}
