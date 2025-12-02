import { User } from "@/lib/types/user";

export async function fetchUserDataFromApi(): Promise<User> {
  const API_USER_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/auth/me';

  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await fetch(API_USER_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(errorData?.message || `Fail to fetch user data: ${response.status} ${response.statusText}`);
    }

    const data: User = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}