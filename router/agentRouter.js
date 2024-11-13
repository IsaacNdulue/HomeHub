// const express = require('express')
// const { login, signUp, logOut,updateIsGood,MakeAdmin,getAllAgent,getHousebyCate,getOneAgent, getAgentHousesForSale, getAgentHousesForRent,deleteOneAgent,agentForgotPassword,AgentResetPassword,verify, getAgentHouses } = require('../Controller/agentController')
// const { postHouse, sponsorPost, updateHouse, getOneHouse, editHouse, getAllHouse, getAgentSponsoredPost, allSponsoredPost, deleteSponsoredHouse, deleteOneHouse,deleteAllHouses, verifyHouse, getSomeHouses } = require('../Controller/houseController')
// const { createCategory, getCategory, getOneCate,deleteOneCate } = require('../Controller/CateController')
// const authorization = require('../middleware/authorization')
// const upload = require('../Utility/multer')
// const { authenticateAdmin } = require('../middleware/authenticate')


// const router = express.Router()

// //signUp
// router.post('/signup', upload.fields([
//     {name:'documentImage', maxCount:1},
//     {name:'regCert', maxCount:1},
// ]),signUp)
// //login
// router.post('/login', login)
// //verify
// router.get('/verify/:id/:token', verify )


// // get all agent
// router.get('/getallagent', getAllAgent)
// //get one agent
// router.get('/getoneagent/:id', getOneAgent)

// //get one agent houses
// router.get('/getAgentHouse/:id',getAgentHouses)

// router.get('/forSaleProperty/:id', getAgentHousesForSale)
// router.get('/forRentProperty/:id', getAgentHousesForRent)
// router.delete('/deleteagent/:id', deleteOneAgent)

// // router.post('/logout/:id', logOut)

// router.put('/Category', createCategory)

// //get Category
// router.get('/getCate', getCategory)

// router.get('/getOneCate/:id', getOneCate)
// router.delete('/deleteOneCate/:id',  deleteOneCate)

// //Make an admin
// router.get('/MakeAdmin', MakeAdmin)

// //Update is good for an agent
// router.put('/updateIsGood/:id', authenticateAdmin, updateIsGood)

// //post a house 
// // router.post('/postHouse', authorization, upload.array('images', 6), postHouse)
// router.post('/postHouse/:agentId', upload.array('images', 6), postHouse);
// router.put('/verifyHouse/:id',authenticateAdmin,  verifyHouse)
  

// //sponsor a post
// router.put('/sponsorPost/:houseId', sponsorPost)
// //get an agent sponsored posts
// router.get('/getSponsored/:id', getAgentSponsoredPost)
// //get all Sponsored post
// router.get('/allSponsored', allSponsoredPost)
// //delete a sponsored house
// router.delete('/deleteSponsoredHouse/:sponsoredId', deleteSponsoredHouse)

// // router.put('/editpost/:id', updateHouse)
// // router.put('/editHouse/:houseId', editHouse)


// // Agent editing their house
// router.patch('/house/edit/:houseId',authorization, upload.array('images'), editHouse);


// router.get('/gethouse/:id', getOneHouse)

// router.get('/getallhouse', getAllHouse)
// router.get('/getSomeHouses', getSomeHouses)
// // router.get('/adminGetAllHouses', admin, getAllHouses)//admin can get all houses. Not added to the documentation yet


// router.delete('/deletehouse/:id', deleteOneHouse)

// router.delete('/deleteAllHouses', deleteAllHouses)
// //forgot password
// router.post('/forgotpassword', agentForgotPassword)
// //reset password
// router.put('/AgentResetPassword/:agentId', AgentResetPassword);

// router.get('/gethousebycate/:categoryId', getHousebyCate)
// router.post('/logout', logOut)
// module.exports = router


