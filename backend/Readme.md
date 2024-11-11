# API Documentation

## Table of Contents

- [User API](#user-api)
  - [Sign Up User](#sign-up-user)
  - [User Login](#user-login)
  - [Get Access Token](#get-access-token)
  - [Get User By ID](#get-user-by-id)
  - [Get User Image URLs](#get-user-image-urls)
- [Image & Label API](#image--label-api)
  - [Detect Labels](#detect-labels)
  - [Upload Image](#upload-image)

---

Integrate these APIs with a frontend application to manage user accounts, upload images, and retrieve image labels, history seamlessly and efficiently.

---

## User API

### Base URL: `/users`

### Endpoints

#### 1. Sign Up User

- **URL:** `/signup`
- **Method:** `POST`
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string",
    "firstname": "string",
    "lastname": "string"
  }
  ```
- **Response:**
  - **Status Code:** 201 (Created) or relevant status based on response.
  - **Body:** Response message with user details or error.

#### 2. User Login

- **URL:** `/login`
- **Method:** `POST`
- **Description:** Authenticates a user and initiates a session.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  - **Status Code:** 200 (Success) or relevant status based on response.
  - **Body:** Response with login details or error.

#### 3. Get Access Token

- **URL:** `/accesstoken`
- **Method:** `POST`
- **Description:** Generates a new access token using a refresh token.
- **Request Body:**
  ```json
  {
    "username": "string",
    "refreshToken": "string"
  }
  ```
- **Response:**
  - **Status Code:** Relevant status based on response.
  - **Body:** New access token or error.

#### 4. Get User By ID

- **URL:** `/:userId`
- **Method:** `GET`
- **Description:** Retrieves details of a specific user by their user ID.
- **Headers:**
  - `Authorization`: Bearer `<access_token>`
- **Response:**
  - **Status Code:** Relevant status based on response.
  - **Body:** User details or error.

#### 5. Get User Image URLs

- **URL:** `/:userId/imageurls`
- **Method:** `GET`
- **Description:** Retrieves URLs of images uploaded by a specific user.
- **Headers:**
  - `Authorization`: Bearer `<access_token>`
- **Response:**
  - **Status Code:** Relevant status based on response.
  - **Body:** List of image URLs or error.

---

## Image & Label API

### Base URL: `/images`

### Endpoints

#### 1. Detect Labels

- **URL:** `/labels/:image`
- **Method:** `GET`
- **Description:** Detects labels for the specified image using AWS Rekognition.
- **Path Parameters:**
  - `image`: The image identifier.
- **Response:**
  - **Status Code:** Relevant status based on response.
  - **Body:** Detected labels or error.

#### 2. Upload Image

- **URL:** `/upload/:userId`
- **Method:** `POST`
- **Description:** Uploads an image to S3 and stores the image URL in the user profile.
- **Path Parameters:**
  - `userId`: The user identifier.
- **Headers:**
  - `Authorization`: Bearer `<access_token>`
- **Request Files:**
  - **Key:** `images` - Array of images to upload
- **Response:**
  - **Status Code:** Relevant status based on response.
  - **Body:** Upload status and URL of the uploaded image.

---

**Note:** For routes that require an access token, it must be provided in the `Authorization` header in the format `Bearer <access_token>`.
