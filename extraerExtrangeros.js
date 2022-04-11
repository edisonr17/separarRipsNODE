var http = require("http");
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");
const utf8 = require('utf8');
var Filequeue = require('filequeue');
var fq = new Filequeue(50);
var filesCreator = [];
const { dir } = require("console");
const { isRegExp } = require("util");
const testFolder = "files/";
const requiredFiles = ["AC", "AH", "AF", "AM", "AP", "AN", "AU", "AT"];
var afData = new Map();
var usData = new Map();
var extrangeros = new Map();
/**
** Aquí termina la inclusión de las librerias necesarias
*/

// Array que contiene el listado de facturas ___ PENDIENTE DE USO
const listFacts = [""];//["1822", "310897"];



/** 
* Método que permite identificar si falta algun archivo en la definición 
*/
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
    resolve({ data: files, users: new Map() });
  });
});

/**
*TERMINA IDENTIFICACIÓN DE ARCHIVOS
*/


/**
* PERMITE CREAR UN ARCHIVO por elemento de un array
*/

const crearArchivo = (array) => new Promise((resolve, reject) => {
  // console.log(array);

  for (var file = 0; file < array.length; file++) {
    escribirArchivo(array[file].folder, array[file].fileName, array[file].data).then(function () {
    });
  }
});



/**
 * Escribe el archivo
 */
