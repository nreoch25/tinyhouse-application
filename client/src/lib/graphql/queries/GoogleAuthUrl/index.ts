import { gql } from "@apollo/client";

export const GOOGLE_AUTH_URL = gql`
  query GoogleAuthUrl {
    googleAuthUrl
  }
`;
