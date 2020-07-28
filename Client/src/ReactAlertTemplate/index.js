import React from 'react'
import InfoIcon from './icons/InfoIcon'
import SuccessIcon from './icons/SuccessIcon'
import ErrorIcon from './icons/ErrorIcon'
import CloseIcon from './icons/CloseIcon'
import Cookies from 'universal-cookie'

const cookies = new Cookies();
const role = cookies.get('role');

var primary_color;  
if(role === 'supporter') primary_color = '#003b5c';
else if (role === 'admin') primary_color = '#41273b';
else primary_color = '#881c1c';

const alertStyle = {
  color: primary_color,
  padding: '10px',
  borderRadius: '3px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0px 2px 2px 2px rgba(0, 0, 0, 0.2)',
  width: '100%',
  boxSizing: 'border-box'
}

const buttonStyle = {
  marginLeft: '20px',
  border: 'none',
  backgroundColor: primary_color,
  cursor: 'pointer',
  color: '#FFFFFF'
}

const AlertTemplate = ({ message, options, style, close }) => {
  return (
    <div style={{ ...alertStyle, ...style }}>
      {options.type === 'info' && <InfoIcon />}
      {options.type === 'success' && <SuccessIcon />}
      {options.type === 'error' && <ErrorIcon />}
      <span style={{ flex: 2 }}>{message}</span>
      <button onClick={close} style={buttonStyle}>
        <CloseIcon />
      </button>
    </div>  
  )
}

export default AlertTemplate
