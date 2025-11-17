import Center from "./Center";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import AppLoader from "./common/AppLoader";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithRedirect,
  getRedirectResult,
} from "@/firebase";

const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

function AppWithLogin({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      if (currentUser.email === "uriportnoy@gmail.com") {
        setUser(currentUser);
        setHasAccess(true);
      }
    });

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult();
        if (result) {
          const currentUser = result.user;
          setUser(currentUser);
          const userHasAccess = currentUser.email === "uriportnoy@gmail.com";
          setHasAccess(userHasAccess);
          if (!userHasAccess) {
            toast.error("Access denied", "error");
          }
        }
      } catch (error) {
        toast.error("Error handling redirect result:" + error, "error");
      } finally {
        setIsLoaded(true);
      }
    };

    handleRedirectResult();
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const result = await (isMobile()
        ? signInWithRedirect()
        : signInWithPopup());
      const currentUser = result.user;
      setUser(currentUser);
      setHasAccess(["uriportnoy@gmail.com"].includes(currentUser.email));
    } catch (error) {
      toast.error("Error signing in: " + error.message, "error");
    }
  };

  const logout = () => {
    signOut();
    setUser(null);
  };

  if (!isLoaded) {
    return (
      <LoadingScreen>
        <AppLoader text="מאתחל את האפליקציה..." size={120} />
      </LoadingScreen>
    );
  }

  return (
    <>
      {user && hasAccess && children({ logout })}
      {(!user || !hasAccess) && (
        <LoginContainer>
          {user && !hasAccess && <AccessDenied>Access denied</AccessDenied>}
          <button onClick={signIn}>
            <i className="pi pi-google" /> Google Sign-In
          </button>
        </LoginContainer>
      )}
    </>
  );
}

AppWithLogin.propTypes = {
  children: PropTypes.func.isRequired,
};

const LoadingScreen = styled(Center)`
  min-height: 100vh;
  font-size: 1.25rem;
  color: var(--primary-600);
  background-color: var(--surface-50);
`;

const LoginContainer = styled(Center)`
  min-height: 100vh;
  padding: var(--spacing-lg);
`;

const AccessDenied = styled.div`
  color: var(--red-600);
  background-color: var(--red-100);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  text-align: center;
  font-weight: 500;
`;

export default AppWithLogin;
