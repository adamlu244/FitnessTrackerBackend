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
  // Save for later?
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
