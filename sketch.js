let mic;
let volHistory = [];
var angle = 0;
var state = ""
let tracksArray = [];
let btnImage1;
const frate = 30; // frame rate

function preload() {
    HME.createH264MP4Encoder().then(enc => {
    encoder = enc
    encoder.outputFilename = 'test'
    encoder.width = 600
    encoder.height = 480
    encoder.frameRate = frate
    encoder.kbps = 5000 
    encoder.groupOfPictures = 10 
    encoder.initialize()
    })
}

function setup() {
  createCanvas(600, 480);
   frameRate(frate)
  mic = new p5.AudioIn();
  mic.start();
  btnImage1 = createImg("./img/recordbutton.png","");
  btnImage1.position(180, 370);
  btnImage2 = createImg("./img/savebutton.png","");
  btnImage2.position(50, -370);
  createTrack();
  angleMode(DEGREES);
  s = createSlider(0,255,12);
  s.position(10,20);
}

function handleTrackButtonClick(trackObject) {
  if (trackObject.state === "idle" && mic.enabled) {
    trackObject.recorder.record(trackObject.soundFile);
    state = "recording";
    trackObject.state = "recording";
    btnImage1.elt.src  = "./img/stopbutton.png"; 
    btnImage1.position(180, 370);
    btnImage2.position(50, -370);
  } else if (trackObject.state === "recording") {
    trackObject.recorder.stop();
     state = "stopped";
    trackObject.state = "stopped";
	btnImage1.elt.src  = "./img/playbutton.png";
    btnImage1.position(50, 370);
    btnImage2.position(320, 370);
  } else if (trackObject.state === "stopped") {
    trackObject.soundFile.loop();
    state = "playing";
    trackObject.state = "playing";
    btnImage1.elt.src  = "./img/stopbutton.png";
    btnImage1.position(50, 370);
    btnImage2.position(320, 370);
  } else if (trackObject.state === "playing") {
    trackObject.soundFile.stop();
    state = "stopped";
    trackObject.state = "stopped";
    btnImage1.elt.src  = "./img/playbutton.png";
    btnImage1.position(50, 370);
    btnImage2.position(320, 370);
  }
}

function createTrack() {
  const newTrackObject = {
    button: btnImage1,
    state: "idle",
    recorder: new p5.SoundRecorder(),
    soundFile: new p5.SoundFile()
  };
  
  btnImage1.mouseClicked(function() {
     handleTrackButtonClick(newTrackObject);
  });
   btnImage2.mouseClicked(function() {
      state = "saved";
     saveSound(newTrackObject.soundFile, 'mySound.wav');
     const anchor = document.createElement('a')
     anchor.href = URL.createObjectURL(newTrackObject.soundFile, { type: 'audio/wav' })
     anchor.download = newTrackObject.soundFile
     anchor.click()
  });
  newTrackObject.recorder.setInput(mic);
  
  tracksArray.push(newTrackObject);
}

function draw() {
  
  alphaVal = s.value();
  background(0,alphaVal);
 // background(51);
  let vol = mic.getLevel();
  translate(width/2, height/2)
  r = random(229); 
  g = random(204); 
  b = random(1255); 
  a = random(220); 
  fill(r, g, b, a);
  noStroke();
  
  if(state === "recording" || state === "playing"){
    volHistory.push(vol);
    beginShape();
    for (let i = 0; i < 360; i++) {
      stroke(255);
      strokeWeight(0.4);
      let r = map(volHistory[i], 0, 1, 10, 600);
      let x = r * cos(i);
      let y = r * sin(i);
      vertex(x, y);
    }
    endShape();
  }
  if(state=== "recording"){
    encoder.addFrameRgba(drawingContext.getImageData(0, 0, encoder.width, encoder.height).data);
  }
  if(state === "saved"){
     state = "stopped";
    btnImage1.position(50, 370);
    btnImage2.position(320, 370);
     encoder.finalize()
     const uint8Array = encoder.FS.readFile(encoder.outputFilename);
     const anchor = document.createElement('a')
     anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }))
     anchor.download = encoder.outputFilename
     anchor.click()
     encoder.delete()
  }

  if(volHistory.length > 360) {
    volHistory.splice(0,1);
  }
}