const express = require('express');
const {
    login, signUp, logOut, updateIsGood, MakeAdmin, getAllAgent, getHousebyCate, getOneAgent,
    getAgentHousesForSale, getAgentHousesForRent, deleteOneAgent, agentForgotPassword, AgentResetPassword,
    verify, getAgentHouses
} = require('../Controller/agentController');
const {
    postHouse, sponsorPost, updateHouse, getOneHouse, editHouse, getAllHouse, getAgentSponsoredPost,
    allSponsoredPost, deleteSponsoredHouse, deleteOneHouse, deleteAllHouses, verifyHouse, getSomeHouses
} = require('../Controller/houseController');
const {
    createCategory, getCategory, getOneCate, deleteOneCate
} = require('../Controller/CateController');
const authorization = require('../middleware/authorization');
const upload = require('../Utility/multer');
const { authenticateAdmin } = require('../middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Agents
 *   description: Agent management API
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     tags:
 *       - Agents
 *     summary: Create a new agent account
 *     description: Allows agents to register by providing their details.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the agent
 *                 example: "John Doe"
 *               companyName:
 *                 type: string
 *                 description: Company name of the agent
 *                 example: "Doe Real Estate"
 *               email:
 *                 type: string
 *                 description: Email of the agent
 *                 example: "john@example.com"
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number of the agent
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 description: Password for the account
 *                 example: "password123"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm the password
 *                 example: "password123"
 *               address:
 *                 type: string
 *                 description: Address of the agent
 *                 example: "123 Street, City, Country"
 *               documentImage:
 *                 type: string
 *                 format: binary
 *                 description: Upload document image (e.g., license)
 *               regCert:
 *                 type: string
 *                 format: binary
 *                 description: Upload registration certificate
 *     responses:
 *       200:
 *         description: Agent registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Agent registered"
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 agent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     fullName:
 *                       type: string
 *                       example: "John Doe"
 *                     companyName:
 *                       type: string
 *                       example: "Doe Real Estate"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+1234567890"
 *                     documentImage:
 *                       type: string
 *                       example: "https://cloudinary.com/image/upload/v1/agent/docs/license.png"
 *                     regCert:
 *                       type: string
 *                       example: "https://cloudinary.com/image/upload/v1/agent/docs/cert.png"
 *                     address:
 *                       type: string
 *                       example: "123 Street, City, Country"
 *       400:
 *         description: Validation errors or agent already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email already exists"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not created"
 *                 error:
 *                   type: string
 *                   example: "Server error message"
 */

/**
 * @swagger
 * /api/agent/login:
 *   post:
 *     tags:
 *       - Agents
 *     summary: Agent login
 *     description: Authenticates the agent and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Registered email of the agent
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: Password for the account
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Agent logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 agent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     fullName:
 *                       type: string
 *                       example: "John Doe"
 *                     companyName:
 *                       type: string
 *                       example: "Doe Real Estate"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+1234567890"
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Incorrect password"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error during Login"
 *                 error:
 *                   type: string
 *                   example: "Server error message"
 */

/**
 * @swagger
 * /api/agent/verify/{id}/{token}:
 *   get:
 *     summary: Verify agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent verified successfully
 */
router.get('/verify/:id/:token', verify); 

/**
 * @swagger
 * /api/agent/getallagent:
 *   get:
 *     summary: Get all agents
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: A list of all agents
 */
router.get('/getallagent', getAllAgent);

/**
 * @swagger
 * /api/agent/getoneagent/{id}:
 *   get:
 *     summary: Get one agent by ID
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent details
 */
router.get('/getoneagent/:id', getOneAgent);

/**
 * @swagger
 * /api/agent/getAgentHouse/{id}:
 *   get:
 *     summary: Get agent's houses
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of houses by the agent
 */
router.get('/getAgentHouse/:id', getAgentHouses);

/**
 * @swagger
 * /api/agent/forSaleProperty/{id}:
 *   get:
 *     summary: Get agent's houses for sale
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of houses for sale
 */
router.get('/forSaleProperty/:id', getAgentHousesForSale);

/**
 * @swagger
 * /api/agent/forRentProperty/{id}:
 *   get:
 *     summary: Get agent's houses for rent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of houses for rent
 */
router.get('/forRentProperty/:id', getAgentHousesForRent);

/**
 * @swagger
 * /api/agent/deleteagent/{id}:
 *   delete:
 *     summary: Delete an agent by ID
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent deleted
 */
router.delete('/deleteagent/:id', deleteOneAgent);

/**
 * @swagger
 * /api/agent/Category:
 *   put:
 *     summary: Create a new category
 *     tags: [Categories]
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.put('/Category', createCategory);

/**
 * @swagger
 * /api/agent/getCate:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of all categories
 */
router.get('/getCate', getCategory);

/**
 * @swagger
 * /api/agent/getOneCate/{id}:
 *   get:
 *     summary: Get one category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 */
router.get('/getOneCate/:id', getOneCate);

/**
 * @swagger
 * /api/agent/deleteOneCate/{id}:
 *   delete:
 *     summary: Delete one category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete('/deleteOneCate/:id', deleteOneCate);

/**
 * @swagger
 * /api/agent/MakeAdmin:
 *   get:
 *     summary: Make an admin
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Admin rights granted
 */
router.get('/MakeAdmin', MakeAdmin);

/**
 * @swagger
 * /api/agent/updateIsGood/{id}:
 *   put:
 *     summary: Update agent status (isGood)
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent status updated
 */
router.put('/updateIsGood/:id', authenticateAdmin, updateIsGood);

// House routes (similar Swagger documentation can be applied for other routes)
// Example: Post a house
router.post('/postHouse/:agentId', upload.array('images', 6), postHouse);

/**
 * @swagger
 * /api/agent/logout:
 *   post:
 *     summary: Log out an agent
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: Agent logged out successfully
 */
router.post('/logout', logOut);

module.exports = router;
