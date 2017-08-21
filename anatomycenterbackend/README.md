# Routes : 

All `GET /something`, `PUT /something` and `DELETE /something` routes must accept filters. This way, you can read/update/delete ALL or a subset, or just one of the entries.

## Users
| Method        | Url           | Goal  |
| ------------- |:-------------| -----:|
| POST | /users | Register a new User |
| GET | /users | Get a user |
| PUT | /users | Update a user |
| DELETE | /users | Delete a user |
| POST | /users/login | Login |
| POST | /users/logout | Logout |
