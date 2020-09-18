// DOM elements

let canvasBody = document.getElementsByClassName('canvas-body')[0];
let canvas = document.getElementsByClassName('canvas')[0];
let pixels = document.getElementsByClassName('pixel');
let colors = document.getElementsByClassName('color');

let select = document.querySelector('.select');
let selectTitle = select.querySelector('.select-title');
let selectLabels = document.getElementsByClassName('select-label');
let selectContent = select.querySelector('.select-content');

let colorsRow = document.querySelector('.colors-row');
let colorBlock = document.getElementsByClassName('color-block')[0];
let colorPicker = document.getElementById("color-picker");
let customColor = document.getElementsByClassName("custom-color")[0];
let recentColors = document.getElementsByClassName("color-recent");

let instruments = document.getElementsByClassName('instr');
let instrMode = document.getElementsByClassName('instr-mode')[0];

let canvasHistory = [];
let historyCap = 9;
let curCanvas = 0;

let optionTabs = document.getElementsByClassName('tab-option');
let modal = document.getElementsByClassName('modal')[0];
let canvasStorage = [];

let drawingsSection = document.getElementsByClassName('section-drawings')[0];
let drawingTabs = document.getElementsByClassName('tab-drawing');

let systemInfo = {
  canvasCount: 0,
  rangeX: 0,
  rangeY: 0,
}

// load stuff

let colorsInfo = {
  "palettes": [
    {
      "palette-id": "cl",
      "palette-label": "Classic",
      "palette-colors": [
        "red",
        "yellow",
        "green",
        "blue"
      ]
    },
    {
      "palette-id": "lo",
      "palette-label": "Love",
      "palette-colors": [
        "red",
        "purple",
        "violet",
        "pink"
      ]
    },
  ]
}

let tabOptions = new Map([
  ['save', () => {
    let modalInput = document.getElementsByClassName('modal-input')[0];
    updateCanvasStorage(document.getElementsByClassName('tab-active')[0]);
    localStorage.setItem('canvasStorage', JSON.stringify(canvasStorage));
  }],
  ['new', () => {
    let modalInput = document.getElementsByClassName('modal-input')[0];
    let prevTab = document.getElementsByClassName('tab-active')[0];
    updateCanvasStorage(prevTab);
    prevTab.children[1].classList.toggle('cross-hidden');
    prevTab.classList.toggle('tab-active');

    let newDrawingTab = document.createElement('div');
    newDrawingTab.classList = "tab tab-drawing tab-active";
    let tabName = document.createElement('div');
    tabName.classList = "tab-name";
    tabName.textContent = modalInput.value;
    let cross = document.createElement('div');
    cross.classList = "tab-cross";
    cross.innerHTML = "&#10006;";
    newDrawingTab.appendChild(tabName);
    newDrawingTab.appendChild(cross);
    drawingsSection.appendChild(newDrawingTab);

    canvas.innerHTML = createCanvas(systemInfo.rangeX, systemInfo.rangeY);
    newDrawingTab.addEventListener('click', setActiveTab);
    if (tabName.textContent == ("new-" + systemInfo.canvasCount))
      updateCanvasCount();
    clearCanvasHistory();
    saveCanvasStage();
    refreshPreview();
  }],
  ['load', () => {
    let modalInput = document.getElementsByClassName('modal-input')[0];
    let activeTab = document.getElementsByClassName('tab-active')[0];
    if (canvasStorage != null && canvasStorage.find(el => el.name == modalInput.value)) {
      activeTab.children[0].textContent = modalInput.value;
      canvas.innerHTML = canvasStorage.find(el => el.name == modalInput.value).canvas;
      saveCanvasStage();
    }
  }],
  ['rename', () => {
    let modalInput = document.getElementsByClassName('modal-input')[0];
    document.getElementsByClassName('tab-active')[0].children[0].textContent = modalInput.value;
  }],
  ['delete', () => {
    let activeTab = document.getElementsByClassName('tab-active')[0];
    activeTab.remove();
    drawingsSection.children[0].classList.add("tab-active");
    drawingsSection.children[0].children[1].classList.toggle('cross-hidden');
    canvas.innerHTML = canvasStorage.find(el => el.name == drawingsSection.children[0].children[0].textContent).canvas;
    clearCanvasHistory();
    saveCanvasStage();
    refreshPreview();
  }],
  ['clear', () => {
    localStorage.clear();
  }]
]);

