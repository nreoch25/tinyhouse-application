/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogInInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: LogInLinkedIn
// ====================================================

export interface LogInLinkedIn_logInLinkedIn {
  __typename: "Viewer";
  id: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}

export interface LogInLinkedIn {
  logInLinkedIn: LogInLinkedIn_logInLinkedIn;
}

export interface LogInLinkedInVariables {
  input?: LogInInput | null;
}
