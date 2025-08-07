import type { NextApiRequest } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@auth0/nextjs-auth0';

const prisma = new PrismaClient();

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: { req: NextApiRequest }) => {
      const session = await getSession({ req: context.req });

      if (!session?.user) return null;

      return await prisma.user.findUnique({
        where: { auth0Id: session.user.sub },
        include: { clockRecords: true }
      });
    },

    organization: async () => {
      let org = await prisma.organization.findFirst({
        include: { clockRecords: true }
      });
      
      // Create default organization if none exists
      if (!org) {
        org = await prisma.organization.create({
          data: {
            id: 'default',
            name: 'Healthcare Organization',
            latitude: 0,
            longitude: 0,
            radius: 2000 // 2km default radius
          },
          include: { clockRecords: true }
        });
      }
      
      return org;
    },

    clockedInUsers: async () => {
  // Get users who have clocked in but not clocked out
  const clockedInRecords = await prisma.clockRecord.findMany({
    where: {
      type: 'CLOCK_IN'
    },
    orderBy: { timestamp: 'desc' },
    include: { user: true }
  });

  const clockedOutRecords = await prisma.clockRecord.findMany({
    where: {
      type: 'CLOCK_OUT'
    },
    orderBy: { timestamp: 'desc' },
    include: { user: true }
  });

  const clockedInUsers: any[] = [];
  const clockedOutUserIds = new Set(clockedOutRecords.map(record => record.userId));

  for (const record of clockedInRecords) {
    if (!clockedOutUserIds.has(record.userId)) {
      // Check if this user has clocked out after this clock in
      const laterClockOut = await prisma.clockRecord.findFirst({
        where: {
          userId: record.userId,
          type: 'CLOCK_OUT',
          timestamp: { gt: record.timestamp }
        }
      });

      if (!laterClockOut) {
        clockedInUsers.push(record.user);
      }
    }
  }

  // Serialize createdAt and updatedAt for each user
  return clockedInUsers.map(user => ({
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
  }));
},


    userClockHistory: async (_: any, { userId }: { userId: string }) => {
      const records = await prisma.clockRecord.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        include: { user: true, organization: true }
      });
      return records.map(record => ({
        ...record,
        timestamp: record.timestamp instanceof Date ? record.timestamp.toISOString() : record.timestamp,
        createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : record.createdAt,
        updatedAt: record.updatedAt instanceof Date ? record.updatedAt.toISOString() : record.updatedAt,
      }));
    },

    allClockHistory: async () => {
  const records = await prisma.clockRecord.findMany({
    orderBy: { timestamp: 'desc' },
    include: { user: true, organization: true }
  });
  return records.map(record => ({
    ...record,
    timestamp: record.timestamp instanceof Date ? record.timestamp.toISOString() : record.timestamp,
    createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : record.createdAt,
    updatedAt: record.updatedAt instanceof Date ? record.updatedAt.toISOString() : record.updatedAt,
  }));
},

    dashboardStats: async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get all clock records from the past week
      const weeklyRecords = await prisma.clockRecord.findMany({
        where: {
          timestamp: { gte: weekAgo }
        },
        orderBy: { timestamp: 'asc' }
      });

      // Calculate average hours per day
      const dailyHours: { [key: string]: number } = {};
      const userSessions: { [key: string]: { clockIn?: Date, totalHours: number } } = {};

      for (const record of weeklyRecords) {
        const dateKey = record.timestamp.toISOString().split('T')[0];
        
        if (record.type === 'CLOCK_IN') {
          if (!userSessions[record.userId]) {
            userSessions[record.userId] = { totalHours: 0 };
          }
          userSessions[record.userId].clockIn = record.timestamp;
        } else if (record.type === 'CLOCK_OUT' && userSessions[record.userId]?.clockIn) {
          const hours = (record.timestamp.getTime() - userSessions[record.userId].clockIn!.getTime()) / (1000 * 60 * 60);
          userSessions[record.userId].totalHours += hours;
          
          if (!dailyHours[dateKey]) dailyHours[dateKey] = 0;
          dailyHours[dateKey] += hours;
          
          delete userSessions[record.userId].clockIn;
        }
      }

      const avgHoursPerDay = Object.values(dailyHours).reduce((sum, hours) => sum + hours, 0) / Math.max(Object.keys(dailyHours).length, 1);

      // Count daily clock-ins (today)
      const dailyClockIns = await prisma.clockRecord.count({
        where: {
          type: 'CLOCK_IN',
          timestamp: { gte: dayAgo }
        }
      });

      // Calculate total hours this week
      const totalHoursThisWeek = Object.values(userSessions).reduce((sum, session) => sum + session.totalHours, 0);

      return {
        avgHoursPerDay,
        dailyClockIns,
        totalHoursThisWeek
      };
    },

    weeklyUserStats: async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const users = await prisma.user.findMany({
        include: {
          clockRecords: {
            where: {
              timestamp: { gte: weekAgo }
            },
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      return users.map(user => {
        let totalHours = 0;
        let clockInTime: Date | null = null;

        for (const record of user.clockRecords) {
          if (record.type === 'CLOCK_IN') {
            clockInTime = record.timestamp;
          } else if (record.type === 'CLOCK_OUT' && clockInTime) {
            totalHours += (record.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
            clockInTime = null;
          }
        }

        return {
          userId: user.id,
          userName: user.name || user.email,
          totalHours
        };
      });
    },

    isWithinPerimeter: async (_: any, { latitude, longitude }: { latitude: number, longitude: number }) => {
      const organization = await prisma.organization.findFirst();
      if (!organization) return false;

      const distance = calculateDistance(latitude, longitude, organization.latitude, organization.longitude);
      return distance <= organization.radius;
    },
  },

  Mutation: {
    createOrUpdateUser: async (_: any, { email, name, role }: any, context: any) => {
      const session = await getSession(context.req);
      if (!session?.user) throw new Error('Not authenticated');

      return await prisma.user.upsert({
        where: { auth0Id: session.user.sub },
        update: { name, role },
        create: {
          auth0Id: session.user.sub,
          email,
          name,
          role: role || 'CARE_WORKER'
        }
      });
    },

    clockInOut: async (_: any, { input }: any, context: any) => {
      const session = await getSession(context.req);
      if (!session?.user) throw new Error('Not authenticated');

      let user = await prisma.user.findUnique({
        where: { auth0Id: session.user.sub }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            auth0Id: session.user.sub,
            email: session.user.email,
            name: session.user.name,
            role: 'CARE_WORKER'
          }
        });
      }

      // Check if user is within perimeter for clock in
      if (input.type === 'CLOCK_IN' && input.latitude && input.longitude) {
        const organization = await prisma.organization.findUnique({
          where: { id: input.organizationId }
        });

        if (organization) {
          const distance = calculateDistance(
            input.latitude,
            input.longitude,
            organization.latitude,
            organization.longitude
          );

          if (distance > organization.radius) {
            throw new Error('You are outside the allowed perimeter for clocking in');
          }
        }
      }

      return await prisma.clockRecord.create({
        data: {
          userId: user.id,
          organizationId: input.organizationId,
          type: input.type,
          latitude: input.latitude,
          longitude: input.longitude,
          note: input.note
        },
        include: { user: true, organization: true }
      });
    },

    updateOrganization: async (_: any, { input }: any, context: any) => {
      // For manager dashboard, we'll allow updates without Auth0 session
      // In production, you should add proper manager authentication
      
      return await prisma.organization.upsert({
        where: { id: 'default' },
        update: input,
        create: { id: 'default', ...input }
      });
    }
  }
};
