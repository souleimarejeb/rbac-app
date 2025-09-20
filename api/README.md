# RBAC Backend

This is the **backend service** for the Role-Based Access Control (RBAC) application.  
It provides authentication, user management, and role/permission-based authorization.  

## Features

- Authentication (using Auth0 or custom JWT-based auth)
- Guards for role-based route protection and endpoint security

## Authentication 

The process of identifying users and validating who they claim to be.

If the user matches the password credentials, it means the identity is valid, and the system grants access to that user.
This entire phase is usually done __before authorization__.

## Quick head up 

Clients will start by autheticating with a username and password. Once authenticated, the server will issue a JWT that can be sent as a __Bearer Token__ in an authorization header on subsequent requests to prove authentication.

we'll also create a protected route that is accessible onlyto requests that contain a valid JWT.

## Getting Started 

### Step 1 

### Creating an authentication module 

we'll generate an AuthModule and in it , AuthService , AuthContrller 

- AuthService : holds the business logic 
- AuthController: exposes the auth endpoints 


I have folder modules where all my modules will be 

run the following  command 

``` shell
nest generate module modules/auth
```

then 

``` shell

nest generate service modules/auth

```

finally 

``` shell

nest generate controller modules/auth

```

we already implemented the user module with crud operations so now we will move to the next step 








