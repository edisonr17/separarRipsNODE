const fs = require("fs");
var http = require("http");
const path = require("path");
const rimraf = require("rimraf");
const utf8 = require('utf8');

// directorio objetivo donde se encuentra el archivo plano
const testFolder = "files/";
const requiredFiles = ["AC", "AH", "AF", "AM", "AP", "AN", "AU", "AT"];
var Filequeue = require('filequeue');
const { clear } = require("console");
var fq = new Filequeue(50);
const { CONFIGURACIONES } = require("./config.js");

const diagCOVID = CONFIGURACIONES.CONFIGURACIONES.diagnosticosCovid;	
//Listado de facturas con diagnosticos covid
var facturasCovidDetectadas = [];
//listado de usuarios detectados con covid
var usuariosCovid = [];

/** 
* Método que permite identificar si falta algun archivo en la definición 
*/
let leerYverificarArchivosRips = new Promise((resolve, reject) => {
	main = this;
	var totalFiles = [];

	fs.readdir(testFolder, (err, files) => {
		requiredFiles.map((pre) => {
			
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
 * 
 * @param {*} path  donde esta la carpeta donde se va a escribir
 * @param {*} fileName nombre del archivo nuevo
 * @param {*} value data que va en el interior
 * @returns 
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



//Este método lo usamos para identificar que archivos tiene diagnosticos COVID
const buscarDiagnosticosCovid =  (file, indiceUbiFactura, indiceUbiUsuario, indDiag1) =>
new Promise(function (resolve, reject) {
	//Leemos el archivo	
	var data = fs.readFileSync("files/" + file, "latin1").toString().split("\n");
	var newMap = new Map();

	//Recorremos linea a linea un archivo plano
	for (var numLinea = 0; numLinea < data.length; numLinea++) {
		//Validamos que la linea no esté vacía
		if (data[numLinea] != "") {
			if(file.substr(0,2)=="AH"){
				data[numLinea] = data[numLinea].substring(0, data[numLinea].length -1);
			}
		else{
			data[numLinea] = data[numLinea].substring(0, data[numLinea].length - 2);
		}
			lineaSplit = data[numLinea].split(",");
			
			
			//Aqui detectamos que archivos tiene diagnosticos covid
		
			if (diagCOVID.includes(lineaSplit[indDiag1]) || diagCOVID.includes(lineaSplit[indDiag1+1]) || diagCOVID.includes(lineaSplit[indDiag1+2])) {
			
				if (!facturasCovidDetectadas.includes(lineaSplit[indiceUbiFactura])) {
					facturasCovidDetectadas.push(lineaSplit[indiceUbiFactura]);
				}
			
				if (!usuariosCovid.includes(lineaSplit[indiceUbiUsuario])) {
					usuariosCovid.push(lineaSplit[indiceUbiUsuario]);
				}

				
			}
			
		/*	if(file == "AC.txt" && numLinea == 11)
			{
				console.log(lineaSplit[indDiag1],diagCOVID.includes(lineaSplit[indDiag1]),lineaSplit[indiceUbiUsuario], usuariosCovid );
				if(lineaSplit[indiceUbiUsuario]=="8306871" ) {
					//console.log(lineaSplit[3], lineaSplit[indiceUbiUsuario], usuariosCovid.includes(lineaSplit[indiceUbiUsuario]));
					
				}
			}*/

			var findLine = newMap.get(lineaSplit[indiceUbiFactura]);
				//  console.log(findLine);
				if (findLine == undefined) {
					if (usuariosCovid.includes(lineaSplit[indiceUbiUsuario])) {
						newMap.set(lineaSplit[indiceUbiFactura], { text: data[numLinea], count: 1 });
					}
				} else {
					if (usuariosCovid.includes(lineaSplit[indiceUbiUsuario])) {
						findLine.text = findLine.text.toString() + "\r\n" + data[numLinea].toString();
						newMap.set(lineaSplit[indiceUbiFactura], {
							text: findLine.text,
							count: findLine.count + 1,
						});
					}
				}

			

		}
	}
	resolve({ file: file.substr(0, 2), data: newMap });
});

let usuariosInsertados = [];

const buscarUsuariosCovid =   (file, index) =>
new Promise(function (resolve, reject) {
	var data = fs.readFileSync("files/" + file, "latin1").toString().split("\n");
		var newMap = new Map();

		//Recorremos linea a linea un archivo plano
		for (var numLinea = 0; numLinea < data.length; numLinea++) {
			//Validamos que la linea no esté vacía
			if (data[numLinea] != "") {
				data[numLinea] = data[numLinea].substring(0, data[numLinea].length - 2);
				lineaSplit = data[numLinea].split(",");


			if(usuariosCovid.includes(lineaSplit[index])) {

				var findLine = newMap.get(lineaSplit[1]);
				//  console.log(findLine);
				if (findLine == undefined) {
					newMap.set(lineaSplit[index], { text: data[numLinea], count: 1 });
					usuariosInsertados.push(lineaSplit[index]);
				} else {
					if(!usuariosInsertados.includes(lineaSplit[index])){
					findLine.text = findLine.text.toString() + "\r\n" + data[numLinea].toString();
					newMap.set(lineaSplit[index], {
						text: findLine.text,
						count: findLine.count + 1,
					});
				}
				}
			}
				
			}
		}
		resolve({ file: file.substr(0, 2), data: newMap });

});

const buscarUsuarioEnArchivosAdicionalesPorFactura =   (file, indFac, indUsuario) =>
new Promise(function (resolve, reject) {
	var data = fs.readFileSync("files/" + file, "latin1").toString().split("\n");
		var newMap = new Map();

		//Recorremos linea a linea un archivo plano
		for (var numLinea = 0; numLinea < data.length; numLinea++) {
			//Validamos que la linea no esté vacía
			if (data[numLinea] != "") {
				data[numLinea] = data[numLinea].substring(0, data[numLinea].length - 2);
				lineaSplit = data[numLinea].split(",");


			if(usuariosCovid.includes(lineaSplit[indUsuario]) && facturasCovidDetectadas.includes(lineaSplit[indFac])) {

			
				var findLine = newMap.get(lineaSplit[indFac]);
				 
				if (findLine == undefined  ) {
					newMap.set(lineaSplit[indFac], { text: data[numLinea], count: 1 });
					
				} else {
				
						findLine.text = findLine.text.toString() + "\r\n" + data[numLinea].toString();
						newMap.set(lineaSplit[indFac], {
							text: findLine.text,
							count: findLine.count + 1,
						});
					
				
				}
			
			}
				
			}
		}
		resolve({ file: file.substr(0, 2), data: newMap });

});

let NIT_IPS = "";
const buscarEnAf =   (file, indFac) =>
new Promise(function (resolve, reject) {
	var data = fs.readFileSync("files/" + file, "latin1").toString().split("\n");
		var newMap = new Map();

		//Recorremos linea a linea un archivo plano
		for (var numLinea = 0; numLinea < data.length; numLinea++) {
			//Validamos que la linea no esté vacía
			if (data[numLinea] != "") {
				data[numLinea] = data[numLinea].substring(0, data[numLinea].length - 2);
				lineaSplit = data[numLinea].split(",");


			if(facturasCovidDetectadas.includes(lineaSplit[indFac])) {
				NIT_IPS = lineaSplit[3];
				var findLine = newMap.get(lineaSplit[indFac]);
				//  console.log(findLine);
				if (findLine == undefined) {
					newMap.set(lineaSplit[indFac], { text: data[numLinea], count: 1 });
				} else {
					
					findLine.text = findLine.text.toString() + "\r\n" + data[numLinea].toString();
					newMap.set(lineaSplit[indFac], {
						text: findLine.text,
						count: findLine.count + 1,
					});
				}
			}
				
			}
		}
		resolve({ file: file.substr(0, 2), data: newMap });

});



const devolverFacturasYUsuariosCovid = () => {
	return { facturas: facturasCovidDetectadas, usuarios: usuariosCovid, NIT_IPS:NIT_IPS };
};

const generarArchivos = (map, file) => new Promise(function (resolve, reject) {
	let totalLineas = 0;
	let valueFile = ""
	for (const [key, value] of map.data) {
		
		totalLineas = totalLineas + value.count;
		valueFile = valueFile + value.text + "\r\n";
	}
//	console.log(map.data);
	//console.log(valueFile)
	resolve({file: file, totalLineas: totalLineas, valueFile: valueFile});

});






exports.funcionesArchivosPlanos = {
								readAllFile:leerYverificarArchivosRips, 
								escribirArchivo:escribirArchivo, 
								buscarDiagnosticosCovid:buscarDiagnosticosCovid,
								devolverFacturasYUsuariosCovid:devolverFacturasYUsuariosCovid,
								buscarUsuariosCovid:buscarUsuariosCovid,
								buscarUsuarioEnArchivosAdicionalesPorFactura, buscarUsuarioEnArchivosAdicionalesPorFactura,
								buscarEnAf:buscarEnAf,
								generarArchivos:generarArchivos
							};
