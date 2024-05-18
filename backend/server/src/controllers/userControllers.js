const { createHmac } = require("crypto");
const {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminGetUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const util = require("util");
const { v4: uuidv4 } = require("uuid");
const {
  ScanCommand,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { cognitoClient, dynamodbClient } = require("../aws/clients");
const { response } = require("express");
const { AppError } = require("../middleware/middlewares");
const { access } = require("fs");
// const { welcomeEmail } = require("./sesControllers");
// Add Users to the database
const addUser = async ({
  username,
  email,
  firstname = "",
  lastname = "",
  userId,
}) => {
  console.log("addUser function");
  // console.log(username, email, firstname, lastname, userId);
  const command = new PutItemCommand({
    TableName: "imageTagger",
    Item: {
      userId: { S: userId },
      username: { S: username },
      email: { S: email },
      firstname: { S: firstname },
      lastname: { S: lastname },
      imageUrl: { L: [] },
    },
  });
  const response = await dynamodbClient.send(command);
  // console.log(response);
  return {
    message: "User added successfully",
    data: { userId },
  };
};
const checkPasswordPolicy = (password) => {
  return true;
};
// User Signup
const signUp = async ({ username, password, email, firstname, lastname }) => {
  // try {
  console.log("signUp function");
  const validPassword = checkPasswordPolicy(password);
  if (!validPassword) {
    throw new AppError("Password does not meet the policy", 400);
  }
  // console.log(username, password, email, firstname, lastname);
  const command = new AdminCreateUserCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: username,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "email_verified",
        Value: "true",
      },
    ],
    MessageAction: "SUPPRESS",
  });

  const user = await cognitoClient.send(command).catch((err) => {
    throw new AppError(err.message, 400);
  });
  // console.log(util.inspect(user, false, null, true /* enable colors */));
  const userId = user.User.Attributes[2].Value;
  // console.log(userId);
  if (!user) {
    throw new Error("User not created");
  }
  const passwordCommand = new AdminSetUserPasswordCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: username,
    Password: password,
    Permanent: true,
  });
  const passwordResponse = await cognitoClient
    .send(passwordCommand)
    .catch((err) => {
      throw new AppError(err.message, 400);
    });
  await addUser({ username, email, firstname, lastname, userId });
  return {
    status: 201,
    response: {
      success: true,
      message: "User created successfully",
      data: {
        userId,
      },
    },
  };
  // } catch (err) {
  //   throw new AppError("User not created", 400);
  //   console.log(err);
  // }
};
// User Login
const login = async ({ username, password }) => {
  const user_pool_id = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
  const clientSecret = process.env.COGNITO_USER_POOL_CLIENT_SECRET;
  const secretHash = await generateSecretHash({
    username,
    clientId,
    clientSecret,
  });
  // console.log("secretHash",secretHash);
  const command = new AdminInitiateAuthCommand({
    AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
    UserPoolId: user_pool_id,
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash,
    },
  });
  const response = await cognitoClient.send(command).catch((err) => {
    throw new AppError(err.message, 401);
  });
  return {
    status: 200,
    success: true,
    message: "User logged in successfully",
    data: {
      Authentication: response.AuthenticationResult,
    },
  };
};

// Generate Secret Hash
const generateSecretHash = ({ username, clientId, clientSecret }) => {
  // console.log("generateSecretHash function");
  // console.log(username,clientId,clientSecret);
  const str = username + clientId;
  const secret = createHmac("sha256", clientSecret);
  secret.update(str);
  return secret.digest("base64");
};
//Generate a secret hash ends
// Getting List of all Users
const getAllUsers = async () => {
  try {
    const command = new ScanCommand({
      TableName: "imageTagger",
    });
    const response = await dynamodbClient.send(command);
    const Items = response.Items;
    Items.forEach((item) => {
      item.username = item.username.S;
      item.userId = item.userId.S;
    });
    return { success: true, message: "All users list", data: { users: Items } };
  } catch (err) {
    throw err;
  }
};
// get user details
const getUser = async ({ userId }) => {
  const key = marshall({ userId });
  const command = new GetItemCommand({
    TableName: "imageTagger",
    Key: key,
  });
  const response = await dynamodbClient.send(command);
  if (!response.Item) {
    throw new AppError("User not found", 404);
  }
  const user = unmarshall(response.Item);
  return {
    status: 200,
    response: {
      success: true,
      message: "User found",
      data: { user },
    },
  };
};
const getUserImageUrls = async ({ userId }) => {
  const key = marshall({ userId });
  const command = new GetItemCommand({
    TableName: "imageTagger",
    Key: key,
  });
  const response = await dynamodbClient.send(command);
  if (!response.Item) {
    throw new AppError("User not found", 404);
  }
  const user = unmarshall(response.Item);
  return {
    status: 200,
    response: {
      success: true,
      message: "User found",
      data: { imageUrls: user.imageUrl },
    },
  };
};

const addImageUrl = async ({ userId, imageUrl }) => {
  const key = marshall({ userId });
  const command = new UpdateItemCommand({
    TableName: "imageTagger",
    Key: key,
    UpdateExpression: "SET imageUrl = list_append(imageUrl,:imageUrl)",
    ExpressionAttributeValues: {
      ":imageUrl": { L: [{ S: `${imageUrl}` }] },
    },
  });
  const response = await dynamodbClient.send(command);
  // console.log(response);
  return {
    status: 200,
    response: {
      success: true,
      message: "Image added successfully",
      data: { imageUrl },
    },
  };
};

const getAccessToken = async ({ refreshToken, username }) => {
  const user_pool_id = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
  const clientSecret = process.env.COGNITO_USER_POOL_CLIENT_SECRET;
  const secretHash = generateSecretHash({
    username,
    clientId,
    clientSecret,
  });
  console.log("secretHash", secretHash);
  const command = new AdminInitiateAuthCommand({
    AuthFlow: "REFRESH_TOKEN_AUTH",
    UserPoolId: user_pool_id,
    ClientId: clientId,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
      SECRET_HASH: secretHash,
    },
  });
  const response = await cognitoClient.send(command).catch((err) => {
    throw new AppError(err.message, 401);
  });
  return {
    status: 200,
    response: {
      success: true,
      message: "Access Token Generated Successfully",
      data: {
        AccessToken: response.AuthenticationResult.AccessToken,
      },
    },
  };
};

module.exports = {
  signUp,
  login,
  getUser,
  getUserImageUrls,
  getAllUsers,
  addImageUrl,
  getAccessToken,
};
