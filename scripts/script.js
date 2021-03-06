/* global variables */
var vertices = [];
var index = 0;
var start = [0];
var type = [];
/* type menyimpan tipe model yang dibuat */
/* 1 = line
    /* 2 = square
    /* 3 = rectangle
    /* 4 = polygon */
var numIndices = [0];
var numModel = 0;

isLine = false;
isSquare = false;
isRectangle = false;
isPolygon = false;

isDrag = false;
isSelect = false;
isPointSelected = false;
var idxSelected = -1;
var vertexSelected = -1;

isDragSquare = false;

/* Prepare the canvas and get WebGL context */
canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");
if (!gl) {
  alert("WebGL isn't available");
}

/* add event listener to canvas */
canvas.addEventListener("mousedown", function (event) {
  // cek apakah sudah memilih menu sebelumnya
  if (!(isLine || isSquare || isRectangle || isPolygon || isSelect)) {
    return;
  }

  // get position
  x = getXClickedPosition(canvas, event);
  y = getYClickedPosition(canvas, event);

  // check if user want to select something
  if (isSelect) {
    showSelectProperties(x, y);
    // check if this click is suppose to select a polygon
    idxSelected = insideOf(x, y);
    if (idxSelected >= 0) {
      // show all select menu & select stats
      document.getElementById("select-id").textContent = idxSelected;
      return;
    }

    // check if this click is suppose to select a point to drag
    if (idxVertex(x, y) != null) {
      isDrag = true;
      indexVertex = idxVertex(x, y);
      indexModel = idxModel(indexVertex);
      canvas.addEventListener("mouseup", function (event) {
        if (type[indexModel] == 1 || type[indexModel] == 4) {
          changePoint(canvas, event, indexVertex);
        }
      });
    }

    if (getSquareVertex(x, y) != null) {
      isDragSquare = true;
      var j = getSquareVertex(x, y);
      canvas.addEventListener("mouseup", function (event) {
        changeSquareSize(canvas, event, j);
        console.log("testChange")
      });
    }
  }

  // check if we want to start drawing
  if (isLine || isSquare || isRectangle || isPolygon) {

    // do "special treatment" depend on the model that the user wants to make
    if (isLine) {
      // push coordinate to array
      vertices.push(x);
      vertices.push(y);

      // push color to array - asuumption: color is black
      vertices.push(0);
      vertices.push(0);
      vertices.push(0);

      drawLine();
      index++;
    } else if (isSquare) {
      drawSquare(x,y);
    } else if (isRectangle) {
      drawRectangle(x,y);
    } else if (isPolygon) {
      // push coordinate to array
      vertices.push(x);
      vertices.push(y);

      // push color to array - asuumption: color is black
      vertices.push(0);
      vertices.push(0);
      vertices.push(0);

      drawPolygon();
      index++;
    }

    // add index, ready to get the next coordinate
    // index++;
  }
});

// return the index of dragged vertex
function idxVertex(x, y) {
  for (i = 0; i < index; i++) {
    var cond_x = x >= vertices[i * 5] - 0.03 && x <= vertices[i * 5] + 0.03;
    var cond_y =
      y >= vertices[i * 5 + 1] - 0.03 && y <= vertices[i * 5 + 1] + 0.03;

    if (cond_x && cond_y) {
      return i;
    }
  }
  return null;
}

function idxModel(indexVertex) {
  for (i = 0; i < numModel; i++) {
    if (indexVertex >= start[i] && indexVertex < start[i] + numIndices[i]) {
      return i;
    }
  }
  return null;
}

// change (x,y) that has been clicked to (new_x, new_y)
function changePoint(canvas, event, i) {
  if (isDrag) {
    var new_x = getXClickedPosition(canvas, event);
    var new_y = getYClickedPosition(canvas, event);

    vertices[i * 5] = new_x;
    vertices[i * 5 + 1] = new_y;

    main();

    isDrag = false;
  }
}

function getSquareVertex(x, y) {
  var i = 0;
  while (i < numModel) {
    if (type[i] == 2) {
      // var vert = [];
      var j = start[i];
      while (j < start[i]+4) {
        var cond_x = (x >= vertices[j*5] - 0.05) && (x <= vertices[j*5] + 0.05)
        var cond_y = (y >= vertices[j*5+1] - 0.05) && (y <= vertices[j*5+1] + 0.05)

        if (cond_x && cond_y) {
          return j;
        }
        j++;
      }
    }
    i++;
  }
  return null;
}