let specialOptions = new Map([
  ['save', () => {
    let modalInput = document.getElementsByClassName('modal-input')[0];
    modalInput.value = document.getElementsByClassName('tab-active')[0].children[0].textContent;
  }],
  ['rename', () => {
    let modalInput = document.getElementsByClassName('modal-input')[0];
    modalInput.value = document.getElementsByClassName('tab-active')[0].children[0].textContent;
  }],
  ['new', () => {
    let modalInput = document.getElementsByClassName('modal-input')[0];
    modalInput.value = "new-" + systemInfo.canvasCount;

    let rangeX = document.getElementById('range-x');
    let rangeY = document.getElementById('range-y');
    let rangeFieldX = document.getElementById('range-value-x');
    let rangeFieldY = document.getElementById('range-value-y');

    displayRangeValue(rangeX, rangeFieldX);
    displayRangeValue(rangeY, rangeFieldY);
    
    rangeX.addEventListener('change', () => displayRangeValue(rangeX, rangeFieldX));
    rangeY.addEventListener('change', () => displayRangeValue(rangeY, rangeFieldY));
    rangeX.addEventListener('input', () => displayRangeValue(rangeX, rangeFieldX));
    rangeY.addEventListener('input', () => displayRangeValue(rangeY, rangeFieldY));
  }],
  ['load', () => {
    let canvasList = document.getElementsByClassName('canvas-list')[0];
    let storedCanvas = JSON.parse(localStorage.getItem('canvasStorage'));
    canvasStorage = storedCanvas || [];

    let canvasOption = document.createElement('li');
    canvasOption.classList = "canvas-option";
    
    if (storedCanvas != null)
      for (let i = 0; i < storedCanvas.length; i++) {
        let newCanvas = canvasOption.cloneNode(true);
        newCanvas.textContent = storedCanvas[i].name;
        canvasList.append(newCanvas);
      }
  }],
])

