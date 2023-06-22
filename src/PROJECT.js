"use strict";

//// camera parameters
var near;
var far;
var radius;
var theta;
var phi;
var fov;
var aspect;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var right= true;

var Up = true; //for my update function
var direction = 1;

//---------------------mycode

var keysPressed = new Array();
var TrueArray = ['B','R','G','T','P','Y','R','B','O','V'];
var numberofKeysEntered = 0;
var currentKey;


//mouse click event: clicking and guessing the cubes 
function getCursorPosition(canvas, event){
const xCoor = event.clientX;
  const yCoor = event.clientY;
  console.log("x coordinate: " + xCoor);
  console.log("y coordinate: " + yCoor);
  if((xCoor > 100 & xCoor < 170) | (yCoor > 314 & yCoor < 340))
	  console.log("pink cube?");
  else if((xCoor > 250 & xCoor < 280) | (yCoor > 317 & yCoor < 370))
	  console.log("yellow cube?");
  else if((xCoor > 420 & xCoor < 480) | (yCoor > 406 & yCoor < 470))
	  console.log("violet cube?");
 
	//todo: how to get x,y,z coordinates relative to webgl from the above coordinates?
}


window.addEventListener('mousedown', function(e) {
    getCursorPosition("gl-canvas", e)
})

//keyboard click event
window.addEventListener("keydown", function (e){
	numberofKeysEntered++;
    var keynum; 
	
	var current;
    if(window.event) {                
      keynum = e.keyCode;
    } else if(e.which){               
      keynum = e.which;
    }
	
	keysPressed.push(String.fromCharCode(keynum));
	
	if(numberofKeysEntered == 10){
		console.log(keysPressed); 
		console.log("complete");
		var win;
		TrueArray.forEach(function(item){
			if(keysPressed[item] == TrueArray[item])
			{win = true}
			else
			{win=false}
		})
		
  }
    console.log(win);
		if(win == true)
			alert("You win! :)");
		else if(win == false)
			alert("You lose! :(");
		
	console.log("keyspressed: " + keysPressed);
	
	document.getElementById("key").innerHTML +=  e.key + ", "; //displays the pressed key

  })
  
  
		
//----------------------

//// a class that represents the gameobject transformation matrices
class Transformation {
  constructor({
    scaling = mat4(),
    rotation = mat4(),
    translation = mat4()
  } = {}) {
    this.scaling = scaling;
    this.rotation = rotation;
    this.translation = translation;
  }
  modelMatrix() {
    return mult(this.translation, mult(this.rotation, this.scaling));
  }
}

//// base class for game objects
class GameObject {
  constructor(gl, transformation, updateFunction = -1) {
    //// WebGL rendering context
    this.gl = gl;

    //// the program objects obtained from shaders
    this.program = initShaders(gl, "vertex-shader", "fragment-shader");

    //// Model view projection matrices
    this.transformation = transformation;
    this.viewMatrix = mat4();
    this.projectionMatrix = mat4();

    this.updateFunction = updateFunction;
  }

  update() {
    if (this.updateFunction != -1) {
      this.updateFunction(this);
    }
  }
}

//// Cube is a game object
class Cube extends GameObject {
  constructor(gl, color, transformation, updateFunction = -1) {
    super(gl, transformation, updateFunction);

    //// Model buffers and attributes
    [this.pointsArray, this.colorsArray] = cubePointsAndColors(color);
    this.numVertices = 36;
    this.initAttributeBuffers();

    //// Uniform Locations
    this.modelViewProjectionMatrixLoc = gl.getUniformLocation(
      this.program,
      "modelViewProjectionMatrix"
    );
  }

  initAttributeBuffers() {
    //// color attribute
    this.cBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(this.colorsArray),
      this.gl.STATIC_DRAW
    );
    this.vColor = this.gl.getAttribLocation(this.program, "vColor");

