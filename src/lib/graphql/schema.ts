import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    auth0Id: String!
    email: String!
    name: String
    role: UserRole!
    createdAt: String!
    updatedAt: String!
    clockRecords: [ClockRecord!]!
  }

  type Organization {
    id: ID!
    name: String!
    latitude: Float!
    longitude: Float!
    locationName: String
    radius: Float!
    createdAt: String!
    updatedAt: String!
    clockRecords: [ClockRecord!]!
  }

  type ClockRecord {
    id: ID!
    userId: String!
    organizationId: String!
    type: ClockType!
    timestamp: String!
    latitude: Float
    longitude: Float
    locationName: String
    note: String
    createdAt: String!
    updatedAt: String!
    user: User!
    organization: Organization!
  }

  type DashboardStats {
    avgHoursPerDay: Float!
    dailyClockIns: Int!
    totalHoursThisWeek: Float!
  }

  type UserStats {
    userId: String!
    userName: String!
    totalHours: Float!
  }

  enum UserRole {
    MANAGER
    CARE_WORKER
  }

  enum ClockType {
    CLOCK_IN
    CLOCK_OUT
  }

  input ClockInput {
    type: ClockType!
    latitude: Float
    longitude: Float
    locationName: String
    note: String
    organizationId: String!
  }

  input OrganizationInput {
    name: String!
    latitude: Float!
    longitude: Float!
    locationName: String
    radius: Float!
  }

  type Query {
    me: User
    organization: Organization
    clockedInUsers: [User!]!
    userClockHistory(userId: String!): [ClockRecord!]!
    allClockHistory: [ClockRecord!]!
    dashboardStats: DashboardStats!
    weeklyUserStats: [UserStats!]!
    isWithinPerimeter(latitude: Float!, longitude: Float!): Boolean!
  }

  type Mutation {
    createOrUpdateUser(email: String!, name: String, role: UserRole): User!
    clockInOut(input: ClockInput!): ClockRecord!
    updateOrganization(input: OrganizationInput!): Organization!
  }
`;
