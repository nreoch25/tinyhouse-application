import { gql } from "@apollo/client";

export const LOG_IN_GOOGLE = gql`
  mutation LogInGoogle($input: LogInInput) {
    logInGoogle(input: $input) {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
