## twitter API
A set of API endpoint that mimics basic twitter features. MongoDB version.

### Requirement
-   Nodejs
-   MongoDB
-   Redis

### Local Setup
-   clone this repo
-   `cp` `.env.example` to `.env` and set your environment variables.
-   in your terminal, cd to app root
-   run `npm install`
-   run  `npm start`

### test
-   Please note that I only wrote the unit and integration test for the users module,
    due to time constraint
-   Follow the instructions in the Local Section Setup Above.
-   Install MongoDB and run it by executing mongod
-   run `npm test`
-   visit `http://localhost:${PORT}` 
-   to access auth protected routes pass `Authorization` as header parameter and `Bearer <jwt token>` as value

### Documentation
#### local doc
-   visit `http://localhost:${PORT}` 
#### live doc
-   visit https://still-tundra-29433.herokuapp.com/
### Live Url
- https://still-tundra-29433.herokuapp.com/
- Please note that you may get a connection timeout error. Like so
`{
     "errors": {
         "message": "connect ETIMEDOUT",
         "error": {}
     }
 }` 
  This is because this app was deployed to heroku free dyno.
  In this case. please try again with a faster internet.

