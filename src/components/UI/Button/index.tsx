import * as React from 'react';

type ButtonProps = {
  size?: 'default' | 'small';
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
};

const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({ variant = 'primary', size = 'default', onClick = undefined, children }) => {
  let base = 'w-full rounded font-bold disabled:opacity-40 disabled:cursor-not-allowed';

  if (variant === 'primary') {
    base += ' text-black bg-white';
  } else if (variant === 'secondary') {
    base += ' text-white bg-core-black-contrast-3';
  }

  if (size === 'default') {
    base += ' px-4 py-3.5';
  } else if (size === 'small') {
    base += ' text-sm px-4 py-2';
  }

  return (
    <button className={base} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
