var http = require("http");
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");
const utf8 = require('utf8');
var Filequeue = require('filequeue');

var filesCreator = [];
const { dir } = require("console");


const { CONFIGURACIONES } = require("./business/config.js");
const { funcionesArchivosPlanos } = require("./business/operacionesArchivosPlanos.js");


var afData = new Map();
var usData = new Map();
var diagCOVID = CONFIGURACIONES.CONFIGURACIONES.diagnosticosCovid;

/**
** Aquí termina la inclusión de las librerias necesarias
*/

// Array que contiene el listado de facturas ___ PENDIENTE DE USO
const listFacts = [];//["1822", "310897"];
//Listado de facturas con diagnosticos covid
var facturasCovidDetectadas = [];
//listado de usuarios detectados con covid
var usuariosCovid = [];


/** 
* Método que permite identificar si falta algun archivo en la definición 
*/
let readAllFile = funcionesArchivosPlanos.readAllFile;


/**
 * Escribe el archivo
 */


 const escribirArchivo = funcionesArchivosPlanos.escribirArchivo;

/**
* PERMITE CREAR UN ARCHIVO por elemento de un array
*/

const crearArchivo = (array) => new Promise((resolve, reject) => {
	// console.log(array);

	for (var file = 0; file < array.length; file++) {
	
		
		let factura = array[file].fileName.substring(0, array[file].fileName.length - 4); // texto.value.substring(0, texto.value.length - 1);
		factura = factura.substr(3);
		if(file < 3)
		{
			//console.log(facturasCovidDetectadas)
		}
		//console.log(factura);
		if(facturasCovidDetectadas.includes(factura))
		{	
			
			escribirArchivo(array[file].folder, array[file].fileName, array[file].data).then(function () {
			});
		}
		
	}
});






const readUSFile =   (file, index) =>
new Promise(function (resolve, reject) {
	var data = fs.readFileSync("files/" + file, "latin1").toString().split("\n");
		var newMap = new Map();

		//Recorremos linea a linea un archivo plano
		for (var numLinea = 0; numLinea < data.length; numLinea++) {
			//Validamos que la linea no esté vacía
			if (data[numLinea] != "") {
				data[numLinea] = data[numLinea].substring(0, data[numLinea].length - 2);
				lineaSplit = data[numLinea].split(",");



				var findLine = newMap.get(lineaSplit[1]);
				//  console.log(findLine);
				if (findLine == undefined) {
				
					newMap.set(lineaSplit[index], { text: data[numLinea], count: 1 });
					
				} else {
					
					findLine.text = findLine.text.toString() + "\r\n" + data[numLinea].toString();
					newMap.set(lineaSplit[index], {
						text: findLine.text,
						count: findLine.count + 1,
					});
				
				}

				
			}
		}
		resolve({ file: file.substr(0, 2), data: newMap });

});




/**
 * Metodo que recorre un archivo y lo agrupa por un indice en un archivo
 */
