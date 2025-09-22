import styled from "styled-components";

export const Button = styled.button`
  background-color: #7d8894ff;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
  transition: background 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;