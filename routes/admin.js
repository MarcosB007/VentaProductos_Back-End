import { Router } from "express";
import { createProducto, createUsuario, deleteProductoById, getProductos, getUsuario } from "../controllers/admin.controllers.js";
import { login, logout, register, verifyToken } from "../controllers/auth.controllers.js";


const routerAdmin = Router();

//routerAdmin.post('/crearUsuario', agregarUsuario);
routerAdmin.get('/usuarios', getUsuario);
routerAdmin.post('/createUsuario', createUsuario);
routerAdmin.post('/createProducto', createProducto);
routerAdmin.get('/productos', getProductos);
routerAdmin.delete('/deleteProductoById/:id', deleteProductoById);

routerAdmin.post('/login', login);
routerAdmin.post('/logout', logout);
routerAdmin.post('/register', register);
routerAdmin.get('/verify', verifyToken);

export default routerAdmin;
