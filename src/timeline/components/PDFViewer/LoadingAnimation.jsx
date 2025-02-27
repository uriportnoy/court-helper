import { motion } from 'framer-motion';
import styled from 'styled-components';

const LoadingAnimation = () => (
  <LoadingWrapper
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <LoadingContent>
      <IconWrapper>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <i className="pi pi-file-pdf" />
        </motion.div>
      </IconWrapper>
      <LoadingText
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Loading PDF...
      </LoadingText>
      <LoadingBar
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }}
      />
    </LoadingContent>
  </LoadingWrapper>
);

const LoadingWrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  color: var(--primary-600);
  
  i {
    display: block;
  }
`;

const LoadingText = styled(motion.div)`
  color: var(--primary-700);
  font-size: 1.25rem;
  font-weight: 500;
`;

const LoadingBar = styled(motion.div)`
  width: 200px;
  height: 4px;
  background: var(--primary-500);
  border-radius: 2px;
  transform-origin: left;
`;

export default LoadingAnimation;