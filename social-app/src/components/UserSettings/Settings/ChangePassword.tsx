'use client';

import React, { useState } from 'react';
import Style from '../usersettings.module.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { requestUser, updateUserPassword } from '@/services/apiUsers';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { IUser } from '@/models/userModel';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface FormValues {
  passwordCurrent: string;
  newPassword: string;
  passwordConfirm: string;
}

export default function ChangePassword() {
  const { data: session } = useSession();

  const { isLoading, data: user, error } = useQuery<IUser | undefined, Error>({
    queryKey: ['request-user', session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) {
        throw new Error('No email found in session');
      }
      return await requestUser(session.user.email);
    },
    initialData: session?.user as IUser | undefined,
  });

  const [showPassword, setShowPassword] = useState({
    passwordCurrent: false,
    newPassword: false,
    passwordConfirm: false,
  });

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const mutation = useMutation({
    mutationFn: updateUserPassword,
    onError: (err: any) => toast.error(err.message),
    onSuccess: () => {
      toast.success('Password updated successfully!');
      reset();
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();

  const dataSubmit: SubmitHandler<FormValues> = (data) => {
    if (!user?._id) {
      toast.error('User ID is missing');
      return;
    }

    mutation.mutate({ ...data, userId: user._id });
  };

  return (
    <div className={Style.passwordArea}>
      <h1>Change Password</h1>
      <form onSubmit={handleSubmit(dataSubmit)}>
        <div className={Style.inputBox}>
          <label htmlFor="passwordCurrent">Current Password</label>
          <div className={Style.passInput}>
            <input
              type={showPassword.passwordCurrent ? 'text' : 'password'}
              id="passwordCurrent"
              placeholder="Type your current password here..."
              {...register('passwordCurrent', { required: 'Current password is required' })}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('passwordCurrent')}
              className={Style.toggleButton}
            >
              {showPassword.passwordCurrent ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.passwordCurrent && <p>{errors.passwordCurrent.message}</p>}
        </div>

        <div className={Style.inputBox}>
          <label htmlFor="newPassword">New Password</label>
          <div className={Style.passInput}>
            <input
              type={showPassword.newPassword ? 'text' : 'password'}
              id="newPassword"
              placeholder="Type your new password here..."
              {...register('newPassword', { required: 'New password is required' })}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('newPassword')}
              className={Style.toggleButton}
            >
              {showPassword.newPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.newPassword && <p>{errors.newPassword.message}</p>}
        </div>

        <div className={Style.inputBox}>
          <label htmlFor="passwordConfirm">Confirm New Password</label>
          <div className={Style.passInput}>
            <input
              type={showPassword.passwordConfirm ? 'text' : 'password'}
              id="passwordConfirm"
              placeholder="Confirm your new password here..."
              {...register('passwordConfirm', { required: 'Password confirmation is required' })}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('passwordConfirm')}
              className={Style.toggleButton}
            >
              {showPassword.passwordConfirm ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.passwordConfirm && <p>{errors.passwordConfirm.message}</p>}
        </div>

        <button type="submit" className={Style.btn} disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Confirm'}
        </button>
      </form>
    </div>
  );
}
