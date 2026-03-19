import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import { db } from '../dababase/db.js';
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
    console.log(email, password);
    try {
        
        const query = "SELECT * FROM usuario WHERE email=?"

        const [rows] = await db.execute(query, [email]);

        if (rows.length === 0) {
            return res.status(400).json({
                msg: "El email o la contraseña son incorrectos"
            })
        }

        const userFound = rows[0];

        const isMatch = await bcrypt.compare(password, userFound.password)

        if (!isMatch) return res.status(400).json({
            msg: "El email o la contraseña son incorrectos"
        })

        const token = await createAccessToken({
            id: userFound.id,
            rol: userFound.rol
        })

        console.log("TOKEN GENERADO:", token);

        res.cookie("token", token);

        res.status(200).json({
            id: userFound.id,
            username: userFound.nombre,
            email: userFound.email,
            rol: userFound.rol,
            token: token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error interno del servidor"
        })
    }
}

export const verifyToken = async (req, res) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                msg: "No token provided"
            });
        }
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        const query = "SELECT * FROM usuario WHERE id=?"

        const [rows] = await db.execute(query, [decoded.id]);
        
        if (rows.length === 0) {
            return res.status(401).json({
                msg: "Usuario no autorizado"
            });
        }

        const user = rows[0];

        res.status(200).json({
            id: user.id,
            username: user.nombre,
            email: user.email,
            rol: user.rol
        });

    } catch (error) {
        res.status(401).json({
            msg: "Token inválido"
        });
    }
}