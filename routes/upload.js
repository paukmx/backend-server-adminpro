// Requires
var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs");

// Inicializar variables

var app = express();
// default options
app.use(fileUpload());

// Importaciones
var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

// Ruta principal

app.put("/:tipo/:id", (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colecciones validos
    var tiposValidos = ["usuarios", "hospitales", "medicos"];

    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(500).json({
            ok: false,
            mensaje: "Tipo no valida",
            errors: { message: "Los tipos validos son:" + tiposValidos.join(", ") },
        });
    }

    if (!req.files) {
        res.status(500).json({
            ok: false,
            mensaje: "No selecciono nada",
            errors: { message: "Debe seleccionar una imagen" },
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split(".");
    var extension = nombreCortado[nombreCortado.length - 1];

    // Solo aceptamos estas extensiones
    var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

    if (extensionesValidas.indexOf(extension) < 0) {
        res.status(500).json({
            ok: false,
            mensaje: "Extension no valida",
            errors: {
                message: "Las extensiones validas son:" + extensionesValidas.join(", "),
            },
        });
    }

    // Nombre de archivo personalizado
    //id-numeroRandom.extension
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al mover archivo",
                errors: err,
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === "usuarios") {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Usuario no existe",
                    errors: { message: "Usuario no existe" }
                });
            }

            var pathViejo = "./uploads/usuarios/" + usuario.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = '';

                return res.status(200).json({
                    ok: true,
                    mensaje: "Usuario actualizado",
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === "medicos") {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Medico no existe",
                    errors: { message: "Medico no existe" }
                });
            }

            var pathViejo = "./uploads/medicos/" + medico.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Medico actualizado",
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo === "hospitales") {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Hospital no existe",
                    errors: { message: "Hospital no existe" }
                });
            }

            var pathViejo = "./uploads/hospitales/" + hospital.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Hospital actualizado",
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;