let modalOptions = new Map([
  ['save', `<div class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title">Save canvas</div>
    <div class="close modal-cancel">&times;</div>
  </div>
  <div class="modal-body">
    <div class="modal-input-container">
      <input type="text" class="modal-input">
      <img src="img/pencil-small.svg" class="input-img">
    </div>
  </div>
  <div class="modal-footer">
    <div class="modal-btn modal-confirm"><span class="button-text">Ok</span></div>
    <div class="modal-btn modal-cancel"><span class="button-text">Cancel</span></div>
  </div>
</div>`],
['rename', `<div class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title">Rename canvas</div>
    <div class="close modal-cancel">&times;</div>
  </div>
  <div class="modal-body">
    <div class="modal-input-container">
      <input type="text" class="modal-input">
      <img src="img/pencil-small.svg" class="input-img">
    </div>
  </div>
  <div class="modal-footer">
    <div class="modal-btn modal-confirm"><span class="button-text">Ok</span></div>
    <div class="modal-btn modal-cancel"><span class="button-text">Cancel</span></div>
  </div>
</div>`],
  ['load', `<div class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title">Load canvas</div>
    <div class="close modal-cancel">&times;</div>
  </div>
  <div class="modal-body">
    <div class="modal-input-container">
      <input type="text" class="modal-input" placeholder="Enter canvas name...">
      <img src="img/pencil-small.svg" class="input-img">
    </div>
    <ul class="canvas-list">
    </ul>
  </div>
  <div class="modal-footer">
    <div class="modal-btn modal-confirm"><span class="button-text">Ok</span></div>
    <div class="modal-btn modal-cancel"><span class="button-text">Cancel</span></div>
  </div>
</div>`],
  ['new', `<div class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title">New canvas</div>
    <div class="close modal-cancel">&times;</div>
  </div>
  <div class="modal-body">
    <div class="modal-input-container">
      <input type="text" class="modal-input">
      <img src="img/pencil-small.svg" class="input-img">
    </div>
    <div class="modal-range-container">
      <div class="range-row">
        <label for="x-range" class="range-label">X:</label>
        <input type="range" name="x-range" class="modal-range" id="range-x" min=5 max=50 value=5>
        <span id="range-value-x" class="range-label range-value"></span>
      </div>
      <div class="range-row">
        <label for="y-range" class="range-label">Y:</label>
        <input id="range-y" type="range" name="y-range" class="modal-range" min=5 max=30 value=5>
        <span id="range-value-y" class="range-label range-value"></span>
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <div class="modal-btn modal-confirm"><span class="button-text">Ok</span></div>
    <div class="modal-btn modal-cancel"><span class="button-text">Cancel</span></div>
  </div>
</div>`],
['warnUnsaved', `<div class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title">Delete canvas</div>
    <div class="close modal-cancel">&times;</div>
  </div>
  <div class="modal-body">
    <span>Warning! Any unsaved changes will be discarded. You can return and save everything in localStorage now.</span>
  </div>
  <div class="modal-footer">
    <div class="modal-btn modal-confirm"><span class="button-text">Ok</span></div>
    <div class="modal-btn modal-cancel"><span class="button-text">Cancel</span></div>
  </div>
</div>`],
['clear', `<div class="modal-dialog">
  <div class="modal-header">
    <div class="modal-title">Clear storage</div>
    <div class="close modal-cancel">&times;</div>
  </div>
  <div class="modal-body">
    <span>Delete all stored canvas?</span>
  </div>
  <div class="modal-footer">
    <div class="modal-btn modal-confirm"><span class="button-text">Ok</span></div>
    <div class="modal-btn modal-cancel"><span class="button-text">Cancel</span></div>
  </div>
</div>`]
])

let drawingOptions = new Map([
  ['pencil', () => {
    curColor = colorBlock.style.backgroundColor;
  }], 
  ['eraser', () => {
    curColor = 'white';
  }], 
  ['brush', () => {
    curColor = colorBlock.style.backgroundColor;
    for (let i = 0; i < pixels.length; i++) {
      pixels[i].addEventListener('click', enableFloodFill);
    }
  }], 
  ['clear', () => {
    let temp = curColor;
    curColor = 'white';
    for (pixel of pixels)
      changeColor.call(pixel);
    curColor = temp;
    saveCanvasStage();
  }],
  ['undoCheck', () => {
    return (curCanvas < canvasHistory.length - 1 && curCanvas >= 0);
  }],
  ['redoCheck', () => {
    return (curCanvas > 0 && curCanvas < canvasHistory.length);
  }],
  ['undo', () => {
    if (drawingOptions.get('undoCheck')()) {
      canvas.innerHTML = canvasHistory[++curCanvas];
      refreshPreview();
    }
  }],
  ['redo', () => {
    if (drawingOptions.get('redoCheck')()) {
      canvas.innerHTML = canvasHistory[--curCanvas];
      refreshPreview();
    }
  }],
  ['preview', () => {
    instrMode.children[0].classList.toggle('instr-active');
    if (instrMode.children[0].classList.contains('instr-active'))
      enablePreview();
    else disablePreview();
  }]
]);


// setting default values 

let curColor = 'black';
updatePalette('cl');
updateColorBlock();
setCursor('pencil');
document.getElementsByClassName('pencil')[0].children[0].classList.toggle('instr-active');
canvas.innerHTML = createCanvas(20, 20);
saveCanvasStage();
updateCanvasCount();

