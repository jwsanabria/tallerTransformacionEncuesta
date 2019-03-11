//creamos la base de datos tienda y el objeto SHOP donde iremos almacenando la info
var sqlite3 = require('sqlite3').verbose(),
db = new sqlite3.Database('encuesta'),
ENCUESTA = {};
 
//elimina y crea la tabla clientes
ENCUESTA.modulosTable = function()
{
 db.run("DROP TABLE IF EXISTS modulos");
 db.run("CREATE TABLE IF NOT EXISTS modulos (idmodulo INTEGER PRIMARY KEY, nombre TEXT, esinicial INTEGER)");
 console.log("La tabla modulos ha sido correctamente creada");
}
 
//elimina y crea la tabla preguntas ABIERTA=0 MULTIPLE=1 UNICA=2
ENCUESTA.preguntasTable = function()
{
 db.run("DROP TABLE IF EXISTS preguntas");
 db.run("CREATE TABLE IF NOT EXISTS preguntas (idpregunta INTEGER PRIMARY KEY, pregunta TEXT, modulo_pregunta INTEGER,espreguntainicial INTEGER,tipo INTEGER,siguientepregunta INTEGER,siguientemodulo INTEGER)");
 console.log("La tabla preguntas ha sido correctamente creada");
}
 
//elimina y crea la tabla respuestas
ENCUESTA.respuestasTable = function()
{
 db.run("DROP TABLE IF EXISTS respuestas");
 db.run("CREATE TABLE IF NOT EXISTS respuestas (idrespuesta INTEGER PRIMARY KEY, respuesta TEXT, pregunta_respuesta INTEGER,siguientemodulo INTEGER,siguientepregunta INTEGER)");
 console.log("La tabla respuestas ha sido correctamente creada");
}


//elimina y crea la tabla encuesta respuestas
ENCUESTA.encuesta_respuestasTable = function()
{
 db.run("DROP TABLE IF EXISTS encuesta_respuestas");
 db.run("CREATE TABLE IF NOT EXISTS encuesta_respuestas	 (idencuesta_respuestas INTEGER PRIMARY KEY AUTOINCREMENT, pregunta0 TEXT, pregunta1 INTEGER, pregunta2 INTEGER, pregunta3 INTEGER, pregunta4 INTEGER, pregunta5 INTEGER, pregunta6 INTEGER, pregunta7 INTEGER, pregunta8_20 INTEGER, pregunta8_21 INTEGER, pregunta8_22 INTEGER, pregunta9 INTEGER, pregunta10 INTEGER, pregunta11_28 INTEGER, pregunta11_29 INTEGER, pregunta11_30 INTEGER, pregunta12 INTEGER, pregunta13 INTEGER, pregunta14 TEXT)");
 console.log("La tabla encuesta_respuestas ha sido correctamente creada");
}

//inserta un nuevo modulo en la tabla clientes
ENCUESTA.insertModulo = function(modulo)
{
 var stmt = db.prepare("INSERT INTO modulos VALUES (?,?,?)");
 stmt.run(modulo.idmodulo,modulo.nombre,modulo.esinicial);
 stmt.finalize();
}
 
//inserta una nueva pregunta en la tabla preguntas
ENCUESTA.insertPregunta = function(pregunta)
{
 var stmt = db.prepare("INSERT INTO preguntas VALUES (?,?,?,?,?,?,?)");
 stmt.run(pregunta.idpregunta,pregunta.pregunta,pregunta.modulo,pregunta.espreguntainicial,pregunta.tipo,pregunta.siguientepregunta,pregunta.siguientemodulo);
 stmt.finalize();
}
 
//inserta una nueva pregunta en la tabla preguntas
ENCUESTA.insertRespuesta = function(respuesta)
{
 var stmt = db.prepare("INSERT INTO respuestas VALUES (?,?,?,?,?)");
 stmt.run(respuesta.idrespuesta,respuesta.respuesta,respuesta.pregunta,respuesta.siguientemodulo,respuesta.siguientepregunta);
 stmt.finalize();
}

