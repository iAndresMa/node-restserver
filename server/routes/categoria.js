const express = require('express');
let { verificaToken, verificaRole } = require('../middlewares/autenticacion');
let Categoria = require('../models/categoria');

let app = express();

//mostrar todas las categorias
app.get('/categoria', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Categoria.find()
        .populate('usuario', 'nombre email') //selecciona los datos 
        .sort('descripcion') //ordena el elemento
        //.skip(desde)
        //.limit(limite)
        .exec((err, categoriaDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.count((err, conteo) => {
                return res.json({
                    ok: true,
                    total: conteo,
                    categoriaDB
                });
            });

        });
});

//mostrar una categoria por id
app.get('/categoria/:id', (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, '_id, nombre')
        .exec((err, categoria) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                categoria
            });

        });
});

app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;
    let categoria = new Categoria({
        nombre: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error en la base de datos'
                }
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

app.put('/categoria/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let descCategoria = {
        nombre: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error en la base de datos'
                }
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

app.delete('/categoria/:id', [verificaToken, verificaRole], (req, res) => {
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error en la base de datos'
                }
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        return res.json({
            ok: true,
            message: 'Categiría Borrada'
        });
    });
});

module.exports = app;