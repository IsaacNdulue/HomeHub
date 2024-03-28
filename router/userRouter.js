const express = require('express');
const {signUp, logIn, update, addToFavorite, getUserFavorites, removeFromFavorite, forgotPassword, resetPassword, logOut, deleteUserAccount, allUsers, oneUser} = require('../Controller/userController');
const {authenticate} = require('../middleware/userAuth');

const router = express.Router()
//endpoint to Sigup a user
router.post('/usersignup', signUp); 
//endpoint to login a user
router.post('/login', logIn);
//endpoint to Update User details
router.put('/update/:id', authenticate, update);
//add to favorite
router.put('/addToFavorite/:propertyId',authenticate, addToFavorite)
//Get all the users Favorites properties
router.get('/getAllFavorites', getUserFavorites);
//remove From Favourite 
router.delete("/removeFavorite/:propertyId", authenticate, removeFromFavorite)

//endpoint to get all Users
router.get('/getone/:id', oneUser)
//endpoint to get all Users
router.get('/allusers', allUsers)
//endpoint to delete a User account
router.delete('/deleteAccount/:id', authenticate, deleteUserAccount)
//endpoint for User to get/change password through a link
router.post('/forgotpassword', authenticate, forgotPassword);
//endpoint to reset a user password
router.get('/resetpassword/:id', authenticate, resetPassword);
//endpoint to logout a User
router.post('/logout/:id', authenticate,logOut);


module.exports = router