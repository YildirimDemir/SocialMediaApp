import React from 'react'
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import UserSettings from '@/components/UserSettings/UserSettings';

export default async function page() {
  const session = await getServerSession();

  if(!session){
    redirect('/login')
  }
  return (
    <UserSettings />
  )
}