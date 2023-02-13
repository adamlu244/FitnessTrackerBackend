/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();

const jwt = require('jsonwebtoken');
const { getUserByUsername, createUser } = require("../db");


// POST /api/users/register
router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;
  
  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      res.send({
        error: 'duplicateUserError',
        name: 'userExistsError',
        message: `User ${username} is already taken.`
      })
    } 
    
    if (password.length < 8) {
      res.send({
        error: 'passwordError',
        name: 'passwordError',
        message: 'Password Too Short!'
      })
    } 

    const user = await createUser({
      username,
      password
    });

    const token = jwt.sign({
      id: user.id,
      username
    },
      process.env.JWT_SECRET
    );

    res.send({
      message: 'Thank you for signing up',
      token,
      user
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
})

// POST /api/users/login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  const user = await getUserByUsername(username, password);

  if (!username || !password) {
    res.send({
      error: 'loginError',
      name: 'loginError',
      message: 'Please supply both username and password'
    })
  }

  try {
    if (user) {
      const token = jwt.sign({ 
        id: user.id, 
        username 
      }, process.env.JWT_SECRET);

      res.send({
        message: "you're logged in!",
        user,
        token
      })
    } else {
      res.send({
        error: 'incorrectCredentialsError',
        name: 'incorrectCredentialsError',
        message: 'Username or password is incorrect'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }

})

// GET /api/users/me
router.get('/me', async (req, res, next) => {
  const user = req.user;

  console.log({user});
  try {
    
  } catch ({ name, message }) {
    next({ name, message });
  }
})
// GET /api/users/:username/routines

module.exports = router;
