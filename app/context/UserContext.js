'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Retrieve user data from cookies on component mount
    const storedUser = Cookies.get('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Save user data to cookies whenever it changes
    Cookies.set('user', JSON.stringify(user), { expires: 7 }); // Set an expiration time if needed
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // Clear user data from cookies on logout
    Cookies.remove('user');
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
