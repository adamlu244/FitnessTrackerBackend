const express = require('express');
const { getPublicRoutinesByActivity, getActivityById, getAllActivities, createActivity, updateActivity, getActivityByName } = require('../db');
const router = express.Router();

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next) => {
  const id = req.params.activityId;
  const activity = await getActivityById(id)

  if (activity) {
    try {
      const publicRoutines = await getPublicRoutinesByActivity({ id });
      res.send(publicRoutines);
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    res.send({
      error: 'error',
      name: 'activityError',
      message: `Activity ${id} not found`
    })
  }
})

// GET /api/activities
router.get('/', async (req, res, next) => {
  try {
    const allActivities = await getAllActivities();
    res.send(allActivities);
  } catch ({ name, message }) {
    next({ name, message });
  }
})

// POST /api/activities
router.post('/', async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const newActivity = await createActivity({ name, description });

    if (newActivity) {
      res.send(newActivity);
    } else {
      res.send({
        error: 'createNewActivityError',
        name: 'createNewActivityError',
        message: `An activity with name ${name} already exists`
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
})

// PATCH /api/activities/:activityId
router.patch('/:activityId', async (req, res, next) => {
  const id = req.params.activityId;
  const { name, description } = req.body;

  try {
    const originalActivity = await getActivityById(id);
    const activityName = await getActivityByName(name);

    if(!originalActivity) {
      res.send({
        error: 'updateError',
        name: 'updateError',
        message: `Activity ${id} not found`
      })
    } else if (activityName){
      res.send({
        error: 'updateError',
        name: 'updateError',
        message: `An activity with name ${name} already exists`
      })
    } else {
      const updatedActivity = await updateActivity({ id, name, description });
      res.send(updatedActivity);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
})
module.exports = router;
