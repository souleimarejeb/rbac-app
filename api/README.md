# RBAC Backend

This is the **backend service** for the Role-Based Access Control (RBAC) application.  
It provides authentication, user management, and role/permission-based authorization.

## Features

- Authentication (using Auth0 or custom JWT-based auth)
- Guards for role-based route protection and endpoint security

--- 

## Authentication 

Authentication is the process of identifying users and verifying that they are who they claim to be.  

If the provided credentials (e.g., username and password) match the records in the database, the identity is considered valid, and the system grants access to the user.  

> Note: Authentication is always performed **before authorization**.

--- 

## Quick Overview 

Clients start by authenticating with a username and password. Once authenticated, the server issues a JWT that can be sent as a **Bearer Token** in the `Authorization` header on subsequent requests.  

We will also create a protected route that is accessible **only** to requests containing a valid JWT.

--- 

## Getting Started

### Step 1: Install JWT Dependencies

Install the `@nestjs/jwt` package to handle JWT generation and validation:

```bash
npm install --save @nestjs/jwt
```
---

### Step 2: Create Authentication Module 

Generate the AuthModule along with AuthService and AuthController:

- AuthService – contains authentication business logic 
- AuthController – exposes authentication endpoints



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

Since AuthService will use UserService, we need to export UserService from UserModule:


```ts 
@Module({
    imports: [
    TypeOrmModule.forFeature([UserEntity])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService] // here 
})
export class UserModule {}

``` 

Then import UserModule into AuthModule:


```ts
@Module({
  imports: [
    UserModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
```

### Step 3: Implement Sign-In Endpoint

In AuthService, verify the user credentials and generate a JWT:

```ts
@Injectable()
export class AuthService {
     constructor(
        private usersService: UserService, 
        private jwtService: JwtService
    ) {}

    async signIn(username: string, pass: string):  Promise<{ access_token: string }>{

    const user = await this.usersService.findOne(username);

    if (user?.password!== pass) {
      throw new UnauthorizedException();
    }
     const payload = { sub: user.name, username: user.username };
     // return the generated tokenAcess 
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
```

### Step 4: Configure JWT Secret

The secret key is used to sign and verify tokens. Store it securely in a .env file:

``` env
JWT_SECRET='DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.'
```
#### 🔒 Generating a Strong Secret Key
Example of generating a secure key in PowerShell:

```  shell 
[convert]::ToBase64String((1..64 | % {Get-Random -Maximum 256}))
```

Important: Never commit your real secret key to version control. Use environment variables for production.



#### ⚡ Integration in AuthModule

After generating your secret:

Import the JWT dependency in your AuthModule.

Configure the JwtModule using the secret from your .env or constants.ts.

This ensures that the same key is used consistently for signing and verifying JWTs.

let's update the AuthMdoule : 

```ts 
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { UserModule } from '../user/user.module';
import { ConfigService } from '@nestjs/config';

@Module({
   imports: [
    UserModule,
    JwtModule.registerAsync({
      global: true,
      inject:[ConfigService],
      useFactory:(config:ConfigService)=>({
        secret: config.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '60s' },
      }),
      
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}

```

we move on the AuthController .
Add the login endpoint to handle authentication requests:

```ts 

  constructor(private authService: AuthService) { } // inject our AuthService

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiBody({})
    signIn(@Body() signInDto: Record<string, any>) {
        return this.authService.signIn(signInDto.username, signInDto.password);
    }

```

--- 

### Step 6: Implement AuthGuard

Create a guard to protect routes that require JWT authentication: 
run the following commands : 

```shell
mkdir src/common/guard
```

```shell
touch src/common/guard/auth.guard.ts
```
add this code : 
``` ts 
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/modules/auth/constants';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/SetMetadata.decorator';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private configService:ConfigService

  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET')
        }
      );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

--- 

### Step 7: Create Public Route Decorator
Some routes (like login) need to bypass the global guard. Create a custom decorator:

run the following commands : 

```shell
mkdir src/common/decorators
```

```shell
touch src/common/decorators/SetMetaData.decorator.ts
```

now in that file put this code : 
```ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Explanation:

