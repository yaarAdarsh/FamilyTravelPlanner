-- SOLUTION AND SETUP --

DROP TABLE IF EXISTS visited_countries, users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(15) UNIQUE NOT NULL,
    color VARCHAR(15) NOT NULL
);

CREATE TABLE visited_countries (
    id SERIAL PRIMARY KEY,
    country_code CHAR(2) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	CONSTRAINT unique_country_user UNIQUE (country_code, user_id)
);

INSERT INTO users (name, color)
VALUES ('Angela', 'teal'), ('Jack', 'powderblue');

INSERT INTO visited_countries (country_code, user_id)
VALUES ('FR', 1), ('GB', 1), ('CA', 2), ('FR', 2 );

SELECT *
FROM visited_countries
JOIN users
ON users.id = user_id;

-- YOU ALSO NEED TO CREATE countries TABLE --

DROP TABLE IF EXISTS countries;

CREATE TABLE countries(
  id INT PRIMARY KEY,
  country_code VARCHAR(2) ,
  country_name text
);

-- THEN INSERT ALL COUNTRIES USING countries.csv --