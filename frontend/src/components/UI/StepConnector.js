import React from 'react';
import { StepConnector as MuiStepConnector } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomStepConnector = styled(MuiStepConnector)(({ theme, activeStep }) => ({
  [`& .MuiStepConnector-line`]: {
    borderColor: '#342978',
    borderWidth: 2,
    display: 'none',
    ...(activeStep > 0 && {
      display: 'block',
    }),
    ...(activeStep > 1 && {
      '&:nth-of-type(2)': {
        display: 'block',
      },
    }),
  },
}));

export default CustomStepConnector;
