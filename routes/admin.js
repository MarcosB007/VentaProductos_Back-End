import { Router } from "express";
import { createProducto, createUsuario, getProductos, getUsuario } from "../controllers/admin.controllers.js";


const routerAdmin = Router();

//routerAdmin.post('/crearUsuario', agregarUsuario);
routerAdmin.get('/usuarios', getUsuario);
routerAdmin.post('/createUsuario', createUsuario);
routerAdmin.post('/createProducto', createProducto);
routerAdmin.get('/productos', getProductos);

export default routerAdmin;