function changeSquareSize(canvas, event, j) {
  console.log("execute changeSquareSize");
  if (isDragSquare) {
    console.log("changing square size");

    var new_x = getXClickedPosition(canvas, event)
    var new_y = getYClickedPosition(canvas, event)

    additionX = new_x - vertices[j*5];
    additionY = new_y - vertices[j*5+1];

    // Upper left vertex is clicked
    if (additionX < 0 && additionY > 0) {
      console.log("upper left");
      vertices[j*5] += additionX;
      vertices[j*5+1] += additionY;

      vertices[(j+1)*5] += additionX;

      vertices[(j+3)*5+1] += additionY;

      main()
      isDragSquare = false;

      return;
    }

    // Lower left vertex is clicked
    else if (additionX < 0 && additionY < 0) {
      vertices[j*5] += additionX;
      vertices[j*5+1] += additionY;

      vertices[(j-1)*5] += additionX;

      vertices[(j+1)*5+1] += additionY;

      main()
      isDragSquare = false;

      return;
    }

    // Lower right vertex is clicked
    else if (additionX > 0 && additionY < 0) {
      vertices[j*5] += additionX;
      vertices[j*5+1] += additionY;

      vertices[(j-1)*5+1] += additionY;

      vertices[(j+1)*5] += additionX;

      main()
      isDragSquare = false;

      return;
    }

    // Upper right vertex is clicked
    else if (additionX > 0 && additionY > 0) {
      vertices[j*5] += additionX;
      vertices[j*5+1] += additionY;

      vertices[(j-1)*5] += additionX;

      vertices[(j-3)*5+1] += additionY;

      main()
      isDragSquare = false;

      return;
    }
  }
}

function insideOf(x, y) {
  var insideOf = -1;
  for (i = 0; i < numModel; i++) {
    if (type[i] == 4) {
      // gather all vertices
      var vert = [];
      var a = start[i];
      for (j = a; j < a + numIndices[i]; j++) {
        var point = [];
        point.push(vertices[j * 5]);
        point.push(vertices[j * 5 + 1]);
        vert.push(point);
      }
      if (isInside(x, y, vert)) {
        return i;
      }
    }
  }
  return insideOf;
}

function isInside(x, y, vert) {
  var inside = false;
  for (var i = 0, j = vert.length - 1; i < vert.length; j = i++) {
    var xi = vert[i][0],
      yi = vert[i][1];
    var xj = vert[j][0],
      yj = vert[j][1];

    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/* create and compile shader program */
var vertexShaderCode = `precision mediump float;
attribute vec2 vertexPosition;
attribute vec3 vertexColor;
varying vec3 fragColor;
void main() {
    fragColor = vertexColor;
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
    gl_PointSize = 3.0;
}`;

var fragmentShaderCode = `precision mediump float;
varying vec3 fragColor;
void main() {
    gl_FragColor = vec4(fragColor, 1.0);
}`;

var createShader = function (type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Error compiling shader!", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return;
  }

  return shader;
};

var createProgram = function (vertexShader, fragmentShader) {
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(
      "Error linking program!",
      gl.getProgramInfoLog(shaderProgram)
    );
    gl.deleteProgram(shaderProgram);
    return;
  }
  gl.validateProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
    console.error(
      "Error validating program!",
      gl.getProgramInfoLog(shaderProgram)
    );
    gl.deleteProgram(shaderProgram);
    return;
  }

  return shaderProgram;
};

var shader = function () {
  // create shader
  var vertshader = createShader(gl.VERTEX_SHADER, vertexShaderCode);
  var fragshader = createShader(gl.FRAGMENT_SHADER, fragmentShaderCode);

  // create shader program
  var program = createProgram(vertshader, fragshader);

  return program;
};

