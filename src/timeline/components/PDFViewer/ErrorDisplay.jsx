import { motion } from "framer-motion";
import styled from "styled-components";

const ErrorDisplay = ({ message, onRetry }) => (
  <ErrorWrapper
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <ErrorContent>
      <IconWrapper>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <i className="pi pi-exclamation-triangle" />
        </motion.div>
      </IconWrapper>
      <ErrorMessage>{message}</ErrorMessage>
      <RetryButton
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className="pi pi-refresh" />
        Try Again
      </RetryButton>
    </ErrorContent>
  </ErrorWrapper>
);

const ErrorWrapper = styled(motion.div)`
  min-height: 400px;
  background: var(--surface-50);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  text-align: center;
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  color: var(--red-600);

  i {
    display: block;
  }
`;

const ErrorMessage = styled.div`
  color: var(--surface-700);
  font-size: 1.125rem;
  line-height: 1.5;
`;

const RetryButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-600);
  color: white;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  font-size: 1rem;
  transition: background 0.2s ease;

  &:hover {
    background: var(--primary-700);
  }

  i {
    font-size: 1.125rem;
  }
`;

export default ErrorDisplay;