const readAditionalFiles = (file, index) =>
	new Promise(function (resolve, reject) {
		var data = fs.readFileSync("files/" + file, "latin1").toString().split("\n");
		var newMap = new Map();

		//Recorremos linea a linea un archivo plano
		for (var numLinea = 0; numLinea < data.length; numLinea++) {
			//Validamos que la linea no esté vacía
			if (data[numLinea] != "") {
				data[numLinea] = data[numLinea].substring(0, data[numLinea].length - 2);
				lineaSplit = data[numLinea].split(",");

				if (file.substr(0, 2) == "AC"  || file.substr(0, 2) == "AH" ) {
					if (diagCOVID.includes(lineaSplit[9]) || diagCOVID.includes(lineaSplit[10])|| diagCOVID.includes(lineaSplit[11])) {
						if (!facturasCovidDetectadas.includes(lineaSplit[0])) {
							facturasCovidDetectadas.push(lineaSplit[0]);
						}

						if (!usuariosCovid.includes(lineaSplit[3])) {
							usuariosCovid.push(lineaSplit[3]);
						}
					}
				}

				if (file.substr(0, 2) == "AP" ) {
					if (diagCOVID.includes(lineaSplit[10]) || diagCOVID.includes(lineaSplit[11])|| diagCOVID.includes(lineaSplit[12])) {
						if (!facturasCovidDetectadas.includes(lineaSplit[0])) {
							facturasCovidDetectadas.push(lineaSplit[0]);
						}

						if (!usuariosCovid.includes(lineaSplit[3])) {
							usuariosCovid.push(lineaSplit[3]);
						}
					}
				}

				if (file.substr(0, 2) == "AU") {
					if (diagCOVID.includes(lineaSplit[8]) || diagCOVID.includes(lineaSplit[9])|| diagCOVID.includes(lineaSplit[10])) {
						if (!facturasCovidDetectadas.includes(lineaSplit[0])) {
							facturasCovidDetectadas.push(lineaSplit[0]);
						}

						if (!usuariosCovid.includes(lineaSplit[3])) {
							usuariosCovid.push(lineaSplit[3]);
						}
					}
				}



				var findLine = newMap.get(lineaSplit[0]);
				//  console.log(findLine);
				if (findLine == undefined) {
					if (usuariosCovid.includes(lineaSplit[3])) {
					newMap.set(lineaSplit[index], { text: data[numLinea], count: 1 });
					}
				} else {
					if (usuariosCovid.includes(lineaSplit[3])) {
					findLine.text = findLine.text.toString() + "\r\n" + data[numLinea].toString();
					newMap.set(lineaSplit[index], {
						text: findLine.text,
						count: findLine.count + 1,
					});
				}
				}

				if (index == 0) {
					let fact = afData.get(lineaSplit[index]);
					if (fact != undefined) {
						let factUsers = fact.users.get(lineaSplit[3]);
						afData.get(lineaSplit[index]).users.set(lineaSplit[3], usData.data.get(lineaSplit[3]));
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
						// console.log(findAf);
						if (!findAf) {
							continue;
						}
					}
					afData.set(lineaSplit[4], { data: data[numLinea], users: new Map(), date: lineaSplit[5], habCode: lineaSplit[0] });
				}
			}
			//console.log(afData);
			readUSFile(
				files.data.find((fileName) => fileName.substr(0, 2) == "US"), 1
			).then((usMap) => {
				usData = usMap;
				//  console.log(usData);

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
						console.log();

						const dynamicCreateFiles = (array, maps) => new Promise(function (resolve, reject) {

							//  fsExtra.emptyDirSync("results");
							rimraf("results/*", function () {
								console.log("Borrando directorio");

								for (let [key, value] of array) {
									var lineCt = "";
									// crearArchivo("results/" + key, "/AF" + key + ".txt", value.data);
									lineCt = value.habCode + "," + value.date + ",AF" + key + ",1";
									filesCreator.push({ folder: "results/" , fileName: "/AF" + key + ".txt", data: value.data });
									for (var $fileReader = 0; $fileReader < maps.length; $fileReader++) {
										let data = maps[$fileReader].data.get(key);

										if (data != undefined) {
											if (data.count > 0) {
												lineCt = lineCt + "\r\n" + value.habCode + "," + value.date + "," + maps[$fileReader].file + key + "," + data.count;
											}
											filesCreator.push({ folder: "results/" , fileName: "/" + maps[$fileReader].file + key + ".txt", data: data.text });
										}
										else {
											filesCreator.push({ folder: "results/" , fileName: "/" + maps[$fileReader].file + key + ".txt", data: "" });
										}
									}
									// console.log(lineCt);
									// console.log(afData.get("46091"));

									//    

									let usersPrinter = "";
									let countUsers = 0;
									//console.log(value.users);
									for (let [keyUser, user] of value.users) {
										
										if (user != undefined  && usuariosCovid.includes(keyUser)  ) {
											if (keyUser == 0) {
												usersPrinter = user.text;
											}
											else {
												usersPrinter = usersPrinter + user.text + "\r\n";
											}
										}

										countUsers++;
									}

									filesCreator.push({ folder: "results/" , fileName: "/" + "US" + key + ".txt", data: usersPrinter });
									lineCt = lineCt + "\n" + value.habCode + "," + value.date + ",US" + key + "," + countUsers;

									filesCreator.push({ folder: "results/" , fileName: "/" + "CT" + key + ".txt", data: lineCt });
									countUsers = 0;
									usersPrinter = "";

								}
								// console.log(filesCreator);
								resolve(filesCreator);
							});



						});

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

