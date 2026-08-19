import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";
import { createContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { useEffect, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [otpState, setOtpState] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("user");
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing saved user", e);
        }
      }
    }
  }, []);

  const login = (userdata) => {
    setUser(userdata);
    if (typeof window !== 'undefined') {
      localStorage.setItem("user", JSON.stringify(userdata));
    }
  };
  const logout = async () => {
    setUser(null);
    setOtpState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };
  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };
      const response = await axiosInstance.post("/user/login", payload);
      
      if (response.data.otpRequired) {
        setOtpState({
          required: true,
          userId: response.data.userId,
          pendingDevice: response.data.pendingDevice
        });
      } else {
        login(response.data.result);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser) {
        try {
          const payload = {
            email: firebaseuser.email,
            name: firebaseuser.displayName,
            image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          };
          const response = await axiosInstance.post("/user/login", payload);
          if (response.data.otpRequired) {
            setOtpState({
              required: true,
              userId: response.data.userId,
              pendingDevice: response.data.pendingDevice
            });
          } else {
            login(response.data.result);
          }
        } catch (error) {
          console.error(error);
          logout();
        }
      }
    });
    return () => unsubcribe();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let appliedTheme = user?.theme || 'auto';
      
      if (appliedTheme === 'auto') {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const istTime = new Date(utc + (3600000 * 5.5));
        const hours = istTime.getHours();
        
        // 6:00 AM to 6:00 PM IST is daytime
        if (hours >= 6 && hours < 18) {
          appliedTheme = 'light';
        } else {
          appliedTheme = 'dark';
        }
      }

      if (appliedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [user?.theme]);

  const updateTheme = async (newTheme) => {
    if (!user) return;
    try {
      const res = await axiosInstance.patch(`/user/theme/${user._id}`, { theme: newTheme });
      login(res.data);
    } catch (e) {
      console.error("Theme update error:", e);
    }
  };

  const submitOtp = async (otp) => {
    if (!otpState) return false;
    try {
      const res = await axiosInstance.post("/user/verify-otp", {
        userId: otpState.userId,
        otp,
        pendingDevice: otpState.pendingDevice
      });
      setOtpState(null);
      login(res.data.result);
      return true;
    } catch (e) {
      console.error("OTP verification failed:", e);
      return false;
    }
  };

  const cancelOtp = () => {
    setOtpState(null);
    signOut(auth);
  };

  return (
    <UserContext.Provider value={{ 
      user, login, logout, handlegooglesignin, 
      otpState, submitOtp, cancelOtp, updateTheme 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
