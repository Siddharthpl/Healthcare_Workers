'use client';

'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useQuery } from '@apollo/client';
import { Layout, Spin } from 'antd';
import { useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { GET_ME, GET_ORGANIZATION } from '@/lib/graphql/queries';
import LoginPage from '@/components/LoginPage';
import CareWorkerDashboard from '@/components/CareWorkerDashboard';
import ManagerDashboard from '@/components/ManagerDashboard';
import Navigation from '@/components/Navigation';

const { Content } = Layout;

export default function Home() {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const { state, actions } = useAppContext();
  
  const { data: userData, loading: userLoading } = useQuery(GET_ME, {
    skip: !auth0User,
  });
  
  const { data: orgData, loading: orgLoading } = useQuery(GET_ORGANIZATION, {
    skip: !auth0User,
  });

  useEffect(() => {
    if (userData?.me) {
      actions.setUser(userData.me);
    }
  }, [userData, actions]);

  useEffect(() => {
    if (orgData?.organization) {
      actions.setOrganization(orgData.organization);
    }
  }, [orgData, actions]);

  if (auth0Loading || userLoading || orgLoading) {
    return (
      <div className="app-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!auth0User) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Layout>
        <Navigation />
        <Content className="main-content">
          {state.user?.role === 'MANAGER' ? (
            <ManagerDashboard />
          ) : (
            <CareWorkerDashboard />
          )}
        </Content>
      </Layout>
    </div>
  );
}
