import { IUser } from "@/models/userModel";
import { getSession, signIn } from "next-auth/react";
import { signOut } from "next-auth/react";
import { notFound } from "next/navigation";

export const getAllUsers = async (): Promise<IUser[]> => {
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
  
      const users: IUser[] = await response.json();
  
      if (!users) {
        throw new Error('No users found.');
      }
  
      return users;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
  };

  export const getFilteredUsers = async (query: string): Promise<IUser[]> => {
    try {
        const response = await fetch(`/api/users/search?query=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch filtered users');
        }

        const users: IUser[] = await response.json();
        return users;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred.');
    }
};


export const getUserById = async (userId: string): Promise<IUser | null> => {
    try {
        const res = await fetch(`/api/users/${userId}`, {
            method: 'GET',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch user with ID: ${userId}`);
        }

        const data: IUser = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};  
  
export async function userSignup(newUser: { username: string, name: string, email: string, password: string, passwordConfirm: string, role?: string}) {
    try {
        const role = newUser.role || 'user';

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/auth/register`, {
            method: "POST",
            body: JSON.stringify({
                username: newUser.username,
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                passwordConfirm: newUser.passwordConfirm,
                role,
            }),
            headers: {
                "Content-type": "application/json",
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create a user");
        }

        return data;
    } catch (error) {
        throw error;
    }
}


export async function userLogin(data: { email: string, password: string }) {
    const { email, password } = data;

    const result = await signIn("credentials", {
        redirect: false,
        email,
        password
    });

    if (result?.error) throw new Error("Email or password wrong...");
}


export async function userLogout() {
    await signOut();
}

export async function requestUser(email: string): Promise<any> {
    const session = await getSession();
    
    if (!session || !session.user) {
        throw new Error("Unauthorized: No session found");
    }

    const res = await fetch(`${process.env.WEBSITE_API_URL}/api/auth/requestuser/${email}`);

    if (!res.ok) {
        throw new Error("Failed to fetch user by email");
    }

    const user = await res.json();

    if (!user) {
        notFound();
    }

    return user;
}

export async function updateProfile(newData: { id: string, username: string, name: string, bio: string }) {
    try {
        const { id, username, name, bio } = newData;

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/users/${id}/edit-profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, name, bio }), 
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to update user info");
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export async function updateProfilePhoto(newData: { id: string, profilePhoto: string}) {
    try {
        const { id, profilePhoto } = newData;

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/users/${id}/profile-photo`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profilePhoto}), 
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to update profile photo");
        }

        return data;
    } catch (error) {
        throw error;
    }
}


export async function updateUserPassword(newData: { userId: string, passwordCurrent: string, newPassword: string, passwordConfirm: string }) {
    try {
        const { userId, passwordCurrent, newPassword, passwordConfirm } = newData;

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/users/${userId}/update-password`, {
            method: "PATCH",
            body: JSON.stringify({ passwordCurrent, newPassword, passwordConfirm }),
            headers: {
                "Content-type": "application/json",
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to update password");
        }

        await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password
        });

        return data;
    } catch (error) {
        throw error;
    }
}

export const deleteUser = async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
};

export const toggleLike = async (userId: string, postId: string, action: 'add' | 'remove'): Promise<IUser> => {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            throw new Error("Unauthorized: No session found");
        }

        const response = await fetch(`${process.env.WEBSITE_API_URL}/api/users/${userId}/likes/${postId}`, {
            method: action === 'add' ? 'POST' : 'DELETE', 
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to toggle like');
        }

        const updatedUser: IUser = await response.json();
        return updatedUser;
    } catch (error) {
        console.error("Error toggling like:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred.');
    }
};

export const toggleFollow = async (userId: string, followerUserId: string, action: 'add' | 'remove'): Promise<IUser> => {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            throw new Error("Unauthorized: No session found");
        }

        const response = await fetch(`${process.env.WEBSITE_API_URL}/api/users/${userId}/follow/${followerUserId}`, {
            method: action === 'add' ? 'POST' : 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to toggle follow');
        }

        const updatedUser: IUser = await response.json();
        return updatedUser;
    } catch (error) {
        console.error("Error toggling follow:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred.');
    }
};

export const getFollowersByUserId = async (userId: string): Promise<IUser[]> => {
    try {
        const res = await fetch(`/api/users/${userId}/followers`, {
            method: 'GET',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch followers for user with ID: ${userId}`);
        }

        const data: IUser[] = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching followers:', error);
        throw error;
    }
};

export const getFollowingByUserId = async (userId: string): Promise<IUser[]> => {
    try {
        const res = await fetch(`/api/users/${userId}/following`, {
            method: 'GET',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch following for user with ID: ${userId}`);
        }

        const data: IUser[] = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching following:', error);
        throw error;
    }
};

export const deleteFollower = async (userId: string, followerId: string): Promise<{ message: string }> => {
    const response = await fetch(`/api/users/${userId}/followers/${followerId}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
};



// CHATS 
export const removeChatFromUser = async (userId: string, chatId: string): Promise<{ message: string }> => {
    const response = await fetch(`/api/users/${userId}/users-chats/${chatId}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
};


export const getChatsByUserId = async (userId: string): Promise<{ chats: any[] }> => {
    const response = await fetch(`/api/users/${userId}/users-chats/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }
  
    return response.json();
  };
  