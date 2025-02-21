import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT1 || 3000;

const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT2,
  ssl: { rejectUnauthorized: false } 
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

// let users = [
//   { id: 1, name: "Angela", color: "teal" },
//   { id: 2, name: "Jack", color: "powderblue" },
// ];
let users;
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries WHERE user_id = $1;", [currentUserId]);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

async function getCurrentUser(){
  const result = await db.query("SELECT * FROM users;");
  users = result.rows;
  return users.find((user)=> user.id == currentUserId);
}


app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const currentUser = await getCurrentUser();
  // console.log(currentUser);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2);",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      // console.log(err);
      console.log(currentUserId);
      const country = await checkVisisted();
      const currentUser = await getCurrentUser();
      res.render("index.ejs", {
        countries: country,
        total: country.length, 
        users: users,
        color: currentUser.color,
        error: "Country has already been added, try again."});
    }
  } catch (err) {
    console.log(err);

    const country = await checkVisisted();
    const currentUser = await getCurrentUser();
    res.render("index.ejs", {
      countries: country,
      total: country.length, 
      users: users,
      color: currentUser.color,
      error: "Country name does not exist, try again."});
  }
});

app.post("/user", async (req, res) => {
  // console.log(req.body);
  if (req.body.add === "new")
    res.render("new.ejs");
  else if (req.body.add === "del")
    res.render("del.ejs");
  else
  {
    currentUserId = req.body.user;
    res.redirect("/");
  }

});

app.post("/new", async (req, res) => {


  const name = req.body.name;
  const color = req.body.color;
  // console.log(name);
  // console.log(color); 
  if (name === "" || color === undefined) {
    res.render("new.ejs", { errorMessage: "Name or color is invalid" });
  }else if(name==="Admin"){
    res.render("new.ejs", {errorMessage: "Please do not use Admin"});
  }
  else{
    const result = await db.query("INSERT INTO users (name, color) VALUES ($1 , $2) RETURNING *;", [name, color]);
    const id = result.rows[0].id;
    currentUserId = id;

    res.redirect("/");
  }
}); 

app.post("/delete", async(req, res) => {
  const deletedName = req.body.name;
  if(deletedName === "Admin")
  {
    res.render("del.ejs", {errorMessage: "Cannot delete Admin"});
  }else{
  try{
    await db.query("DELETE FROM users WHERE name = $1", [deletedName]);
    currentUserId = 1;
    res.redirect("/");
  }
  catch(err)
  {
    console.log(err);
  }
}
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
