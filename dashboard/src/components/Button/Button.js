import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import styles from "../../style-variables";


const StyledButton = styled(Button)({
  color: styles.link,
  padding: "8px 4px",
  fontFamily: styles.font,
  fontWeight: 700,
  fontSize: styles.fontSizeM,
});

export default StyledButton;

const ButtonSmall = styled(StyledButton)({
  fontSize: 10,
});

export { ButtonSmall }
