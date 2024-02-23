const express = require('express');
const {signUp, verify, logIn, update, favoriteProperty,forgotPassword, resetPassword, logOut, deleteUser, getAll, getOne} = require('../Controller/userController');
const {authenticate} = require('../middleware/userAuth');

const router = express.Router()
//endpoint to Sigup a user
router.post('/usersignup', signUp); 
//endpoint to verify a user after signup
router.get('/verify/:id', verify);
//endpoint to login a user
router.post('/login', logIn);
//endpoint to Update User details
router.put('/update/:id', authenticate, update);
//add to favorite
router.put('/favoriteProperty/:postId',favoriteProperty)
//endpoint to get all Users
router.get('/getone/:id', getOne)
//endpoint to get all Users
router.get('/allusers', getAll)
//endpoint to delete a User account
router.delete('/deleteAccount/:id', authenticate, deleteUser)
//endpoint for User to get/change password through a link
router.post('/forgotpassword', authenticate, forgotPassword);
//endpoint to reset a user password
router.get('/resetpassword/:id', authenticate, resetPassword);
//endpoint to logout a User
router.post('/logout/:id', authenticate,logOut);


module.exports = router