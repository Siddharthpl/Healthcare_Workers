import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      role
      clockRecords {
        id
        type
        timestamp
        note
      }
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query GetOrganization {
    organization {
      id
      name
      latitude
      longitude
      radius
    }
  }
`;

export const GET_CLOCKED_IN_USERS = gql`
  query GetClockedInUsers {
    clockedInUsers {
      id
      email
      name
      role
    }
  }
`;

export const GET_USER_CLOCK_HISTORY = gql`
  query GetUserClockHistory($userId: String!) {
    userClockHistory(userId: $userId) {
      id
      type
      timestamp
      latitude
      longitude
      note
      user {
        id
        name
        email
      }
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      avgHoursPerDay
      dailyClockIns
      totalHoursThisWeek
    }
  }
`;

export const GET_WEEKLY_USER_STATS = gql`
  query GetWeeklyUserStats {
    weeklyUserStats {
      userId
      userName
      totalHours
    }
  }
`;

export const GET_ALL_CLOCK_HISTORY = gql`
  query GetAllClockHistory {
    allClockHistory {
      id
      type
      timestamp
      latitude
      longitude
      note
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const IS_WITHIN_PERIMETER = gql`
  query IsWithinPerimeter($latitude: Float!, $longitude: Float!) {
    isWithinPerimeter(latitude: $latitude, longitude: $longitude)
  }
`;

export const CLOCK_IN_OUT = gql`
  mutation ClockInOut($input: ClockInput!) {
    clockInOut(input: $input) {
      id
      type
      timestamp
      latitude
      longitude
      note
      user {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_OR_UPDATE_USER = gql`
  mutation CreateOrUpdateUser($email: String!, $name: String, $role: UserRole) {
    createOrUpdateUser(email: $email, name: $name, role: $role) {
      id
      email
      name
      role
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: OrganizationInput!) {
    updateOrganization(input: $input) {
      id
      name
      latitude
      longitude
      radius
    }
  }
`;
