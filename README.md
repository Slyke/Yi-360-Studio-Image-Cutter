# Yi-360-Studio-Image-Cutter
Cut equirectangular hemispheres and combine for rendering with Yi 360 Studio while keeping metadata intact.

## Dependencies (non node_modules):
* Git
* NodeJS

## To setup:
1. First clone the repo: `git clone https://github.com/Slyke/Yi-360-Studio-Image-Cutter.git`
2. Navigate to the main directory `cd Yi-360-Studio-Image-Cutter`
3. Then: `npm install` from inside the directory.

## Usage Parameters:
    -top PATH_TO_IMG.jpg
    -bottom PATH_TO_IMG.jpg
    [-output=output.jpg] PATH_TO_OUTPUT.jpg
    [-metadata=top] top|bottom

Top and bottom input images and are required.
Output is optional, and defaults to 'output.jpg'.
Metadata is copied from the top image by default, unless set to 'bottom'.

Example Usage:
  `node.exe index -bottom ./bottomImage.jpg -top ./topImage.jpg`

## How it works:
It takes the top half of the top image and places it onto the top half of the bottom image. This should work with any image if you wish to test it. The trickiest part is keeping the metadata intact for stricting on Yi 360 Studio.