// tabs management

for (let i = 0; i < drawingTabs.length; i++) {
  drawingTabs[i].addEventListener('click', setActiveTab);
}

function setActiveTab() {
  if ((event.target.className == 'tab-cross') && (drawingsSection.children.length > 1)) {
    modal.classList.toggle('modal-active');
    modal.innerHTML = modalOptions.get('warnUnsaved');
    activateButtons('delete');
  }
  else {
    let prevTab = document.getElementsByClassName('tab-active')[0];
    if (prevTab != this) {
      updateCanvasStorage(prevTab);
      prevTab.classList.toggle('tab-active');
      prevTab.children[1].classList.toggle('cross-hidden');
      this.classList.toggle('tab-active');
      this.children[1].classList.toggle('cross-hidden');
      canvas.innerHTML = canvasStorage.find(el => el.name == this.children[0].textContent).canvas;
      clearCanvasHistory();
      saveCanvasStage();
      refreshPreview();
    }
  }
}

function updateCanvasStorage(prevTab) {
  let storedTab = (canvasStorage) ? canvasStorage.find(el => el.name == prevTab.children[0].textContent) : null;
  let canvasString = canvas.innerHTML.replace("<div class=\"preview-pixel\"></div>", "");
  if (storedTab) {
    storedTab.canvas = canvasString;
  }
  else {
    canvasStorage.push({ name: prevTab.children[0].textContent, canvas: canvasString });
  }
}

function updateCanvasCount() {
  systemInfo.canvasCount++;
}

// drawing

canvas.addEventListener('click', (event) => {
  if (event.target.className == 'pixel'){
    event.target.style.backgroundColor = curColor;
    saveCanvasStage();
  }
});

let previewPixel = document.createElement('div');
previewPixel.classList = 'preview-pixel';

function enablePreview() {
  for (pixel of pixels) {
    pixel.addEventListener('mouseenter', togglePreviewPixel);
    pixel.addEventListener('mouseleave', togglePreviewPixel);
  }
}

function disablePreview() {
  for (pixel of pixels) {
    pixel.removeEventListener('mouseenter', togglePreviewPixel);
    pixel.removeEventListener('mouseleave', togglePreviewPixel);
  }
}