    //// position attribute
    this.vBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(this.pointsArray),
      this.gl.STATIC_DRAW
    );
    this.vPosition = this.gl.getAttribLocation(this.program, "vPosition");
  }

  draw() {
    //// color attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBuffer);
    this.gl.vertexAttribPointer(this.vColor, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.vColor);

    //// position attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
    this.gl.vertexAttribPointer(this.vPosition, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.vPosition);

    //// modelViewProjectionMatrix uniform
    const modelViewProjectionMatrix = mult(
      this.projectionMatrix,
      mult(this.viewMatrix, this.transformation.modelMatrix())
    );
    this.gl.uniformMatrix4fv(
      this.modelViewProjectionMatrixLoc,
      false,
      flatten(modelViewProjectionMatrix)
    );

    //// draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numVertices);
  }
} // class Cube

window.onload = function init() {
  const gl = setupWebGL();

  const gameObjects = setupGameObjects(gl); //create moving cube

  setupGUI(); //we set up here what happens when we change a slider

  render(gl, gameObjects); //where we actually draw stuff
};

var render = function(gl, gameObjects) {
  //// clear the background
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //// camera settings
  eye = vec3(
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(theta)
  );
  const viewMatrix = lookAt(eye, at, up);
  const projectionMatrix = perspective(fov, aspect, near, far);

  //// draw all objects
  for (let objectI = 0; objectI < gameObjects.length; objectI++) {
    const gameObject = gameObjects[objectI];
		
	gameObject.update();
		gl.useProgram(gameObject.program);
		gameObject.viewMatrix = viewMatrix;
		gameObject.projectionMatrix = projectionMatrix;
		gameObject.draw();
  }

  //// call self for recursion
  requestAnimFrame(() => render(gl, gameObjects)); //gameObjects draws itself
};

