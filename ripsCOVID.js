var http = require("http");
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");
const utf8 = require('utf8');
var Filequeue = require('filequeue');
var moment = require('moment');
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


/** 
* Método que permite identificar si falta algun archivo en la definición 
*/
const leerTodosLosArchivos = funcionesArchivosPlanos.readAllFile;
const buscarDiagnosticosCovid = funcionesArchivosPlanos.buscarDiagnosticosCovid;
const devolverFacturasYUsuariosCovid = funcionesArchivosPlanos.devolverFacturasYUsuariosCovid
const buscarUsuariosCovid = funcionesArchivosPlanos.buscarUsuariosCovid;
const buscarUsuarioEnArchivosAdicionalesPorFactura = funcionesArchivosPlanos.buscarUsuarioEnArchivosAdicionalesPorFactura;
const buscarEnAf = funcionesArchivosPlanos.buscarEnAf;
const generarArchivos = funcionesArchivosPlanos.generarArchivos;
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
		if (file < 3) {
			//console.log(facturasCovidDetectadas)
		}
		//console.log(factura);
		if (facturasCovidDetectadas.includes(factura)) {

			escribirArchivo(array[file].folder, array[file].fileName, array[file].data).then(function () {
			});
		}

	}
});






/**
 * Controlador principal a partir del archivo ac
 */

leerTodosLosArchivos.then((files) => {
	//console.log("entro" ,files);
	var AC = files.data.find((fileName) => fileName.substr(0, 2) == "AC");
	var AH = files.data.find((fileName) => fileName.substr(0, 2) == "AH");
	var AP = files.data.find((fileName) => fileName.substr(0, 2) == "AP");
	var AU = files.data.find((fileName) => fileName.substr(0, 2) == "AU");
	var US = files.data.find((fileName) => fileName.substr(0, 2) == "US");

	//Aquí empiezan los archivos que no devuelven diagCovid
	var AD = files.data.find((fileName) => fileName.substr(0, 2) == "AD");
	//AF es el indicador de facturas
	var AF = files.data.find((fileName) => fileName.substr(0, 2) == "AF");
	var AM = files.data.find((fileName) => fileName.substr(0, 2) == "AM");
	var AN = files.data.find((fileName) => fileName.substr(0, 2) == "AN");
	var AT = files.data.find((fileName) => fileName.substr(0, 2) == "AT");

	Promise.all([
		buscarDiagnosticosCovid(AC, 0,3, 9),
		buscarDiagnosticosCovid(AH, 0,3, 9),
		buscarDiagnosticosCovid(AP, 0,3, 10),
		buscarDiagnosticosCovid(AU, 0,3, 8),
	]).then(
		(covidMaps) => {
			//console.log(covidMaps[1] );
			//console.log(maps);
			buscarUsuariosCovid(US,1).then((usMap) => {
				//usData = usMap;
			
					Promise.all([
						buscarUsuarioEnArchivosAdicionalesPorFactura(AM, 0,3),
						buscarUsuarioEnArchivosAdicionalesPorFactura(AN, 0,3),
						buscarUsuarioEnArchivosAdicionalesPorFactura(AT, 0,3),
						buscarEnAf(AF, 4)
					]).then((mapsArchivosAdicionales) => {
						//console.log("entre aqui");
						Promise.all([
							generarArchivos(covidMaps[0], AC),
							generarArchivos(covidMaps[1], AH),
							generarArchivos(covidMaps[2], AP),
							generarArchivos(covidMaps[3], AU),
							generarArchivos(mapsArchivosAdicionales[0], AM),
							generarArchivos(mapsArchivosAdicionales[1], AN),
							generarArchivos(mapsArchivosAdicionales[2], AT),
							generarArchivos(mapsArchivosAdicionales[3], AF),
							generarArchivos(usMap, US)						

						]).then((respuestaCreacionArchivos) => {
							//escribirArchivo = async (path, fileName, value)
							
							escribirArchivo("results/" , AC,  respuestaCreacionArchivos[0].valueFile );
							escribirArchivo("results/" , AH,  respuestaCreacionArchivos[1].valueFile );
							escribirArchivo("results/" , AP,  respuestaCreacionArchivos[2].valueFile );
							escribirArchivo("results/" , AU,  respuestaCreacionArchivos[3].valueFile );
							escribirArchivo("results/" , AM,  respuestaCreacionArchivos[4].valueFile );
							escribirArchivo("results/" , AN,  respuestaCreacionArchivos[5].valueFile );
							escribirArchivo("results/" , AT,  respuestaCreacionArchivos[6].valueFile );
							escribirArchivo("results/" , AF,  respuestaCreacionArchivos[7].valueFile );
							escribirArchivo("results/" , US,  respuestaCreacionArchivos[8].valueFile );
						
							let nit = devolverFacturasYUsuariosCovid().NIT_IPS;
							let fechaActual =   moment().format("DD/MM/YYYY");
							let dataCT = nit + "," + fechaActual + "," + AC.substr(0,2) + "," +respuestaCreacionArchivos[0].totalLineas+"\r\n";
							dataCT  =dataCT+ nit + "," + fechaActual + "," + AH.substr(0,2) + "," +respuestaCreacionArchivos[1].totalLineas+"\r\n";
							dataCT  =dataCT+ nit + "," + fechaActual + "," + AP.substr(0,2) + "," +respuestaCreacionArchivos[2].totalLineas+"\r\n";
							dataCT  =dataCT+ nit + "," + fechaActual + "," + AU.substr(0,2) + "," +respuestaCreacionArchivos[3].totalLineas+"\r\n";
							dataCT  =dataCT+ nit + "," + fechaActual + "," + AM.substr(0,2) + "," +respuestaCreacionArchivos[4].totalLineas+"\r\n";
							dataCT  =dataCT+ nit + "," + fechaActual + "," + AN.substr(0,2) + "," +respuestaCreacionArchivos[5].totalLineas+"\r\n";
							dataCT  =dataCT+ nit + "," + fechaActual + "," + AT.substr(0,2) + "," +respuestaCreacionArchivos[6].totalLineas+"\r\n";
							dataCT  =dataCT+ nit + "," + fechaActual + "," + AF.substr(0,2) + "," +respuestaCreacionArchivos[7].totalLineas+"\r\n";
							dataCT  =dataCT+ nit + "," + fechaActual + "," + US.substr(0,2) + "," +respuestaCreacionArchivos[8].totalLineas+"\r\n";
							escribirArchivo("results/" , "CT.txt",  dataCT );

						});


					
					});

			});
		})
	



}).catch(function (err) {
		console.log(err);
});

