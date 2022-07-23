const express = require('express')
const router = express.Router()
const User = require('../models/User')
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'thisisscretjwtkeyofINOTEBOOK';


//ROUTE 1: Create User using POST "/api/auth/createuser" . no login required

router.post('/createuser', [
    body('name', 'Enter a Valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password must be aleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }


    //check if user already exists with same email
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: 'Sorry User with this Email already exists' })
        }

        // Adding Salt and making password sceure

        // const salt = await bcrypt.genSalt(10);
        // const secPass = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            password: req.body.password,
            // sceure Password
            // password: secPass,
            email: req.body.email,
        });

        const data = {
            user: {
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        //   console.log(jwtData);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
})


//ROUTE 2: Authincate a user using POST "/api/auth/login" . no login required

router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password can not be blank').exists(),
], async (req, res) => {

    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: 'Please enter Correct Credentials' });
        }

        // For Secure Password
        // const passwordCompared = await bcrypt.compare(password, user.password);
        // if (!passwordCompared) {
        if (user.password !== password) {
            return res.status(400).json({ success, error: 'Please enter Correct Credentials' });
        }
        const data = {
            user: {
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }

})

//ROUTE 3: Getting Loged in user Data using POST "/api/auth/getuser" .Login required

router.post('/getuser', fetchuser, async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        res.send( user );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
})


//Route 3: Update  User using PUT "/api/auth/updatenote" . login required

router.put('/updateuser/:id', fetchuser, async (req, res) => {

    try {
        const { name, email, password } = req.body;
        const newUser = {};
        if (name) { newUser.name = name };
        if (email) { newUser.email = email };
        if (password) { newUser.password = password };
        const usr = await User.findByIdAndUpdate(req.params.id, { $set: newUser }, { new: true });
        res.json({ usr });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
})

module.exports = router;