
import React from 'react';
import Layout from '@/components/Layout';
import ProfileEditor from '@/components/ProfileEditor';

const Profile: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Your Profile</h1>
        <ProfileEditor />
      </div>
    </Layout>
  );
};

export default Profile;
