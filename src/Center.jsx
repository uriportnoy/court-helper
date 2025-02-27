import styled from "styled-components";

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-direction: column;
  font-size: 1.5em;
  background-color: ${({ type }) =>
    type === "overlay" ? "rgba(0, 0, 0, 0.5)" : "transparent"};
  position: ${({ type }) => (type === "overlay" ? "absolute" : "relative")};
  z-index: ${({ type }) => (type === "overlay" ? 99 : 0)};
  width: 100%;
  button {
    padding: 10px 20px;
    font-size: 1.5em;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
      background-color: #45a049;
    }
  }
`;

export default Center;
