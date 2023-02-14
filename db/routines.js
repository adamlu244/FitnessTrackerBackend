const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [ routine ] } = await client.query(
      `INSERT INTO routines("creatorId", "isPublic", name, goal)
      VALUES($1, $2, LOWER($3), $4)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;`
    , [creatorId, isPublic, name, goal]);

    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [ routine ] } = await client.query(
      `SELECT *
      FROM routines
      WHERE id=$1;`
    , [id]);

    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(
      `SELECT *
      FROM routines;`
    );
    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function getAllRoutines() {
  try {
    const { rows } = await client.query(
      `SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId"=users.id;`
    );

    return attachActivitiesToRoutines(rows);
  } catch (error) {
    console.error(error);
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows } = await client.query(
      `SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId"=users.id
      WHERE "isPublic"=true;`
    );
  
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    console.error(error);
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(
      `SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId"=users.id
      WHERE "username"=$1;`
    , [username]);
  
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    console.error(error);
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(
      `SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId"=users.id
      WHERE "username"=$1 AND "isPublic"=true;`
    , [username]);
  
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    console.error(error);
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows } = await client.query(
      `SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId"=users.id
      WHERE "isPublic"=true AND routines.id IN
      (SELECT "routineId" FROM routine_activities WHERE "activityId"=${id});`
    );
  
    return attachActivitiesToRoutines(rows);
  } catch (error) {
    console.error(error);
  }
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ routine ] } = await client.query(
      `UPDATE routines
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;`
    , Object.values(fields));

    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(
      `DELETE 
      FROM routine_activities
      WHERE "routineId"=$1;`
    , [id]);

    const { rows } = await client.query(
      `DELETE 
      FROM routines
      WHERE id=$1
      RETURNING *;`
    , [id]);
      
    return rows;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
