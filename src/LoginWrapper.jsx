import Center from "./Center";
import LoginForm from './LoginForm';
import { Toast } from "primereact/toast";
import { cloneElement, useEffect, useRef, useState } from "react";
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithRedirect,
  getRedirectResult,
} from "./timeline/firebase";

const ALLOW_USERS = ["uriportnoy@gmail.com", "uri.portnoy@duda.co"];

const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

function AppWithLogin({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const toastCenter = useRef(null);

  const showMessage = (label, severity) => {
    toastCenter.current.show({
      severity,
      summary: severity === "error" ? "Error" : "Success",
      detail: label,
      life: 8000,
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setHasAccess(ALLOW_USERS.includes(currentUser.email));
      }
    });

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult();
        if (result) {
          const currentUser = result.user;
          setUser(currentUser);
          const userHasAccess = ALLOW_USERS.includes(currentUser.email);
          setHasAccess(userHasAccess);
          if (!userHasAccess) {
            showMessage("Access denied", "error");
          }
        }
      } catch (error) {
        showMessage("Error handling redirect result:" + error, "error");
      } finally {
        setIsLoaded(true);
      }
    };

    handleRedirectResult();
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const result = await (isMobile() ? signInWithRedirect() : signInWithPopup());
      const currentUser = result.user;
      setUser(currentUser);
      setHasAccess(ALLOW_USERS.includes(currentUser.email));
    } catch (error) {
      showMessage("Error signing in: " + error.message, "error");
    }
  };

  const logout = () => {
    signOut();
    setUser(null);
  };

  if (!isLoaded) {
    return <LoadingScreen>Loading...</LoadingScreen>;
  }

  return (
    <Wrapper>
      {user && hasAccess && children({ logout })}
      {(!user || !hasAccess) && (
        <LoginContainer>
          {user && !hasAccess && <AccessDenied>Access denied</AccessDenied>}
          <LoginOptions>
            <GoogleSignInButton onClick={signIn}>
              <i className="pi pi-google" /> Sign in with Google
            </GoogleSignInButton>
            <Divider>or</Divider>
            <LoginForm />
          </LoginOptions>
        </LoginContainer>
      )}
      <Toast ref={toastCenter} position="center" />
    </Wrapper>
  );
}

AppWithLogin.propTypes = {
  children: PropTypes.func.isRequired,
};

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: var(--surface-50);
`;

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

const LoginOptions = styled.div`
  background: var(--surface-0);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
  animation: slideIn var(--transition-normal);
`;

const GoogleSignInButton = styled.button`
  width: 100%;
  background-color: var(--surface-0);
  color: var(--surface-900);
  border: 1px solid var(--surface-300);
  padding: var(--spacing-md);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  
  &:hover {
    background-color: var(--surface-100);
    border-color: var(--surface-400);
  }

  .pi-google {
    color: #DB4437;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: var(--spacing-md) 0;
  color: var(--surface-500);
  font-size: 0.875rem;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--surface-200);
  }
  
  &::before {
    margin-right: var(--spacing-md);
  }
  
  &::after {
    margin-left: var(--spacing-md);
  }
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