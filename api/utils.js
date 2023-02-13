const express = require('express');

function unauthorizedUser (req, res, next) {
  if (!req.user) {
    res.status(401);
    res.send({
      error: 'unauthorizedUser',
      name: 'unauthorizedUser',
      message: "You must be logged in to perform this action"
    });
  }
  next();
}

module.exports = { unauthorizedUser };