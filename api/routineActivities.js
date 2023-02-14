const express = require('express');
const { unauthorizedUser } = require('./utils');
const { getRoutineActivityById, updateRoutineActivity, getRoutineById, destroyRoutineActivity } = require('../db');
const router = express.Router();

// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId', unauthorizedUser, async (req, res, next) => {
  const id = req.params.routineActivityId;
  const { duration, count } = req.body;

  try {
    const routineActivity = await getRoutineActivityById(id);
    const routine = await getRoutineById(routineActivity.routineId)
    
    if(routine.creatorId != req.user.id) {
      res.status(403);
      res.send({
        error: 'authorizationError',
        name: 'authorizationError',
        message: `User ${req.user.username} is not allowed to update ${routine.name}`
      })
    } else {
      const updatedRoutineActivity = await updateRoutineActivity({
        id,
        duration,
        count
      });
  
      res.send(updatedRoutineActivity);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
})

// DELETE /api/routine_activities/:routineActivityId
router.delete('/:routineActivityId', unauthorizedUser, async (req, res, next) => {
  try {
    const routineActivity = await getRoutineActivityById(req.params.routineActivityId);
    const routine = await getRoutineById(routineActivity.routineId);

    if(routine.creatorId === req.user.id) {
      const destroyedRoutineActivity = await destroyRoutineActivity(req.params.routineActivityId);

      res.send(destroyedRoutineActivity);
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

module.exports = router;
