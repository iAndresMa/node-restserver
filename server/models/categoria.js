const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    nombre: {
        type: String,
        unique: true,
        required: [true, 'El nombre de la categoría es necesario']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
});

module.exports = mongoose.model('Categoria', categoriaSchema);