function setupGameObjects(gl) {
  const gameObjects = [];
  var pos = 3;
  var i = 0;
  var redBox = new Cube(
  
  gl, 
  vec4(1, 0.0, 0.0, 1.0),
  new Transformation({translation: translate(1, 3, 1)}), //the starting position
  function(obj) {
	   obj.transformation.rotation = mult(
        rotateY(0.5), //this makes it move a little bit to the top in each frame
        obj.transformation.rotation
      );
     
    });
  var GreenBox = new Cube(
   gl, 
  vec4(0.0, 1, 0.0, 1.0),
  new Transformation({translation: translate(2, 2, 2)}), //the starting position
  function(obj) {
	   obj.transformation.rotation = mult(
        rotateY(0.5), //this makes it move a little bit to the top in each frame
        obj.transformation.rotation
      );
	  
	  const t = obj.transformation.translation;
	  const x = t[0][3];
      const y = t[1][3];
      const z = t[2][3];
	
	  if(x > 5){
		  right = false;
		  
	  }
	  if(x <= 0){right = true;}
	  if(right){
		  obj.transformation.translation = mult(
	  translate(0.01, 0.0, 0),
	  obj.transformation.translation
	  );
	 
	  }
	  else
	  {
		  obj.transformation.translation = mult(
	  translate(-0.01, 0.0, 0),
	  obj.transformation.translation
		   );
	  }
     
    }
  );
  var TurquoiseBox = new Cube(
   gl, 
  vec4(0.0, 0.5, 0.5, 1.0),
  new Transformation({translation: translate(-4, 3, -2)}), //the starting position
  function(obj) {
	   obj.transformation.rotation = mult(
        rotateX(0.5), //this makes it move a little bit to the top in each frame
        obj.transformation.rotation
      );
	  
    });
  var PinkBox = new Cube( gl, 
  vec4(1, 0.2, 0.4, 1.0),
  new Transformation({translation: translate(0, 4, 6)}), //the starting position
  function(obj) {
	   obj.transformation.rotation = mult(
        rotateY(0.5), //this makes it move a little bit to the top in each frame
        obj.transformation.rotation
      );
     
    });
  var YellowBox = new Cube(
   gl, 
  vec4(1, 1, 0.0, 1.0),
  new Transformation({translation: translate(1, 1, 5)}), //the starting position
  function(obj) {
	   obj.transformation.rotation = mult(
        rotateY(0.5), //this makes it move a little bit to the top in each frame
        obj.transformation.rotation
      );
     
    });
  var redBox2 = new Cube(
   gl, 
  vec4(1, 0.0, 0.0, 1.0),
  new Transformation({translation: translate(-4, 2, 1.5)}), //the starting position
  function(obj) {
	   obj.transformation.rotation = mult(
        rotateY(0.5), //this makes it move a little bit to the top in each frame
        obj.transformation.rotation
      );
	  
	  const t = obj.transformation.translation;
	  const x = t[0][3];
      const y = t[1][3];
      const z = t[2][3];
	
	  if(x > 7){
		  right = false;
		  
	  }
	  if(x <= 0){right = true;}
	  if(right){
		  obj.transformation.translation = mult(
	  translate(0.01, 0.0, 0),
	  obj.transformation.translation
	  );
	 
	  }
	  else
	  {
		  obj.transformation.translation = mult(
	  translate(-0.01, 0.0, 0),
	  obj.transformation.translation
		   );
	  }
     
    }
  );
  var lightBlueBox = new Cube( gl, 
  vec4(0.0, 0.0, 0.9, 1.0),
  new Transformation({translation: translate(4, 3, 3)}), //the starting position
  function(obj) {
	   obj.transformation.rotation = mult(
        rotateX(0.5), //this makes it move a little bit to the top in each frame
        obj.transformation.rotation
      );
	  
     
    });
  var OrangeBox = new Cube(
   gl, 
  vec4(1, 0.5, 0.0, 1.0),
  new Transformation({translation: translate(3, 4, 4)}), //the starting position
  function(obj) {
	   obj.transformation.rotation = mult(
        rotateY(0.5), //this makes it move a little bit to the top in each frame
        obj.transformation.rotation
      );
	  
	  const t = obj.transformation.translation;
	  const x = t[0][3];
      const y = t[1][3];
      const z = t[2][3];
	
	  if(x > 5){
		  right = false;
		  
	  }
	  if(x <= 0){right = true;}
	  if(right){
		  obj.transformation.translation = mult(
	  translate(0.01, 0.0, 0),
	  obj.transformation.translation
	  );
	 
	  }
	  else
	  {
		  obj.transformation.translation = mult(
	  translate(-0.01, 0.0, 0),
	  obj.transformation.translation
		   );
	  }
     
    });
  var VioletBox = new Cube(
   gl, 
  vec4(0.5, 0.0, 0.5, 1.0),
  new Transformation({translation: translate(4, 1, 5)}), //the starting position
  function(obj) {
	   obj.transformation.rotation = mult(
        rotateZ(0.5), //this makes it move a little bit to the top in each frame
        obj.transformation.rotation
      );
     
    });
  var blueBox = new Cube(
  gl, 
  vec4(0.0, 0.0, 1, 1.0),
  new Transformation({translation: translate(3, 3, 0)}), //the starting position
  function(obj) {
	   obj.transformation.rotation = mult(
        rotateY(0.5), //this makes it move a little bit to the top in each frame
        obj.transformation.rotation
      );
	  
	  const t = obj.transformation.translation;
	  const x = t[0][3];
      const y = t[1][3];
      const z = t[2][3];
	
	  if(x > 5){
		  right = false;
		  
	  }
	  if(x <= 0){
		  right = true;
		  
	  }
	  if(right){
		  obj.transformation.translation = mult(
	  translate(0.01, 0.0, 0),
	  obj.transformation.translation
	  );
	 
	  }
	  else
	  {
		  obj.transformation.translation = mult(
	  translate(-0.01, 0.0, 0),
	  obj.transformation.translation
		   );
	  }
     
    }
  );
 
  
  //need to synchronise this to occur before all other code
  var gameLevel = prompt("Please enter the number of your preffered difficulty level:\n easy 1\n intermediate 2\n hard 3\n", "1");
  var gameDifficulty; 
  //gameLevel = document.getElementById("myRadio").value;
  if(gameLevel == 2)
	gameDifficulty = 500;
  else if(gameLevel == 3)
	  gameDifficulty = 380;
  else
	  gameDifficulty = 1000; //easy
  
  console.log("Level of difficulty is: " + gameDifficulty);
  
  gameObjects.push(blueBox);
  
  setTimeout(() => {gameObjects.push(redBox)}, gameDifficulty);
  setTimeout(() => {gameObjects.push(GreenBox)}, gameDifficulty * 2);
  setTimeout(() => {gameObjects.push(TurquoiseBox)}, gameDifficulty * 3);
  setTimeout(() => {gameObjects.push(PinkBox)}, gameDifficulty * 4);
  setTimeout(() => {gameObjects.push(YellowBox)}, gameDifficulty * 5);
  setTimeout(() => {gameObjects.push(redBox2)}, gameDifficulty * 6);
  setTimeout(() => {gameObjects.push(lightBlueBox)}, gameDifficulty * 7);
  setTimeout(() => {gameObjects.push(OrangeBox)}, gameDifficulty * 8);
  setTimeout(() => {gameObjects.push(VioletBox)}, gameDifficulty * 9);
  setTimeout (() => {alert("Time's up!")}, gameDifficulty * 11);

  
  
  var ground = new Cube(
    gl,
    vec4(0.5, 0.5, 0.5, 1.0),
    new Transformation({ scaling: scalem(20, 0.1, 20) })
  );
    
  gameObjects.push(ground);
 
  return gameObjects;
}

