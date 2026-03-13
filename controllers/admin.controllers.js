import e from 'express';
import { db } from '../dababase/db.js'

const createUsuario = async (req, res) => {
    try {

        const { nombre, apellido, email, rol } = req.body;

        const query = 'INSERT INTO usuario (nombre, apellido, email, rol) VALUES (?, ?, ?, ?)';

        const [result] = await db.execute(query, [nombre, apellido, email, rol]);

        res.status(201).json({
            ok: true,
            msg: "Usuario creado correctamente",
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error en el servidor"
        });
    }
}

const createProducto = async (req, res) => {
    try {

        const { nombre, descripcion, stock, precio_lista, url_imagen, public_id } = req.body;

        const query = `
        INSERT INTO producto (nombre, descripcion, stock, precio_lista, url_imagen, public_id)
        VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.execute(query, [nombre, descripcion, stock, precio_lista, url_imagen, public_id]);

        res.status(201).json({
            ok: true,
            msg: 'Producto creado correctamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error en el servidor'
        })
    }
}

const getUsuario = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM usuario');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los usuarios: ', error);
        res.status(500).json({ error: 'error en el servidor' });
    }
}

const getProductos = async (req, res) => {
    try {

        const [rows] = await db.query('SELECT * FROM producto');
        res.json(rows);

    } catch (error) {
        console.log('Error al obtener los productos: ', error);
        res.status(500).json({
            msg: 'Error en el servidor'
        })
    }
}

const deleteProductoById = async (req, res) => {
    try {

        const { id } = req.params;

        const [rows] = await db.execute('SELECT public_id FROM producto WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: "Producto no encontrado"
            });
        }

        const public_id = rows[0].public_id;

        // eliminar imagen en Cloudinary
        await cloudinary.uploader.destroy(public_id);

        // eliminar producto en DB
        await db.execute('DELETE FROM producto WHERE id = ?', [id]);

        res.status(200).json({
            ok: true,
            msg: "Producto e imagen eliminados"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            msg: "Error en el servidor"
        });
    }
};

export {
    getUsuario,
    createUsuario,
    createProducto,
    getProductos,
    deleteProductoById
}