/* Create buffer object and associate the shader program to buffer objects */
var associateBufferShader = function (shaderProgram, vertices) {
  var vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.useProgram(program);
  var posAttribLocation = gl.getAttribLocation(shaderProgram, "vertexPosition");
  var colorAttribLocation = gl.getAttribLocation(shaderProgram, "vertexColor");

  gl.vertexAttribPointer(
    posAttribLocation, // Attribute location
    2, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(posAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);
};

/* create shader and draw object */
var main = function () {
  // set shader
  program = shader();

  // associate buffer and shader
  associateBufferShader(program, vertices);

  // render
  render();
};

var getXClickedPosition = function (canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  return (x - canvas.width / 2) / (canvas.width / 2);
  //return (2 * event.clientX) / canvas.width - 1;
};

var getYClickedPosition = function (canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const y = event.clientY - rect.top;
  return ((y - canvas.height / 2) / (canvas.height / 2)) * -1;
  //return (2 * (canvas.height - event.clientY)) / canvas.height - 1;
};

var render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (var i = 0; i < numModel; i++) {
    // if Model[i] is a line
    if (type[i] == 1) {
      gl.drawArrays(gl.LINES, start[i], 2);
      gl.drawArrays(gl.POINTS, start[i], 2);
    }
    // if Model[i] is a square
    if (type[i] == 2) {
      gl.drawArrays(gl.TRIANGLE_FAN, start[i], 4)
    }
    // if Model[i] is a rectangle
    if (type[i] == 3) {
      gl.drawArrays(gl.TRIANGLE_FAN, start[i], 4)
    }
    // if Model[i] is a polygon
    if (type[i] == 4) {
      gl.drawArrays(gl.TRIANGLE_FAN, start[i], numIndices[i]);
      gl.drawArrays(gl.POINTS, start[i], numIndices[i]);
    }
    // debug
    // console.log("masuk render ke-" + i);
    // console.log(type[i]);
  }
};

var setSelect = function () {
  isSelect = true;
  isLine = false;
  isSquare = false;
  isRectangle = false;
  isPolygon = false;

  // hide extra menus
  document.getElementById("extramenuPolygon").style.display = "none";
};

var showSelectProperties = function (x, y) {
  document.getElementById("select-x").textContent = x.toFixed(5);
  document.getElementById("select-y").textContent = y.toFixed(5);
  document.getElementById("selectStats").style.display = "grid";
};

var changeColor = function () {
  if (!isSelect) {
    alert("Select polygon you want the color to change first");
    return;
  }
  var hex = document.getElementById("col-picker").value;
  var rgb = [0.0, 0.0, 0.0];

  rgb = hexToRgb(hex);

  // change vertices element
  var startIdx = start[idxSelected] * 5;
  for (i = 0; i < numIndices[idxSelected]; i++) {
    vertices[startIdx + i * 5 + 2] = rgb[0] / 255;
    vertices[startIdx + i * 5 + 3] = rgb[1] / 255;
    vertices[startIdx + i * 5 + 4] = rgb[2] / 255;
  }

  main();

  document.getElementById("selectStats").style.display = "none";
};

var hexToRgb = (hex) =>
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => "#" + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16));

/* help popup */
function openHelp() {
  document.getElementById("help-popup").style.display = "block";
}

function closeHelp() {
  document.getElementById("help-popup").style.display = "none";
}

/* save file */
function saveFile() {
  // get filename
  var filename = document.getElementById("filename").value;
  if (filename == "") {
    filename = "webgl project";
  }

  // collect project's variables
  var objToExport = [];
  objToExport.push(numModel);
  objToExport.push(type);
  objToExport.push(start);
  objToExport.push(numIndices);
  objToExport.push(index);
  objToExport.push(vertices);

  // stringify objToExport
  var data = JSON.stringify(objToExport);

  // download data
  download(filename + ".json", data);

  // show success info
  alert("Save file success");
}

var download = function (filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

/* load file */
function loadFile() {
  // get file chosen
  var file = document.getElementById("import_file").files[0];
  if (!file) {
    alert("Choose a json file first");
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    console.log("file imported");
    arrObjects = JSON.parse(e.target.result);
    LoadData(arrObjects);
  };

  reader.readAsText(file);
}

function LoadData(arrObjects) {
  // save new global variables
  numModel = arrObjects[0];
  type = arrObjects[1];
  start = arrObjects[2];
  numIndices = arrObjects[3];
  index = arrObjects[4];
  vertices = arrObjects[5];

  // render
  main();
  alert("The file is successfully loaded");
}
