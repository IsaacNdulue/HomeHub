const express = require('express')
const { login, signUp, logOut,updateIsGood,MakeAdmin,getAllAgent,getHousebyCate,getOneAgent, getAgentHousesForSale, getAgentHousesForRent,deleteOneAgent,agentForgotPassword,AgentResetPassword,verify, getAgentHouses } = require('../Controller/agentController')
const { postHouse, sponsorPost, updateHouse, getOneHouse, editHouse, getAllHouse, getAgentSponsoredPost, allSponsoredPost, deleteSponsoredHouse, deleteOneHouse,deleteAllHouses, verifyHouse, getSomeHouses } = require('../Controller/houseController')
const { createCategory, getCategory, getOneCate,deleteOneCate } = require('../Controller/CateController')
const {authenticate, admin} = require('../middleware/authenticate')
const authorization = require('../middleware/authorization')
const upload = require('../Utility/multer')


const router = express.Router()

//signUp
router.post('/signup', upload.fields([
    {name:'documentImage', maxCount:1},
    {name:'regCert', maxCount:1},
]),signUp)
//login
router.post('/login', login)
//verify
router.get('/verify/:id/:token', verify )


// get all agent
router.get('/getallagent', getAllAgent)
//get one agent
router.get('/getoneagent/:id', getOneAgent)

//get one agent houses
router.get('/getAgentHouse/:id',getAgentHouses)

router.get('/forSaleProperty/:id', getAgentHousesForSale)
router.get('/forRentProperty/:id', getAgentHousesForRent)
router.delete('/deleteagent/:id', admin, deleteOneAgent)

// router.post('/logout/:id', logOut)

router.put('/Category', createCategory)

//get Category
router.get('/getCate', getCategory)

router.get('/getOneCate/:id', getOneCate)
router.delete('/deleteOneCate/:id', admin, deleteOneCate)

//Make an admin
router.get('/MakeAdmin', admin, MakeAdmin)

//Update is good for an agent
router.put('/updateIsGood/:id', admin, updateIsGood)

//post a house
// router.post('/postHouse', authorization, upload.array('images', 6), postHouse)
router.post('/postHouse', authorization, upload.array('images', 6), postHouse);
router.put('/verifyHouse', admin, verifyHouse)
  

//sponsor a post
router.put('/sponsorPost/:houseId', sponsorPost)
//get an agent sponsored posts
router.get('/getSponsored/:id', getAgentSponsoredPost)
//get all Sponsored post
router.get('/allSponsored', allSponsoredPost)
//delete a sponsored house
router.delete('/deleteSponsoredHouse/:sponsoredId', deleteSponsoredHouse)

// router.put('/editpost/:id', updateHouse)
// router.put('/editHouse/:houseId', editHouse)


// Agent editing their house
router.patch('/house/edit/:houseId',authorization, upload.array('images'), editHouse);


router.get('/gethouse/:id', getOneHouse)

router.get('/getallhouse', getAllHouse)
router.get('/getSomeHouses', getSomeHouses)
// router.get('/adminGetAllHouses', admin, getAllHouses)//admin can get all houses. Not added to the documentation yet


router.delete('/deletehouse/:id', deleteOneHouse)

router.delete('/deleteAllHouses', deleteAllHouses)
//forgot password
router.post('/forgotpassword', agentForgotPassword)
//reset password
router.get('/AgentResetPassword/:token', AgentResetPassword)

router.get('/gethousebycate/:categoryId', getHousebyCate)
router.post('/logout', logOut)
module.exports = router