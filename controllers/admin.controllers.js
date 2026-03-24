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

// ENDPOINT PARA CREAR PRODUCTOS 
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

// ENDPOINT PARA OBTENER LOS USUARIOS
const getUsuario = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM usuario');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los usuarios: ', error);
        res.status(500).json({ error: 'error en el servidor' });
    }
}

// ENDPOINT PARA OBTENER LOS PRODUCTOS
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

// ENDPOINT PARA OBTENER LOS PRODUCTOS POR ID
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

// ENDPOINT PARA OBTENER LAS CATEGORIAS
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

// ENDPOINT PARA ELIMINAR UN PRODUCTO POR ID
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

//ENDPOINT PARA AGREGAR PRODUCTOS AL CARRITO
const agregarAlCarrito = async (req, res) => {
    try {

        const { carrito_id, producto_id, cantidad, precio_unitario } = req.body;
        const query = "INSERT INTO carrito_detalle (carrito_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";

        await db.execute(query, [carrito_id, producto_id, cantidad, precio_unitario]);

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

// ENDPOINT PARA BUSCAR EL CARRITO ACTIVO DE UN USUARIO
const searchCarrito = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("ID USUARIO:", id);

        const query = "SELECT * FROM carrito WHERE usuario_id = ? AND estado = 'activo'";
        const [rows] = await db.execute(query, [id]);

        const carrito = rows[0];

        if (rows.length === 0) {
            return res.status(404).json({
                msg: "Carrito no encontrado"
            });
        }
        return res.json(carrito);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error en el servidor"
        });
    }
}

// ENDPOINT PARA OBTENER LOS PRODUCTOS DE UN CARRITO
const getProductosCarrito = async (req, res) => {
    try {
        const { id } = req.params; 

        // SOLO TRAEMOS EL ID DE LOS PRODUCTOS
        const query = "SELECT producto_id FROM carrito_Detalle WHERE carrito_id = ?";
        const [rows] = await db.execute(query, [id]);

        //RETORNAMOS EL ARRAY DE LOS ID DE LOS PRODUCTOS
        res.json(rows);

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
}

// ENDPOINT PARA QUITAR UN PRODUCTO DEL CARRITO
const quitarDelCarrito = async (req, res) => {
    try {
        const { carrito_id, producto_id } = req.params;
        console.log("Carrito ID:", carrito_id);
        console.log("Producto ID:", producto_id);
        const query = "DELETE FROM carrito_detalle WHERE carrito_id = ? AND producto_id = ?";
        await db.execute(query, [carrito_id, producto_id]);

        res.status(200).json({
            ok: true,
            msg: "Producto eliminado del carrito"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error en el servidor"
        });
    }
}

export {
    getUsuario,
    createUsuario,
    createProducto,
    getProductos,
    deleteProductoById,
    getCategorias,
    getProductosById,
    agregarAlCarrito,
    searchCarrito,
    getProductosCarrito,
    quitarDelCarrito
}