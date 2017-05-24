
const dbConfig = require('./db-config');
const express = require('express');
global.Promise = require('bluebird');
const bodyParser = require('body-parser');
const cors = require('cors');
const pgp = require('pg-promise')({promiseLib: Promise});
const bcrypt = require('bcrypt');
const uuid = require('uuid');


const db = pgp(dbConfig);


const app = express();
app.use(bodyParser.json());
// serve all the public
app.use(express.static('public'));
app.use(cors());

// Get array of all student objects
app.get('/api/students', (req, resp, next) => {
    db.any(`select * from student order by id`)
        .then(student => resp.json(student))
        .catch(next);
});


// Get object for one specific student based on it's ID
app.get('/api/student/:id', (req, resp, next) => {
    let id = req.params.id;
    db.one(`select * from student where id = $1`, id)
        .then(student => resp.json(student))
        .catch(next);
})



// User sign up
app.post('/api/user/signup', (req, resp, next) => {
    let user = req.body;
    bcrypt.hash(user.password, 10)
        .then(encrypted => {
            return db.one(`insert into student values (default, $1, $2, $3, $4) returning *`, [user.first_name, user.last_name, user.email, encrypted])
        })
        .then(loginDetails => {
            let token = uuid.v4();
            return [loginDetails, db.one(`insert into tokens values (default, $1, $2) returning token`, [loginDetails.id, token])]
        })
        .spread((loginDetails, token) => {
            let newData = {
                first_name: loginDetails.first_name,
                id: loginDetails.id,
                token: token.token
            }
            resp.json(newData);
        })
        .catch((error) => {
            if (error.message === 'duplicate key value violates unique constraint "student_email_key"') {
                resp.status(409);
                resp.json({message: "User with that email already exists"});
            } else {
                throw error;
            }
        })
        .catch(next);
})

// User log in
app.post('/api/user/login', (req, resp, next) => {
    let email = req.body.email;
    let password = req.body.password;
    db.one(`select * from student where email = $1`, email)
        .then(loginDetails => {
            return [loginDetails, bcrypt.compare(password, loginDetails.password)];
        })
        .spread((loginDetails, matched) => {
            if (matched) {
                let token = uuid.v4();
                return [loginDetails, token]
            } else {
                throw {message: "No data returned from the query."}
            }
        })
        .spread((loginDetails, token) => {
            db.none(`insert into tokens values (default, $1, $2)`, [loginDetails.id, token])
                .then(()=> {
                    let data = {
                        first_name: loginDetails.first_name,
                        id: loginDetails.id,
                        token: token
                    }
                    resp.json(data);
                })
        })
        .catch((error) => {
            if (error.message === 'No data returned from the query.') {
                resp.status(401);
                resp.json({message: "Login error"});
            } else {
                throw error;
            }
        })
        .catch(next);
})


// Error handling
app.use((err, req, resp, next) => {
    resp.status(500);
    resp.json({
        error: err.message,
        stack: err.stack.split('\n')
    });
});

app.listen(4000, () => {
    console.log('Listening on port 4000');
})
