const express = require('express');
let { verificaToken } = require('../middlewares/autenticacion');
let Producto = require('../models/producto');

let app = express();

app.get('/productos', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .populate('usuario', 'nombre email') //selecciona los datos 
        .populate('categoria', 'nombre') //selecciona los datos 
        .sort('nombre') //ordena el elemento
        .skip(desde)
        .limit(limite)
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.count({ disponible: true }, (err, conteo) => {
                return res.json({
                    ok: true,
                    total: conteo,
                    productoDB
                });
            });

        });
});

app.get('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email') //selecciona los datos 
        .populate('categoria', 'nombre') //selecciona los datos 
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                productoDB
            });

        });
});

app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });


    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error en la base de datos'
                }
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            producto: productoDB
        });
    });
});

app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error en la base de datos'
                }
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.descripcion = body.descripcion;
        productoDB.precioUni = body.precioUni;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save((err, productoGuardado) => {
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
                producto: productoGuardado
            });
        });
    });
});

app.delete('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error en la base de datos'
                }
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
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
                message: 'Producto borrado',
                producto: productoBorrado
            });
        });

    });
});

//buscar productos
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');
    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Error en la base de datos'
                    }
                });
            }

            if (!productos) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'No se encuentra ningun producto'
                    }
                });
            }

            return res.json({
                ok: true,
                productos
            });

        });
});

module.exports = app;