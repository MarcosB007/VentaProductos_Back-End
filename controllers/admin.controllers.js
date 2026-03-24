import e from 'express';
import { db } from '../dababase/db.js'
import { v2 as cloudinary } from 'cloudinary';

const createUsuario = async (req, res) => {
    try {

        const { nombre, apellido, email, username, password } = req.body;

        const rol = "usuario"

        const salt = bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);

        const query = 'INSERT INTO usuario (nombre, apellido, email, rol, user, password) VALUES (?, ?, ?, ?, ?, ?)';

        const [result] = await db.execute(query, [nombre, apellido, email, rol, username, password]);

        res.status(201).json({
            ok: true,
            msg: "Usuario creado correctamente",
        })
    } catch (error) {

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                msg: "El email ya existe"
            });
        }

        res.status(500).json({
            msg: "Error en el servidor"
        });
    }
}

const createProducto = async (req, res) => {
    try {

        const { nombre, descripcion, stock, precio_lista, url_imagen, public_id, id_categoria } = req.body;

        const query = `
        INSERT INTO producto (nombre, descripcion, stock, precio_lista, url_imagen, public_id, id_categoria)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(query, [nombre, descripcion, stock, precio_lista, url_imagen, public_id, id_categoria]);

        res.status(201).json({
            ok: true,
            msg: 'Producto creado correctamente'
        });

    } catch (error) {
        console.log(error);

        // Eliminamos la imagen de cloudinary si no pudo crearse el producto
        await cloudinary.uploader.destroy(public_id);

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

const getProductosById = async (req, res) => {
    try {

        const [rows] = await db.query('SELECT * FROM producto WHERE id = ?', [req.params.id]);
        res.json(rows);

    } catch (error) {
        console.log('Error al obtener los productos: ', error);
        res.status(500).json({
            msg: 'Error en el servidor'
        })
    }
}

const getCategorias = async (req, res) => {
    try {

        const [rows] = await db.query('SELECT * FROM categoria');
        res.json(rows);

    } catch (error) {
        console.log('Error al obtener las categorias: ', error);
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

//Agregamos productos al carrito de compras
export const agregarAlCarrito = async (req, res) => {
    try {
        
        const { id_carrito, id_producto, cantidad, precio_unitario } = req.body;
        const query = "INSERT INTO carrito_detalle (carrito_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";

        await db.execute(query, [id_carrito, id_producto, cantidad, precio_unitario]);

        res.status(201).json({
            ok: true,
            msg: "Producto agregado al carrito"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error en el servidor"
        })
    }
}

export {
    getUsuario,
    createUsuario,
    createProducto,
    getProductos,
    deleteProductoById, 
    getCategorias,
    getProductosById
}