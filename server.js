var http = require("http");
const path = require("path");
const fs = require("fs");
const testFolder = "files/";
const requiredFiles = ["AC", "AH", "AF", "AM", "AP", "AN", "AU", "AT"];
var afData = new Map();

let readAllFile = new Promise((resolve, reject) => {
  main = this;
  var totalFiles = [];

  fs.readdir(testFolder, (err, files) => {
    requiredFiles.map((pre) => {
      //console.log(pre);
      var find = 0;
      files.forEach((file) => {
        if (pre == file.substr(0, 2)) {
          find = 1;
        }
      });
      if (find == 0) {
        reject("No se encontró creado el archivo " + pre);
      }
    });
    resolve(files);
  });
});



/**
 * Promesa que recorre las lineas de un archivo y lo convierte en un map
 */
const readAditionalFiles = (file, index) =>
  new Promise(function (resolve, reject) {
    var data = fs
      .readFileSync("files/" + file, "utf8")
      .toString()
      .split("\n");
    var newMap = new Map();
    for (var numLinea = 0; numLinea < data.length; numLinea++) {
      if (data[numLinea] != "") {
            data[numLinea] = data[numLinea].substring(0, data[numLinea].length - 2);
            lineaSplit = data[numLinea].split(",");

            var findLine = newMap.get(lineaSplit[0]);
            console.log(findLine);
            if(findLine == undefined){
                newMap.set(lineaSplit[index], {text: data[numLinea], count: 1});
            }
            else
            {
                findLine.text = findLine.text.toString() + "\n" + data[numLinea].toString();
                newMap.set(lineaSplit[index],  {text: data[numLinea], count: findLine.count+1});
            }
          
      }
    }
    resolve({"file" : file.substr(0,2) , data: newMap});
  });





  
/**
 * Controlador principal a partir del archivo ac
 */
readAllFile
  .then((files) => {
    var AF = files.find((fileName) => fileName.substr(0, 2) == "AF");
    var acData = new Map();
    var ahData = new Map();
    var amData = new Map();
    var anData = new Map();
    var apData = new Map();
    var atData = new Map();
    var usData = new Map();
    var ahData = new Map();    
    try {
      // var data = fs.readFileSync( 'utf8');
      var data = fs
        .readFileSync("files/" + AF, "utf8")
        .toString()
        .split("\n");
      for (var numLinea = 0; numLinea < data.length; numLinea++) {
        if (data[numLinea] != "") {
          data[numLinea] = data[numLinea].substring(
            0,
            data[numLinea].length - 2
          );
          lineaSplit = data[numLinea].split(",");


          afData.set(lineaSplit[4], data[numLinea]);
        }
      }

    
    

      Promise.all([
      readAditionalFiles(files.find((fileName) => fileName.substr(0, 2) == "AC"),0),
      readAditionalFiles(files.find((fileName) => fileName.substr(0, 2) == "AH"),0), 
      readAditionalFiles(files.find((fileName) => fileName.substr(0, 2) == "AM"),0), 
      readAditionalFiles(files.find((fileName) => fileName.substr(0, 2) == "AN"),0), 
      readAditionalFiles(files.find((fileName) => fileName.substr(0, 2) == "AP"),0),
      readAditionalFiles(files.find((fileName) => fileName.substr(0, 2) == "AT"),0), 
      readAditionalFiles(files.find((fileName) => fileName.substr(0, 2) == "AU"),0)]).then(maps => { 
        console.log(maps);
      }, reason => {
        console.log(reason)
      });
     

    } catch (e) {
      console.log("Error:", e.stack);
    }
  })
  .catch(function (err) {
    console.log(err);
  });

/*const createServer = () => {
    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});

    }).listen(8080);
}*/

//createServer();
