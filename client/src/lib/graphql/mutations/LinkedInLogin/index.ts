import { gql } from "@apollo/client";

export const LOG_IN_LINKEDIN = gql`
  mutation LogInLinkedIn($input: LogInInput) {
    logInLinkedIn(input: $input) {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
