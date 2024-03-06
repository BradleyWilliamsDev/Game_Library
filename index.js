import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import config from "./config.js";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const {db} = config;

const dbConfig = {
  user: db.user,
  host: db.host,
  database: db.database,
  password: db.password,
  port: db.port
};

const client = new pg.Client(dbConfig);

client.connect();

let games = [
  { id: 1, game_name: "Borderlands", game_rating: 5, game_summary: "" },
];

async function checkGames(){
    const results = await client.query("SELECT * FROM games ORDER BY id");
    games = results.rows;
    return games;
}

app.get("/", async (req, res) => {
    const gamesToDisplay = await checkGames();
  res.render("index.ejs", { games: games });
});

app.post("/add", async (req, res) => {
  res.render("add.ejs");
});

app.post('/addItem', async (req, res) =>{
  const name = req.body.gameName;
  const rating = req.body.gameRating;
  const summary = req.body.gameSummary;

  try {
    await client.query("INSERT INTO games(game_title, rating, summary) VALUES ($1, $2, $3)", [name, rating, summary]);
    res.redirect('/');  
  } catch (error) {
    console.log(error);
  }
});

app.get("/edit/:postId", async (req, res) => {
  const postID = req.params.postId;
  const postData = await client.query("SELECT * FROM games WHERE id = $1", [postID]);
  const data = postData.rows[0];

  // console.log(data);
  
  res.render("edit.ejs", {postData: data});
});

app.post("/editItem", async (req, res) => {
  const postID = req.body.gameId;
  const postTitle = req.body.gameName;
  const postRating = req.body.gameRating;
  const postSummary = req.body.gameSummary;

  try {
    await client.query("UPDATE games SET game_title = $1, rating = $2, summary = $3 WHERE id = $4", [postTitle, postRating, postSummary, postID]);
    res.redirect("/");
  } catch (error) {
    console.log(error); 
  }
});

app.get("/delete/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    await client.query("DELETE FROM games WHERE id = $1", [postId]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Application is now running on port ${port}`);
});
