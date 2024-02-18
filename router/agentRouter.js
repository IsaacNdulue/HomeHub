const express = require('express')
const { login, signUp, logOut,updateIsGood,getAllAgent,getHousebyCate,getOneAgent, getAgentHousesForSale, getAgentHousesForRent,deleteOneAgent,verify, getAgentHouses } = require('../Controller/agentController')
const { postHouse,sponsorPost, updateHouse, getOneHouse,editHouse, getAllHouse,getAgentSponsoredPost, deleteOneHouse,deleteAllHouses } = require('../Controller/houseController')
const { createCategory, getCategory, getOneCate,deleteOneCate } = require('../Controller/CateController')
const authenticate = require('../middleware/authenticate')
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
router.patch('/verify/:userToken', verify )
// get all agent
router.get('/getallagent', getAllAgent)
//get one agent
router.get('/getoneagent/:id', getOneAgent)

//get one agent houses
router.get('/getAgentHouse/:id',getAgentHouses)

router.get('/forSaleProperty/:id', getAgentHousesForSale)
router.get('/forRentProperty/:id', getAgentHousesForRent)
router.delete('/deleteagent/:id', deleteOneAgent)

// router.post('/logout/:id', logOut)

router.put('/Category', createCategory)

//get Category
router.get('/getCate',getCategory)

router.get('/getOneCate/:id', getOneCate)
router.delete('/deleteOneCate/:id', deleteOneCate)

//Update is good for an agent
router.put('/updateIsGood/:id', updateIsGood)

//post a house
router.post('/postHouse', authorization, upload.array('images', 6), postHouse)

//sponsor a post
router.put('/sponsorPost/:houseId', sponsorPost)
//get an agent sponsored posts
router.get('/getSponsored/:agentId', getAgentSponsoredPost)


// router.put('/editpost/:id', updateHouse)
// router.put('/editHouse/:houseId', editHouse)
// Edit
router.patch('/house/edit/:houseId', upload.array('images'), editHouse);


router.get('/gethouse/:id', getOneHouse)
router.get('/getallhouse',getAllHouse)
router.delete('/deletehouse/:id', deleteOneHouse)
router.delete('/deleteAllHouses', deleteAllHouses)

router.get('/gethousebycate/:categoryId', getHousebyCate)
router.post('/logout', logOut)
module.exports = router