//obtenemos todos los clientes de la tabla clientes
//con db.all obtenemos un array de objetos, es decir todos
ENCUESTA.getPrimero = function(callback)
{
 db.all("SELECT * FROM modulos where esinicial=1", function(err, rows) {
 if(err)
 {
    callback(err, rows);
 }
 else
 {
    db.all("SELECT * FROM preguntas where modulo_pregunta="+rows[0].idmodulo+" and espreguntainicial=1", function(errp, rowsp) {
        if(errp)
        {
            callback(err, rows);
        }
        else
        {
            var pregunta=rowsp[0];

            if(pregunta.tipo!=0){
                db.all("SELECT * FROM respuestas where pregunta_respuesta="+pregunta.idpregunta, function(errr, rowsr) {
                    if(errr)
                    {
                        callback(errr, rowsr);
                    }
                    else
                    {
                        pregunta.respuestas = rowsr;
                        callback(null, pregunta);
                    }
                });
            }
            else{
                callback(null, pregunta);
            }
           
        }
    });
 }
 });
}


ENCUESTA.getPrimeroModulo = function(idmodulo,callback)
{
 db.all("SELECT * FROM modulos where idmodulo="+idmodulo, function(err, rows) {
 if(err||rows.length === 0)
 {
    callback("No se encontró información", null);
 }
 else
 {
    db.all("SELECT * FROM preguntas where modulo_pregunta="+rows[0].idmodulo+" and espreguntainicial=1", function(errp, rowsp) {
        if(errp ||rowsp.length === 0)
        {
            callback("No se encontró información", null);
        }
        else
        {
            var pregunta=rowsp[0];

            if(pregunta.tipo!=0){
                db.all("SELECT * FROM respuestas where pregunta_respuesta="+pregunta.idpregunta, function(errr, rowsr) {
                    if(errr||rowsr.length === 0)
                    {
                        callback("No se encontró información", null);
                    }
                    else
                    {
                        pregunta.respuestas = rowsr;
                        callback(null, pregunta);
                    }
                });
            }
            else{
                callback(null, pregunta);
            }
           
        }
    });
 }
 });
}


ENCUESTA.getPregunta = function(idpregunta,callback)
{
    db.all("SELECT * FROM preguntas where idpregunta="+idpregunta, function(errp, rowsp) {
        if(errp)
        {
            callback(err, null);
        }
        else
        {
            var pregunta=rowsp[0];

            if(pregunta.tipo!=0){
                db.all("SELECT * FROM respuestas where pregunta_respuesta="+pregunta.idpregunta, function(errr, rowsr) {
                    if(errr)
                    {
                        callback(errr, null);
                    }
                    else
                    {
                        pregunta.respuestas = rowsr;
                        callback(null, pregunta);
                    }
                });
            }
            else{
                callback(null, pregunta);
            }
           
        }
    });
}

ENCUESTA.results = function(callback)
{
    db.all("SELECT * FROM encuesta_respuestas", function(error, rows) {
        if(error)
        {
            callback(error, null);
        }
        else
        {
            callback(null, rows); 
        }
    });
}

ENCUESTA.saveData = function(respuestas,callback)
{
    var insert = "INSERT INTO encuesta_respuestas ";
    var columns = "";
    var values= "";
    for(var i=0;i<respuestas.length;i++){
        var pregunta=respuestas[i];
        //pregunta abierta
        if(pregunta.tipo==0)
        {
            if(i!=0){
                columns=columns+"," ;
                values=values+"," ;
            }
            columns=columns+"pregunta"+pregunta.idpregunta+" ";
            values=values+"'"+pregunta.respuesta+"' ";
        }
        //MR
        else if(pregunta.tipo==1){
            for(var j=0;j<pregunta.respuestas.length;j++){
                var respuesta = pregunta.respuestas[j];

                if(i!=0){
                    columns=columns+"," ;
                    values=values+"," ;
                }
                columns=columns+"pregunta"+pregunta.idpregunta+"_"+respuesta.idrespuesta+" ";
                values=values+((respuesta.isSelected)?"1":"0")+" ";

            }
        }
        //UR
        else if(pregunta.tipo==2){
            for(var j=0;j<pregunta.respuestas.length;j++){
                var respuesta = pregunta.respuestas[j];
                if(respuesta.isSelected)
                {
                    if(i!=0){
                        columns=columns+"," ;
                        values=values+"," ;
                    }
                    columns=columns+"pregunta"+pregunta.idpregunta;
                    values=values+respuesta.idrespuesta+" ";
                }
            }
        }

    }

    console.log(insert+"("+columns+") VALUES ("+values+")");
    

    var stmt = db.prepare(insert+"("+columns+") VALUES ("+values+")");
    stmt.run(function(err) {
        if(err) {
            callback(err,null);
        } else {
            callback(null,"Agregado exitosamente");
        } // end else
      } );
    stmt.finalize();

}
//exportamos el modelo para poder utilizarlo con require
module.exports = ENCUESTA;