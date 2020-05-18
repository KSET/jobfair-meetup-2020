import {
  createObject,
} from "./helpers";

import {
  loginData,
  tokenData,
} from "./data";

export const loginMutation = ({ email, password }) => {
  const operationName = "DoLogin";
  // language=GraphQL
  const query = `
    mutation DoLogin($email: String, $password: String) {
      login(
        input: {
          email: $email
          password: $password
        }
      ) {
        ${ createObject(loginData) }
      }
    }
  `;
  const variables = { email, password };

  return {
    operationName,
    query,
    variables,
  };
};

export const refreshTokenMutation = ({ token, refreshToken }) => {
  const operationName = "RefreshToken";
  // language=GraphQL
  const query = `
    mutation RefreshToken($token: String, $refreshToken: String) {
      refresh_token(
        input: {
          token: $token
          refresh_token: $refreshToken
        }
      ) {
        ${ createObject(tokenData) }
      }
    }
  `;
  const variables = { token, refreshToken };

  return {
    operationName,
    query,
    variables,
  };
};
