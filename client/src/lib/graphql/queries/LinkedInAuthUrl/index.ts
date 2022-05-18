import { gql } from "@apollo/client";

export const LINKEDIN_AUTH_URL = gql`
  query LinkedInAuthUrl {
    linkedInAuthUrl
  }
`;
