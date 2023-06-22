# Computer Graphics Course Project - Interactive 3D game

## Info
My course project for Computer Graphics, IKU.

| created by | Sara Ahmed, Wafaa Aly |
|---|---|
| birth year | Dec, 2019 |
| tech used | WebGL |


## How it works
- you get to choose a difficulty level (control the speed with which the cubes appear) in the alert that appears as soon as the web page loads.
    - In "hard" mode, you need to type the letters super quickly 
    as soon as you see them. The game ends faster. In "easy" mode, you can type the letters at a normal pace but still you have to do it 
    before time up. "Intermediate" is in between.
- the cubes will appear one by one, what you have to do is write the first letters of the color of each cube as soon as it appears (for example, press "r" when you see a red cube, "o" when you see an orange cube)
before the time is up. If the array of colors you enter matches the stored array, you win. Otherwise, you lose.
    - the letters you type appear dynamically above the canvas as you type them.
    - the array which stores the entered values can be seen while it's building up in the console.
    - after a total number of 10 cubes appear, the page displays a "Time's up" alert which ends the game.
- The project tracks mouse input: you can click on the canvas, and get the coordinates of the point where you clicked (x,y)
    - the coordinates are displayed in the console
    - I've tried adding a feature of displaying which cube was clicked, but I could not map the canvas coordinates to the object coordinates, so I was not able to find out exactly what cube was clicked in an efficient way. Right now, it  just makes a "guess" as to which cube it can be and it does this for three cubes only; the yellow, the violet and the pink.