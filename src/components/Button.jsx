import React from 'react';
import { Button as Buttons } from './ui/button';

const Button = ({ loading, label, children, ...props }) => (
  <Buttons {...props} disabled={loading || props.disabled}>
    {loading ? 'Loading...' : label || children || 'Login'}
  </Buttons>
);

export default Button;

export const ButtoClick = ({ label, onClick }) => (
  <button onClick={onClick} className='btn btn-soft p-2  btn-primary'>
    {label}
  </button>
);
