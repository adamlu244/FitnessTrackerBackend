const client = require("./client");
const { getRoutineById } = require("./routines");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const { rows: [ activity ] } = await client.query(
      `INSERT INTO routine_activities("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("routineId", "activityId") DO NOTHING
      RETURNING *;`
    , [routineId, activityId, count, duration]);

    return activity;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineActivityById(id) {
  try {
    const { rows: [routine_activities] } = await client.query(
      `SELECT * 
      FROM routine_activities
      WHERE id=$1;`
    , [id]);

    return routine_activities;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows } = await client.query(
      `SELECT *
      FROM routine_activities
      WHERE routine_activities.id IN
      (SELECT "routineId" FROM routine_activities WHERE "activityId"=${id});`
    );

    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  try {
    const {rows: [ routine_activities ] } = await client.query(
      `UPDATE routine_activities
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;`
    , Object.values(fields));

    return routine_activities;
  } catch (error) {
    console.error(error);
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [ routine_activity ] } = await client.query(
      `DELETE 
      FROM routine_activities
      WHERE id=$1
      RETURNING *;`
    , [id]);

    return routine_activity;
  } catch (error) {
    console.error(error);
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const routineActivity = await getRoutineActivityById(routineActivityId);
    const routine = await getRoutineById(routineActivity.id);
    if(routine[0].creatorId === userId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
