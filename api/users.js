/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();

const jwt = require('jsonwebtoken');

const { getUserByUsername, createUser, getPublicRoutinesByUser, getAllRoutinesByUser } = require("../db");
const { unauthorizedUser } = require('./utils')


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
router.get('/me', unauthorizedUser, async (req, res, next) => {
  const user = req.user;

  try {
    if (!user) {
      res.send({
        error: 'unauthorizedUser',
        name: 'unauthorizedUser',
        message: "You must be logged in to perform this action"
      })
    } else {
      res.send(user)
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
})

// GET /api/users/:username/routines
router.get('/:username/routines', async (req, res, next) => {
  const { username } = req.params;
  
  if (req.user.username == username) {
    try {
      const yourRoutines = await getAllRoutinesByUser({ username });
      res.send(yourRoutines);
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    try {
      const publicRoutines = await getPublicRoutinesByUser({ username });
      res.send(publicRoutines);
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
})

module.exports = router;