function togglePreviewPixel() {
  if (this.children.length == 0)
    this.append(previewPixel);
  else previewPixel.remove();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', endDrawing);

function startDrawing () {
  while (canvasHistory[0] != canvas.innerHTML.replace("<div class=\"preview-pixel\"></div>", "")) {
    canvasHistory.shift();
    --curCanvas;
  }
  if (event.target.className == 'pixel' && 
    !document.getElementsByClassName('instr-active')[0].parentNode.classList.contains('brush')) {
    event.target.style.backgroundColor = curColor;
  }
  for (pixel of pixels)
    pixel.addEventListener('mouseenter', changeColor);
  canvas.addEventListener('mouseleave', endDrawing);
}

function endDrawing () {
  canvas.removeEventListener('mouseleave', endDrawing);
  saveCanvasStage();
  for (pixel of pixels)
    pixel.removeEventListener('mouseenter', changeColor);
}

function changeColor () {
  this.style.backgroundColor = curColor;
}

function enableFloodFill() {
  floodFill(this, this.style.backgroundColor, curColor);
  saveCanvasStage();
}

function floodFill (pixel, targetColor, replacementColor) {
  if (targetColor == replacementColor)
    return;
  if (pixel.style.backgroundColor != targetColor)
    return;
  else pixel.style.backgroundColor = replacementColor;

  let pixelIndex = Array.from(pixel.parentNode.children).indexOf(pixel);
  if (pixel.previousElementSibling)
    floodFill(pixel.previousElementSibling, targetColor, replacementColor);
  if (pixel.nextElementSibling)
    floodFill(pixel.nextElementSibling, targetColor, replacementColor);

  if (pixel.parentNode.previousElementSibling)
    floodFill(pixel.parentNode.previousElementSibling.children[pixelIndex], targetColor, replacementColor);
  if (pixel.parentNode.nextElementSibling)
    floodFill(pixel.parentNode.nextElementSibling.children[pixelIndex], targetColor, replacementColor);
}


// palettes management

function setColors () {
  for (let i = 0; i < colors.length; i++) {
    colors[i].style.backgroundColor = colors[i].getAttribute('data-color');
  
    colors[i].addEventListener('click', (event) => {
      if (colorBlock.style.backgroundColor != event.target.style.backgroundColor) {
        curColor = event.target.style.backgroundColor;
        refreshRecent(colorBlock.style.backgroundColor);
        updateColorBlock();
      }
      if (document.getElementsByClassName('instr-active')[0].parentNode.classList.contains('eraser')) { // если стирашка
        curColor = 'white';
      }
    })
  }
}

for (let i = 0; i < colorsInfo.palettes.length; i++) {
  let pal = colorsInfo.palettes[i];
  let palInput = document.createElement('input');
  palInput.setAttribute('type', 'radio');
  palInput.setAttribute('name', "selectPalette");
  palInput.setAttribute('id', pal["palette-id"]);
  palInput.classList = "select-input";
  selectContent.appendChild(palInput);

  let palLabel = document.createElement('label');
  palLabel.setAttribute('for', pal["palette-id"]);
  palLabel.classList = "select-label";
  palLabel.textContent = pal["palette-label"];
  selectContent.appendChild(palLabel);
}


// palette choice

for (let i = 0; i < selectLabels.length; i++) {
  selectLabels[i].addEventListener('click', (evt) => {
    selectTitle.children[0].textContent = evt.target.textContent;
    updatePalette(evt.target["htmlFor"]);
    handler();
  });
}

selectTitle.addEventListener('click', handler);

function handler() {
  selectContent.classList.toggle("active-select");
  selectTitle.classList.toggle("title-squared");
};

function updatePalette(id) {
  while (colorsRow.firstChild) {
    colorsRow.firstChild.remove();
  }
  let pal = colorsInfo.palettes.find((el) => el["palette-id"] == id);
  for (let i = 0; i < pal["palette-colors"].length; i++){
    let color = pal["palette-colors"][i];
    let colorPlace = document.createElement('div');
    colorPlace.classList = 'color';
    colorPlace.setAttribute('data-color', color);
    colorsRow.appendChild(colorPlace);
  }
  setColors();
}


// displaying specific colors

function updateColorBlock () {
  colorBlock.style.backgroundColor = curColor;
}

colorPicker.addEventListener('change', () => {
  customColor.style.backgroundColor = colorPicker.value;
  if (colorBlock.style.backgroundColor != colorPicker.value) {
    refreshRecent(colorBlock.style.backgroundColor); // save PREVIOUS color, not the new one
    curColor = colorPicker.value;
    updateColorBlock();
  }
  if (document.getElementsByClassName('instr-active')[0].parentNode.classList.contains('eraser')) { // если стирашка
    curColor = 'white';
  }
});

customColor.style.backgroundColor = colorPicker.value; // default

function refreshRecent(newColor) {
  for (let i = recentColors.length - 1; i > 0; i--) {
    recentColors[i].setAttribute('data-color', recentColors[i - 1].getAttribute('data-color'));
    recentColors[i].style.backgroundColor = recentColors[i].getAttribute('data-color');
  }
  recentColors[0].setAttribute('data-color', newColor);
  recentColors[0].style.backgroundColor = recentColors[0].getAttribute('data-color');
}


// instruments 

for (let i = 0; i < instruments.length; i++) {
  instruments[i].addEventListener('click', (event) => {
    if (instruments[i].classList.length <= 2) { // если переключаемся в "режим"
      for (let i = 0; i < pixels.length; i++) {
        pixels[i].removeEventListener('click', enableFloodFill);
      }
      setCursor(event.target.parentNode.classList[1]);    
      event.target.classList.toggle('instr-active');
    }
    drawingOptions.get(event.target.parentNode.classList[1])();
  });
}

function setCursor(cursor) {
  canvas.style = `cursor: url("../img/${cursor}.png"), auto;`;
  if (document.getElementsByClassName('instr-active')[0])
    document.getElementsByClassName('instr-active')[0].classList.toggle('instr-active');
}


// styling

let historyInstrs = document.getElementsByClassName('instr-history');

for (let i = 0; i < optionTabs.length; i++) {
  optionTabs[i].addEventListener('mouseenter', toggleActiveInstr);
  optionTabs[i].addEventListener('mouseleave', toggleActiveInstr);
}

for (let i = 0; i < historyInstrs.length; i++){
  historyInstrs[i].addEventListener('mouseenter', checkHistoryInstr);
  historyInstrs[i].addEventListener('mouseleave', checkHistoryInstr);
  historyInstrs[i].addEventListener('click', checkHistoryInstr);
}

function toggleActiveInstr() {
  this.children[0].classList.toggle('instr-active');
}

function checkHistoryInstr() {
  if (!drawingOptions.get(this.classList[1] + "Check")()){
    this.children[0].style = "filter: none; filter: invert(60%) sepia(0%) saturate(1993%) hue-rotate(176deg) brightness(84%) contrast(81%);";
  }
  else {
    this.children[0].style = "";
  }
  if (document.getElementsByClassName('instr-active')[0].parentNode.classList.contains('brush')) { // если заливка
    for (let i = 0; i < pixels.length; i++) {
      pixels[i].addEventListener('click', enableFloodFill);
    }
  }
}


// save & load  +  undo & redo

function saveCanvasStage() {
  let canvasString = canvas.innerHTML.replace("<div class=\"preview-pixel\"></div>", "");
  if (canvasString != canvasHistory[0]) {
    canvasHistory.unshift(canvasString);
    canvasHistory = canvasHistory.slice(0, historyCap);
  }
}

function refreshPreview() {
  drawingOptions.get('preview')();
  drawingOptions.get('preview')();
}

function clearCanvasHistory() {
  canvasHistory = [];
}


// tab options + modal dialog

for (let i = 0; i < optionTabs.length; i++) {
  optionTabs[i].addEventListener('click', (event) => {
    modal.classList.toggle('modal-active');
    let curOption = optionTabs[i].classList[2];
    modal.innerHTML = modalOptions.get(curOption);
    if (specialOptions.get(curOption)) {
      specialOptions.get(curOption)();
    }
    activateButtons(curOption);
  })
}

function activateButtons(curOption) {
  let cancelBtn = document.getElementsByClassName('modal-cancel');
  let confirmBtn = document.getElementsByClassName('modal-confirm')[0];
  for (let i = 0; i < cancelBtn.length; i++)
    cancelBtn[i].addEventListener('click', () => modal.classList.toggle('modal-active'));
  confirmBtn.addEventListener('click', () => {
    tabOptions.get(curOption)();
    modal.classList.toggle('modal-active');
  });
}

function displayRangeValue(source, field) {
  field.textContent = source.value;
  if (source.id == "range-x")
    systemInfo.rangeX = source.value;
  else systemInfo.rangeY = source.value;
}

function createCanvas(valueX, valueY) {
  let canvasRow = document.createElement('div');
  canvasRow.classList = "canvas-row";
  let pixel = document.createElement('div');
  pixel.classList = "pixel";
  pixel.style.backgroundColor = "white";
  for (let i = 0; i < valueX; i++) {
    canvasRow.appendChild(pixel.cloneNode(true));
  }
  return canvasRow.outerHTML.repeat(+valueY);
}