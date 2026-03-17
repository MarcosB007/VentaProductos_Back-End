import jwt from 'jsonwebtoken';
import { createAccessToken } from '../libs/jwt.js';
import { db } from '../dababase/db.js'
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
    const { nombre, apellido, email, username, password } = req.body;

    try {
        const rol = "usuario";
        const query = "SELECT * FROM usuario WHERE email=?"
        const [usersFound] = await db.execute(query, [email]);

        if (usersFound.length > 0) {
            return res.status(400).json({
                msg: "El usuario ya existe"
            })
        }

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        const queryInsert = "INSERT INTO usuario (nombre, apellido, email, rol, username, password) VALUES (?, ?, ?, ?, ?, ?)"
        const [result] = await db.execute(queryInsert, [nombre, apellido, email, rol, username, passwordHash]);
        const token = await createAccessToken({ id: result.insertId, role: rol })
        res.cookie("token", token, {
            httpOnly: true
        });
        res.status(201).json({
            id: result.insertId,
            username,
            email,
            rol,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error interno del servidor"
        })
    }

}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {

        const query = "SELECT * FROM usuario WHERE email=?"

        const [rows] = await db.execute(query, [email]);

        if (rows.length === 0) {
            return res.json({
                msg: "Usuario no encontrado"
            })
        }

        const userFound = rows[0];

        //AGREGAR LA VALIDACION DE LA CONTRASEÑA

        const isMatch = await bcrypt.compare(password, userFound.password)

        if(!isMatch) return res.status(400).json({
            msg: "El email o la contraseña son incorrectos"
        })

        const token = await createAccessToken({ id: userFound.id })
        res.cookie("token", token, {
            httpOnly: true
        });

        res.status(200).json({
            id: userFound.id,
            username: userFound.nombre,
            email: userFound.email,
            rol: userFound.rol
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error interno del servidor"
        })
    }
}