- SetMetadata : attaches metadata to the route or controller..

- IS_PUBLIC_KEY :identifies public routes.

- Public() : allows AuthGuard to skip authentication.

- The global JwtAuthGuard can check for this metadata and skip authentication if the route is public.

Now we need to update our authgaurd 

```ts 

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/modules/auth/constants';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/SetMetadata.decorator';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService:ConfigService

  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET')
        }
      );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```
NestJS provides a __Reflector__ class to read metadata attached to routes or controllers.

##### Explanation:

this.reflector.getAllAndOverride

- Reads the metadata with key IS_PUBLIC_KEY (set by the @Public() decorator).

- It checks first on the route handler, then on the controller class, allowing flexible application.

- Returns true if the route or controller is marked as public, otherwise undefined or false.
``` ts 
context.getHandler()
```

- Refers to the current route handler (the method being executed).
``` ts 
context.getClass()
```
Refers to the controller class containing the handler.

Condition check
``` ts 
if (isPublic) return true;
```
If the route is public, the guard bypasses authentication by returning true.
Otherwise, the guard continues with standard JWT validation.

---  

### Step 8: Global Guard Registration

In order to implement this auth Guard there is two method 

1. impelement it in AuthController 
2. impelemnt it Globally 

--- 

we 'll explore both methods

in your AuthController 

```ts 
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Public } from 'src/common/decorators/SetMetadata.decorator';

@ApiTags('AUTH MGMT')
@Controller({ version: '1', path: 'auth' })
export class AuthController {

    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiBody({})
    signIn(@Body() signInDto: Record<string, any>) {
        return this.authService.signIn(signInDto.username, signInDto.password);
    }
// here it is 
    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

}

```
---

Globally in app.module.ts

```ts 
 providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
```


Then mark public routes with @Public() to bypass the guard.

--- 


#### 1️⃣ JWT Structure Overview

A JWT has three parts separated by dots (.):

``` css
header.payload.signature
```

1. Header – describes the token type and signing algorithm. Example:

``` json 
{
  "alg": "HS256", // HMAC using SHA-256
  "typ": "JWT"
}
```

2. Payload – the data you include, like:

``` json 
{
 "sub": "123", 
 "username": "Mohsen2"
}
```

3. Signature – this is what proves the token is authentic:

``` ini
signature = HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```
✅ The secret key is used only here, in the signature step.

#### 2️⃣ When does the secret key get used?

When you call:

``` ts 
await this.jwtService.signAsync(payload);
``` 

The JwtService automatically:

- Takes the payload.

- Creates a header (alg: HS256 by default).

- Encodes header + payload.

- Uses the secret key and the algorithm to generate the signature.

- Joins the three parts with dots → this is your final JWT.

So the secret key is never in the payload or header, it’s only used for signing.

#### 3️⃣ What about the algorithm?

- By default, @nestjs/jwt uses HS256 (HMAC SHA-256) if you don’t specify algorithm.

- You can override it in JwtModule.register() or signAsync() options:

``` ts 
this.jwtService.signAsync(payload, { algorithm: 'HS512' });
```

The algorithm is stored in the header of the JWT so that anyone verifying knows how it was signed.

#### 4️⃣ Flow overview

1. Server gets user info → payload = { sub: user.id, username: user.username }

2. Server calls signAsync(payload), passing the secret key from .env (or constants).

3. JwtService generates the JWT string (header.payload.signature) using HS256 + secret.

4. Client receives token → stores and sends it back on future requests.

5. Server verifies token using the same secret key to ensure the signature is valid.


### Testing 



Test the API using Postman, Insomnia, or Swagger.

Swagger is available at:

``` bash
http://localhost:3000/api 

```

Example request body:

```json
body :
{
  "username":"Mohsen2",
  "password":"changeme"
}
```
--- 

Protected Route Request:

``` htttp 
GET /v1/auth/profile
Authorization: Bearer <your-jwt-token>

```

--- 

## Summary

-All routes are protected by default using the global AuthGuard.

-Public routes (login, signup) use the @Public() decorator.

-JWTs are used for stateless authentication.

-Secret keys must be stored securely (preferably in .env).