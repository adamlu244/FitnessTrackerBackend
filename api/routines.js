const express = require('express');
const { getAllPublicRoutines, createRoutine, getRoutineById, updateRoutine, destroyRoutine, getRoutineActivitiesByRoutine, addActivityToRoutine } = require('../db');
const { unauthorizedUser } = require('./utils')
const router = express.Router();

// GET /api/routines
router.get('/', async (req, res, next) => {
  try {
    const allRoutines = await getAllPublicRoutines();
    res.send(allRoutines);
  } catch ({ name, message }) {
    next({ name, message });
  }
})

// POST /api/routines
router.post('/', unauthorizedUser, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;

  try {
    const newRoutine = await createRoutine({ 
      creatorId: req.user.id,
      isPublic, 
      name, 
      goal 
    });

    if (newRoutine) {
      res.send(newRoutine);
    } else {
      res.send({
        error: 'authorizationError',
        name: 'authorizationError',
        message: "You must be logged in to perform this action"
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
})

// PATCH /api/routines/:routineId
router.patch('/:routineId', unauthorizedUser, async (req, res, next) => {
  const id = req.params.routineId;
  const { isPublic, name, goal } = req.body;

  try {
    if (id === undefined) {
      res.send({
        error: 'authorizationError',
        name: 'authorizationError',
        message: `No routine with id of ${id}`
      })
    } else {
      const routine = await getRoutineById(id);
    
      if(routine.creatorId != req.user.id) {
        res.status(403);
        res.send({
          error: 'authorizationError',
          name: 'authorizationError',
          message: `User ${req.user.username} is not allowed to update ${routine.name}`
        })
      } 
      
      const updatedRoutine = await updateRoutine({ 
        id,
        name,
        goal,
        isPublic
      });
    
      res.send(updatedRoutine);
    }
    


  } catch ({ name, message }) {
    next({ name, message });
  }
})

// DELETE /api/routines/:routineId
router.delete('/:routineId', unauthorizedUser, async (req, res, next) => {
  try {
    const routine = await getRoutineById(req.params.routineId);

    if (routine.creatorId === req.user.id) {
      const destroyedRoutine = await destroyRoutine(req.params.routineId);
      
      res.send(destroyedRoutine[0]);
    } else {
      res.status(403);
      res.send({
        error: 'authorizationError',
        name: 'authorizationError',
        message: `User ${req.user.username} is not allowed to delete ${routine.name}`
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
})

// POST /api/routines/:routineId/activities
router.post('/:routineId/activities', async (req, res, next) => {
  const { routineId, activityId, count, duration } = req.body;

  try {
    const [ routineActivities ] = await getRoutineActivitiesByRoutine({ id: routineId });
    
    if (
      routineActivities &&
      routineActivities.activityId === activityId &&
      routineActivities.routineId === routineId
    ) {
      res.status(403);
      res.send({
        error: 'duplicateError',
        name: 'duplicateError',
        message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`
      })
    } else {
      const attachedActivity = await addActivityToRoutine({
        routineId,
        activityId,
        count,
        duration
      })

      res.send(attachedActivity);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
})
module.exports = router;
