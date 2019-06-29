import React from 'react';

import './style/input.css';

const Input = ({ name, label, error, ...rest }) => {
  const baseClassName = 'form-control form-rounded';
  return (
    <div className="form-group">
      {label ? <span htmlFor={name}>{label}</span> : ''}
      <input
        {...rest}
        name={name}
        id={name}
        className={error ? baseClassName + ' fieldWithErrors' : baseClassName}
      />
      {error && <div className={'errorMsg'}>{error}</div>}
    </div>
  );
};

export default Input;