function setupWebGL() {
  const canvas = document.getElementById("gl-canvas");
  const gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  aspect = canvas.width / canvas.height;
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  return gl;
}

////
function setupGUI() {
  far = document.getElementById("zFarSlider").value;
  document.getElementById("zFarSlider").oninput = function(event) {
    far = event.target.value;
    document.getElementById("zFarValue").innerHTML = far;
  };

  near = document.getElementById("zNearSlider").value;
  document.getElementById("zNearSlider").oninput = function(event) {
    near = event.target.value;
    document.getElementById("zNearValue").innerHTML = near;
  };

  radius = document.getElementById("radiusSlider").value;
  document.getElementById("radiusSlider").oninput = function(event) {
    radius = event.target.value;
    document.getElementById("radiusValue").innerHTML = radius;
  };

  theta = document.getElementById("thetaSlider").value;
  document.getElementById("thetaSlider").oninput = function(event) {
    theta = (event.target.value * Math.PI) / 180.0;
    document.getElementById("thetaValue").innerHTML = event.target.value;
  };

  phi = document.getElementById("phiSlider").value;
  document.getElementById("phiSlider").oninput = function(event) {
    phi = (event.target.value * Math.PI) / 180.0;
    document.getElementById("phiValue").innerHTML = event.target.value;
  };

  document.getElementById("aspectSlider").value = aspect;
  document.getElementById("aspectValue").innerHTML = aspect;
  document.getElementById("aspectSlider").oninput = function(event) {
    aspect = event.target.value;
    document.getElementById("aspectValue").innerHTML = aspect;
  };

  fov = document.getElementById("fovSlider").value;
  document.getElementById("fovSlider").oninput = function(event) {
    fov = event.target.value;
    document.getElementById("fovValue").innerHTML = fov;
  };
  
}


////
function cubePointsAndColors(color) {
  var pointsArray = [];
  var colorsArray = [];
  var vertices = [
    vec4(-0.5, 0, 0.5, 1.0),
    vec4(-0.5, 1, 0.5, 1.0),
    vec4(0.5, 1, 0.5, 1.0),
    vec4(0.5, 0, 0.5, 1.0),
    vec4(-0.5, 0, -0.5, 1.0),
    vec4(-0.5, 1, -0.5, 1.0),
    vec4(0.5, 1, -0.5, 1.0),
    vec4(0.5, 0, -0.5, 1.0)
  ];
  var vertexColors = [color, color, color, color, color, color, color, color];
  function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[b]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[d]);
    colorsArray.push(vertexColors[a]);
  }

  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
  return [pointsArray, colorsArray];
}