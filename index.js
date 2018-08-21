var jimp = require('jimp');
var piexifjs = require('piexifjs');
const fs = require('fs');

var topImg;
var botImg;
var saveImg = 'output.jpg';
var metadataSource = 'top';

var state = 0;
var metadata;
var topImageData;
var bottomImageData;

const printHelp = () => {

  const nodePath = process.argv[0].replace(/\\/g,"/");
  const scriptPath = process.argv[1].replace(/\\/g,"/");

  console.log("Usage: ");
  console.log("  -top PATH_TO_IMG.jpg");
  console.log("  -bottom PATH_TO_IMG.jpg");
  console.log("  [-output=output.jpg] PATH_TO_OUTPUT.jpg");
  console.log("  [-metadata=top] top|bottom");
  console.log(" ");
  console.log("Top and bottom input images and are required.");
  console.log("Output is optional, and defaults to 'output.jpg'.");
  console.log("Metadata is copied from the top image by default, unless set to 'bottom'.");
  console.log(" ");
  console.log("Example Usage: ");
  console.log(" ", nodePath.substring(nodePath.lastIndexOf('/') + 1), scriptPath.substring(scriptPath.lastIndexOf('/') + 1), "-b ./bottomImage.jpg -t ./topImage.jpg");
};

const processArgs = (args) => {
  for (var i = 0; i < args.length; i++) {
    ((index)=> {
      switch (args[index]) {
        case '-t':
        case '--top':
          if (args.length > i + 1) {
            topImg = args[index + 1];
            i++;
          }
          break;

        case '--bottom':
        case '--bot':
        case '-b':
          if (args.length > i + 1) {
            botImg = args[index + 1];
            i++;
          }
          break;

        case '--output':
        case '--out':
        case '-o':
          if (args.length > i + 1) {
            botImg = args[index + 1];
            i++;
          }
          break;

        case '--metadata':
        case '--meta':
        case '-m':
          if (args.length > i + 1) {
            const tmpMeta = args[index + 1];
            if (tmpMeta === 'bot' || tmpMeta === 'bottom') {
              metadataSource = 'bottom';
            } else if (tmpMeta === 'top') {
              metadataSource = 'top';
            } else {
              console.log("Warning: Unknown metadata setting: ", tmpMeta);
            }
            i++;
          }
          break;
  
          case '--help':
          case '-h':
            printHelp();
            process.exit(0);
            break;
    
      }
    })(i);
  }

  if (!(topImg || botImg)) {
    console.log("Error: Input images both need to be specified.");
    console.log(" ");
    printHelp();
    process.exit(1);
  }
};

const processImages = () => {
  if ((state & 7) === 7) {
    compositeImages();
  }
};

const readMetaDataFile = (topOrBot) => {
  const fileToRead = (topOrBot === 'bottom' ? botImg : topImg);
  fs.readFile(fileToRead, function(err, fileContents) {
    if (err) {
      console.log("Error reading metadata file: ", err);
      console.log("Filename: ", fileToRead);
      console.log("Selection: ", topOrBot);
      process.exit(2);
    }

    var fileData = fileContents.toString("binary");
    var metadataRaw = piexifjs.load(fileData);
    metadata = piexifjs.dump(metadataRaw);

    state += 1;

    processImages();
  });
};

const readTopImage = () => {
  jimp.read(topImg, (err, imageData) => {
    if (err) {
      console.log("Error reading top file: ", err);
      console.log("Filename: ", topImg);
      process.exit(3);
    }

    topImageData = imageData.crop(0, 0, imageData.bitmap.width, (imageData.bitmap.height / 2));

    state += 2;

    processImages();
  });
};

const readBottomImage = () => {
  jimp.read(botImg, (err, imageData) => {
    if (err) {
      console.log("Error reading bottom file: ", err);
      console.log("Filename: ", botImg);
      process.exit(4);
    }

    imageData.quality(100);
    bottomImageData = imageData;

    state += 4;

    processImages();
  });
};

const compositeImages = () => {
  bottomImageData.composite(topImageData, 0, 0);
  bottomImageData.write(saveImg, () => {
    cloneMetadata();
  });
}

const cloneMetadata = () => {
  fs.readFile(saveImg, (err, outputFileData) => {
    if (err) {
      console.log("Error reading output file for metadata injection: ", err);
      console.log("Filename: ", saveImg);
      process.exit(5);
    }

    var outputFileBin = outputFileData.toString("binary");

    var newData = piexifjs.insert(metadata, outputFileBin);
    var newJpeg = new Buffer(newData, "binary");
  
    fs.writeFile(saveImg, newJpeg, (err) => {
      if (err) {
        console.log("Error writing output file: ", err);
        console.log("Filename: ", saveImg);
        process.exit(6);
      }

      process.exit(0);
    });
  });
};

processArgs(process.argv);

readMetaDataFile(metadataSource);
readTopImage();
readBottomImage();
