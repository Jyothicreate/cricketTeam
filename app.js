const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const path = require('path')
const databasePath = path.join(__dirname, 'cricketTeam.db')
let database = null
app.use(express.json())

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
        SELECT *
        FROM cricket_team;`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playersDetails = request.body
  const {playerName, jerseyNumber, role} = playersDetails
  const addPlayerQuery = `
        INSERT INTO 
            cricket_team(player_name, jersey_number, role)
        VALUES 
            (
            '${playerName}',
            ${jerseyNumber},
            '${role}'
        );`
  await database.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerIdQuery = `
        SELECT *
        FROM cricket_team,
        WHERE 
          player_id = ${playerId};`
  const player = await database.run(getPlayerIdQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
        UPDATE cricket_team,
        SET 
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}',

        WHERE player_id = ${playerId};`
  await database.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
        DELETE FROM
          cricket_team,
        WHERE player_id = ${playerId};`
  await database.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