const escribirArchivo = async (path, fileName, value) => new Promise((resolve, reject) => {
  var dir = path;
  if (!fs.existsSync("results")) {
    fs.mkdirSync("results");
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fq.writeFile(path + fileName, value, function (err) {
    if (err) return console.log(err);

  });
});


/**
 * Metodo que recorre un archivo y lo agrupa por un indice en un archivo
 */
const readAditionalFiles = (file, index) =>
  new Promise(function (resolve, reject) {
    var data = fs.readFileSync("files/" + file, "latin1").toString().split("\n");
    var newMap = new Map();


    for (var numLinea = 0; numLinea < data.length; numLinea++) {
      //Validamos que la linea no esté vacía
      if (data[numLinea] != "") {
        data[numLinea] = data[numLinea].substring(0, data[numLinea].length);
        lineaSplit = data[numLinea].split(",");


        //Recorremos linea a linea un archivo plano
        var findLine = newMap.get(lineaSplit[0]);




        if (file == "US001.txt" && lineaSplit[indexDocumentType] == "CE") {
          //console.log(file, index);
          // console.log(lineaSplit);
        }

        var indexDocumentType = (index == 0) ? 2 : 0;
        var indexDoc = (index == 0) ? 3 : 1;
        if (lineaSplit[indexDoc] != undefined) {


          if (lineaSplit[indexDocumentType] == "CE" || lineaSplit[indexDocumentType] == "PE" || lineaSplit[indexDocumentType] == "PA" || lineaSplit[indexDocumentType] == "PT" || lineaSplit[indexDocumentType] == "DE" || lineaSplit[indexDoc].toString().substr(0, 3) == "VEN") {
            {
              if (file == "US001.txt" && lineaSplit[indexDocumentType] == "CE") {
                // console.log(file, indexDocumentType);
                // console.log(lineaSplit);
              }
              if (indexDocumentType == 2) {
                extrangeros.set(lineaSplit[index], true);

                let docFinal = (lineaSplit[indexDocumentType + 1].toString().substr(0, 3) == "VEN") ? lineaSplit[indexDocumentType + 1] : "VEN" + lineaSplit[indexDocumentType + 1];
                data[numLinea] = data[numLinea].toString().replace(lineaSplit[indexDocumentType + 1], docFinal);
              }

              if (findLine == undefined) {
                newMap.set(lineaSplit[index], { text: data[numLinea], count: 1 });
              } else {
                findLine.text = findLine.text.toString() + "\n" + data[numLinea].toString();
                newMap.set(lineaSplit[index], {
                  text: findLine.text,
                  count: findLine.count + 1,
                });
              }
            }


            if (index == 0) {
              let fact = afData.get(lineaSplit[index]);

              if (fact != undefined) {
                if (lineaSplit[indexDocumentType] == "CE" || lineaSplit[indexDocumentType] == "PE" || lineaSplit[indexDocumentType] == "PA" || lineaSplit[indexDocumentType] == "DE" || lineaSplit[indexDoc].substr(0, 3) == "VEN" || lineaSplit[indexDocumentType] == "PT") {
                  let factUsers = fact.users.get(lineaSplit[3]);
                  afData.get(lineaSplit[index]).users.set(lineaSplit[3], usData.data.get(lineaSplit[3]));
                }
              }
            }

          }
        }
      }

    }
    resolve({ file: file.substr(0, 2), data: newMap });
  });

/**
 * Controlador principal a partir del archivo ac
 */
readAllFile
  .then((files) => {
    // console.time(1);
    var AF = files.data.find((fileName) => fileName.substr(0, 2) == "AF");

    try {
      // var data = fs.readFileSync( 'utf8');
      var data = fs.readFileSync("files/" + AF, "latin1").toString().split("\n");
      for (var numLinea = 0; numLinea < data.length; numLinea++) {


        if (data[numLinea] != "") {

          data[numLinea] = data[numLinea].substring(0, data[numLinea].length - 2);
          lineaSplit = data[numLinea].split(",");


          if (listFacts.length > 0) {
            const findAf = listFacts.find(element => element == lineaSplit[4]);//lineaSplit[4]);
            //console.log(findAf);
            if (!findAf) {
              ;
            }
          }
          //console.log(lineaSplit);
          afData.set(lineaSplit[4], { data: data[numLinea], users: new Map(), date: lineaSplit[5], habCode: lineaSplit[0] });
          //console.log(afData);
        }
      }

      readAditionalFiles(files.data.find((fileName) => fileName.substr(0, 2) == "US"), 1).then((usMap) => {
        usData = usMap;
        // console.log("aqui",usData);

        Promise.all([
          readAditionalFiles(files.data.find((fileName) => fileName.substr(0, 2) == "AC"), 0),
          readAditionalFiles(files.data.find((fileName) => fileName.substr(0, 2) == "AH"), 0),
          readAditionalFiles(files.data.find((fileName) => fileName.substr(0, 2) == "AM"), 0),
          readAditionalFiles(files.data.find((fileName) => fileName.substr(0, 2) == "AN"), 0),
          readAditionalFiles(files.data.find((fileName) => fileName.substr(0, 2) == "AP"), 0),
          readAditionalFiles(files.data.find((fileName) => fileName.substr(0, 2) == "AT"), 0),
          readAditionalFiles(files.data.find((fileName) => fileName.substr(0, 2) == "AU"), 0),
        ]).then(
          (maps) => {

            const dynamicCreateFiles = (array, maps) => new Promise(function (resolve, reject) {

              //  fsExtra.emptyDirSync("results");
              rimraf("results/*", function () {
                console.log("Borrando directorio");


                for (let [key, value] of array) {
                  var lineCt = "";
                  // crearArchivo("results/" + key, "/AF" + key + ".txt", value.data);
                  let encontrado = extrangeros.get(key);

                  if (!encontrado) {
                    continue;
                  }
                  lineCt = value.habCode + "," + value.date + ",AF" + key + ",1";
                  filesCreator.push({ folder: "results/" + key, fileName: "/AF" + key + ".txt", data: value.data });
                  // console.log(maps);
                  for (var $fileReader = 0; $fileReader < maps.length; $fileReader++) {
                    let data = maps[$fileReader].data.get(key);

                    if (data != undefined) {
                      if (data.count > 0) {
                        lineCt = lineCt + "\n" + value.habCode + "," + value.date + "," + maps[$fileReader].file + key + "," + data.count;
                      }
                      filesCreator.push({ folder: "results/" + key, fileName: "/" + maps[$fileReader].file + key + ".txt", data: data.text });
                    }
                    else {
                      filesCreator.push({ folder: "results/" + key, fileName: "/" + maps[$fileReader].file + key + ".txt", data: "" });
                    }
                  }
                  // console.log(lineCt);
                  // console.log(afData.get("46091"));

                  //    

                  let usersPrinter = "";
                  let countUsers = 0;
                  for (let [keyUser, user] of value.users) {
                    // console.log(user);

                    if (user != undefined) {
                      let explit = user.text.split(",");
                      let docFinal = (explit[1].substr(0, 3) == "VEN") ? explit[1] : "VEN" + explit[1];
                      user.text = user.text.replace(explit[1], docFinal);
                      if (keyUser == 0) {
                        usersPrinter = user.text;
                      }
                      else {
                        usersPrinter = usersPrinter + user.text + "\n";
                      }
                    }

                    countUsers++;
                  }

                  filesCreator.push({ folder: "results/" + key, fileName: "/" + "US" + key + ".txt", data: usersPrinter });
                  lineCt = lineCt + "\n" + value.habCode + "," + value.date + ",US" + key + "," + countUsers;
                  filesCreator.push({ folder: "results/" + key, fileName: "/" + "CT" + key + ".txt", data: lineCt });
                  countUsers = 0;
                  usersPrinter = "";

                }
                // console.log(filesCreator);
                resolve(filesCreator);
              });



            });
            // console.log("Aqui",afData)
            dynamicCreateFiles(afData, maps).then(function (filesCreator) {
              crearArchivo(filesCreator, 0);
            });


          },
          (reason) => {
            console.log(reason);
          }
        );
      });
    } catch (e) {
      console.log("Error:", e.stack);
    }
  })
  .catch(function (err) {
    console.log(err);
  });

