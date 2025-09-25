import { motion } from "framer-motion";
import styled from "styled-components";

interface AppLoaderProps {
  /** Custom text to display below the logo (default: "Loading...") */
  text?: string;
  /** Size of the logo in pixels (default: 80) */
  size?: number;
  /** Whether this is an overlay loader (covers entire area) */
  overlay?: boolean;
  /** Background color for overlay mode */
  overlayBg?: string;
}

const AppLoader: React.FC<AppLoaderProps> = ({
  text = "Loading...",
  size = 80,
  overlay = false,
  overlayBg = "rgba(255, 255, 255, 0.95)",
}) => (
  <LoaderWrapper
    overlay={overlay}
    overlayBg={overlayBg}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <LoaderContent>
      <LogoWrapper size={size}>
        <motion.img
          src="/logo.png"
          alt="Loading"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Pulse effect behind logo */}
        <PulseRing
          animate={{
            scale: [1, 1.4],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </LogoWrapper>
      
      <LoadingText
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {text}
      </LoadingText>
      
      <LoadingDots>
        {[0, 1, 2].map((index) => (
          <Dot
            key={index}
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </LoadingDots>
    </LoaderContent>
  </LoaderWrapper>
);

const LoaderWrapper = styled(motion.div)<{
  overlay: boolean;
  overlayBg: string;
}>`
  ${({ overlay }) =>
    overlay &&
    `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    backdrop-filter: blur(4px);
  `}
  
  background: ${({ overlay, overlayBg }) => (overlay ? overlayBg : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ overlay }) => (overlay ? "auto" : "200px")};
  width: 100%;
`;

const LoaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const LogoWrapper = styled.div<{ size: number }>`
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }
`;

const PulseRing = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border: 2px solid var(--primary-500, #3b82f6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

const LoadingText = styled(motion.div)`
  color: var(--primary-700, #1d4ed8);
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  background-color: var(--primary-500, #3b82f6);
  border-radius: 50%;
`;

export default AppLoader;
