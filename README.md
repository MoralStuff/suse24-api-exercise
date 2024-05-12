Your task is to create a RESTful API server using Express.js. Briefly summarized the server should:

- Authenticate users Iris and Max using bcrypt hashes stored in the users file.
- Serve questions and accept answers based on predefined data in JSON files.
- Keep track of user attempts and scores.

# Your Task

1. **Create an Express REST API Server:**
   - Set up a basic Express server that listens for incoming HTTP requests.
   - Implement routes for the endpoints (listed below) with appropriate HTTP methods and responses.

2. **Implement Authentication:**
   - Create a login mechanism that checks user credentials against the `data/users.json` file.
   - Use JWT (JSON Web Tokens) to secure the endpoints.

3. **Work with JSON Files:**
   - Use the predefined functions `read` and `write` from `src/tools/json-files.js` to read and write data to/from the JSON files.
   - Calling `write('filename.json')` with a filename that does not exist, will create a new file.

4. **Implement API endpoints**
   - Implement API endpoint to authenticate, retrieve questions, start game runs 
     and provide answer to questions for a game run

5. **Prove Endpoint work correctly with API tests**
   - Use jest and supertest to write tests, proving your code works correctly 

## API Endpoint Descriptions

**POST /authenticate**
  - Accepts the username and password via "HTTP Basic" authentication scheme.
  - On successful authentication, returns a JSON Web Token (JWT), which clients will use to access API endpoints subsequently.
  - If authentication fails, returns a 401 Unauthorized status with a relevant message.
  - Authorization: All users (authenticated or not) can access this endpoint.

**GET /questions**
 - Retrieve the properties `id`, `question`, and `options` of all questions stored in `data/questions.json`.
 - Authorization: All users (authenticated or not) can access this endpoint.

**GET /questions/{questionId}**
 - Retrieve the properties `id`, `question`, and `options` for a specific question by its UUID. Omit `correctAnswer`in response.
 - If the `questionId` does not exist, respond with a `404 Not Found` HTTP status code.
 - Authorization: All users (authenticated or not) can access this endpoint.

**POST /game-runs**
 - Create a new game run and store it with the following schema:
     ```js
      {
         "id": "3d13ee89-f02b-4783-bb0e-c2d441a62b4b", // UUID
         "userName": "Iris", // The user's ID
         "createdAt": 1715003838, // Current timestamp
         "responses": {} // Empty hash object for now
      }
      ```
 - Request body: empty.
 - Response body: the **ID** of the newly created run (`runId`).
 - Authorization: Only authenticated users can access this endpoint.
   
**PUT /game-runs/{runId}/responses**
  - Submit a response to specific questions within a game run.
  - Request body: JSON object containing the `questionId` and the submitted `answerIndex`, for example:
     ```json
      { "544db309-40cf-4dd8-8662-c10ed3502a5d" : "0"}
      ```
  - Updates the specified run in the `game-runs.json` file. Example after above submission:
      ```js
       {
          "id": "3d13ee89-f02b-4783-bb0e-c2d441a62b4b", // UUID of the run
          "userName": "Iris", // The user name
          "createdAt": 1715003838, // Timestamp
          "responses": {
            "544db309-40cf-4dd8-8662-c10ed3502a5d": 0 // <questionId>: <answerIndex>
          }
       }
       ```
  - Authorization: Authenticated users can POST to this endpoint only if the referenced game run is owned by them.
   
**GET /game-runs/{runId}/results**
  - Retrieve the results for a specific game run.
  - Returns a JSON object containing the game run's `id`, `createdAt`, `userId` and a hash object with `questionId`'s as keys and `boolan`'s as values (for correct, wrong answer respectively). Example:
      ```js
       {
          "id": "3d13ee89-f02b-4783-bb0e-c2d441a62b4b", // UUID
          "userName": "Iris", // The user's ID
          "createdAt": 1715003838, // Current timestamp
          "responses": {
            "544db309-40cf-4dd8-8662-c10ed3502a5d": true, // Answered correctly
            "0c09e601-3f13-4d46-8895-6a03fff9d669": true // Answered correctly
            "e1963847-7a09-4a6f-9501-817a6aad0648": false // Answered incorrectly
          }
       }
       ```
  - Authorization: Authenticated users can GET this endpoint only if the referenced game run is owned by them.

## Additional Guidelines:

- **Form Validation:** Use JOI to validate user input, ensuring that submitted answers follow the correct format and are within the index range.
- **Error Handling:** Return meaningful error messages and HTTP status codes for invalid or unauthorized requests.
- **Testing:** Create API tests to ensure all API endpoints work correctly.

# Fixtures / Prepared content and user data

You should use predefined questions and users to implement the quiz API. 

## Questions

The questions are stored as array in the file `data/questions.json` and have the following data structure:

| Property      | Type     | Description                                |
|---------------|----------|--------------------------------------------|
| id            | uuid     | Unique identifier for a question           |
| question      | string   | Actual question text                       |
| options       | string[] | List of possible answer options            |
| correctAnswer | number   | Index of the correct answer in above array |

## Users

The users file (`data/users.json`) contains two users:

| Name | Password |
|------|----------|
| Iris | 123      |
| Max  | 123      |

Use Iris and Max for authentication. The passwords are stored as cryptographic hashes, created with the bcrypt algorithm.
When verifying the password, please pay attention to comparing hashes, not the plain password with the stored hash.

# Tooling

The file `src/tools/json-files` contains the function `read` and `write` to get data from and update data in JSON files.

Usage examples for reading:

    import {read, write} from './tools/json-files.js'

    const questions = read('questions'); 
    for (const {question} of questions){
        console.log(question)
    }

Usage example for writing:

    import {read, write} from './tools/json-files.js'

    const gameRuns = read('game-runs');
    const currentGameRun = // ... find current game run
    const updatedGameRun = {
       ...currentGameRun,
       responses: {
          ...currentGameRun.responses,
          newResponse // The new answer provided by the client
       }
    }

    const mergedGameRuns = // ... Create a new array including the updated game run and all other (untoched) game runs. Prevent duplicate game runs.
    
    write('game-runs', mergedGameRuns)

# References

1. [ExpressJS](https://expressjs.com/)
2. [Joi](https://joi.dev/api/?v=17.13.0)
2. [Passport Http](https://www.passportjs.org/packages/passport-http/)
3. [Passport JWT](https://www.passportjs.org/packages/passport-jwt/)
4. [Jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
5. [Jest Test Runner](https://jestjs.io/)
6. [Supertest](https://github.com/ladjs/supertest)
