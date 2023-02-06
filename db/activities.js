const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  // had to change test specs for this function so that all names are lowercased
  // test spec expected Marathon and not marathon, but instructions said to make 
  // it lowercase.
  try {
    const { rows: [ activity ] } = await client.query(
      `INSERT INTO activities(name, description)
      VALUES(LOWER($1), $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;`
    , [name, description]);

    return activity;
  } catch (error) {
    console.error(error);
  }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows } = await client.query(
      `SELECT *
      FROM activities;`
    );

    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function getActivityById(id) {
  try {
    const { rows: [ activity ] } = await client.query(
      `SELECT *
      FROM activities
      WHERE id=$1;`
    , [id])

    return activity;
  } catch (error) {
    console.error(error);
  }
}

async function getActivityByName(name) {
  try {
    const { rows: [ activity ] } = await client.query(
      `SELECT *
      FROM activities
      WHERE name=$1;`
    , [name])

    return activity;
  } catch (error) {
    console.error(error);
  }
}

async function attachActivitiesToRoutines(routines) {
  // select and return an array of all activities
  // will need this for all get methods in routine functions

  // Make a copy of your routines array, new variable and spread routines array
  const newRoutines = [...routines];

  // Create two more variables, one for bind values and one for routine ids(an array of routinesId)
  // Essentially bind variables are placeholders that are used in your sql statements. 
  // Example you might have something like VALUES($1, $2), and instead you would replace these with 
  // the bind variable.
  // With bind variables, multiple queries will be treated as the same even if inputs are different. 
  // Makes it more secure.
  // In your SQL statement, you can ues the variable using :nameOfBindVariable in your WHERE clause
  // Example: WHERE assignedId = :userId;
  const bind = routines.map((element, index) => `$${index + 1}`).join(', ');
  const routineIds = routines.map(routine => routine.id);

  // Then after do the try catch
  // Validate you have routines and routineids before continuing
  // You are attaching all activities to all routines
  // SQL query will require a join, because you want to grab data from activities and 
  // routines_activties table 
  // One will be main table, and the other you will join (has reference to main table)
  // After selecting all, you want to make a for loop after query
  // Loop over variable created thats copy of routines
  // Filter the activities to look for ones with the same routineid (make variable), that you have been
  // looping through, and then adding filter variable to each indivdual routine as its being 
  // looped through. Then return the new routines (new routines variable).
  try {
    const { rows: activities } = await client.query(
      `SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON routine_activities."activityId"=activities.id
      WHERE routine_activities."routineId" IN (${bind});`
    , routineIds);

    for (let i = 0; i < newRoutines.length; i++) {
      const filteredActivities = activities.filter(
        activity => activity.routineId === newRoutines[i].id
      );

      newRoutines[i].activities = filteredActivities;
    }

    return newRoutines;
  } catch (error) {
    console.error(error);
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  try {
    const { rows: [ activity ] } = await client.query(
      `UPDATE activities
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;`
    , Object.values(fields));

    return activity;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
