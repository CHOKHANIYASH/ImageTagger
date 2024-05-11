const { createHmac } = require("crypto");
const {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminGetUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const { v4: uuidv4 } = require("uuid");
const {
  ScanCommand,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { cognitoClient, dynamodbClient } = require("../aws/clients");
// const { welcomeEmail } = require("./sesControllers");
// Add Users to the database
const addUser = async ({ username, email, firstname = "", lastname = "" }) => {
  console.log("addUser function");
  userId = uuidv4();
  const command = new PutItemCommand({
    TableName: "imageTagger",
    Item: {
      userId: { S: userId },
      username: { S: username },
      email: { S: email },
      firstname: { S: firstname },
      lastname: { S: lastname },
      url: { L: [] },
    },
  });
  const response = await dynamodbClient.send(command);
  console.log(response);
  return {
    message: "User added successfully",
    data: { userId },
  };
};
// User Signup
const signUp = async ({ username, password, email, firstname, lastname }) => {
  try {
    console.log("signUp function");
    console.log(username, password, email, firstname, lastname);
    const existsCommand = new AdminGetUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username,
      email: email,
    });
    const userExists = async () => {
      try {
        return await cognitoClient.send(existsCommand);
      } catch (err) {
        // console.log(err);
        return false;
      }
    };

    const userExist = await userExists();
    if (userExist) {
      return {
        status: 400,
        success: false,
        message: "User already exists",
        data: {},
      };
    }
    // console.log("User does not exist");
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
    const user = await cognitoClient.send(command);
    if (!user) {
      throw new Error("User not created");
    }
    const passwordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username,
      Password: password,
      Permanent: true,
    });
    const passwordResponse = await cognitoClient.send(passwordCommand);
    const userId = await addUser({ username, email, firstname, lastname });
    return {
      status: 201,
      success: true,
      message: "User created successfully",
      data: {
        userId,
      },
    };
  } catch (err) {
    // cleaning code if any error occurs during user creation to avoid any inconsistency to be added
    throw err;
  }
};
// User Login
const login = async ({ username, password }) => {
  try {
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
    const response = await cognitoClient.send(command);
    return {
      status: 200,
      success: true,
      message: "User logged in successfully",
      data: {
        Authentication: response.AuthenticationResult,
      },
    };
  } catch (err) {
    console.log("Error in login function", err);
    return {
      status: 401,
      success: false,
      message: err.message,
      data: {},
    };
  }
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
  try {
    const command = new GetItemCommand({
      TableName: "imageTagger",
      Key: marshall({ userId }),
    });
    const response = await dynamodbClient.send(command);
    if (!response.Item) {
      return {
        success: false,
        message: "User not found",
        data: {},
      };
    }
    const user = unmarshall(response.Item);
    return {
      success: true,
      message: "User found",
      data: { user },
    };
  } catch (err) {
    throw err;
  }
};

const addImageUrl = async ({ userId, imageUrl }) => {
  const command = new UpdateItemCommand({
    TableName: "imageTagger",
    Key: marshall({ userId }),
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
module.exports = {
  signUp,
  login,
  getUser,
  getAllUsers,
  addImageUrl,
};
