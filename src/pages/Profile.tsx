
import React from 'react';
import Layout from '@/components/Layout';
import ProfileEditor from '@/components/ProfileEditor';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserProfile } from '@/data/types';

const Profile: React.FC = () => {
  const [profile] = useLocalStorage<UserProfile | null>('user-profile', null);
  
  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Your Profile</h1>
        <p className="text-muted-foreground mb-6">
          Manage your personal information and account settings
        </p>
        <ProfileEditor />
      </div>
    </Layout>
  );
};

export default Profile;
