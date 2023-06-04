import * as React from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
};

const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({ variant = 'primary', onClick = undefined, children }) => {
  let base = 'w-full px-4 py-3.5 rounded font-bold disabled:opacity-40 disabled:cursor-not-allowed';

  if (variant === 'primary') {
    base += ' text-black bg-white';
  } else if (variant === 'secondary') {
    base += ' text-white bg-core-black-contrast-3';
  }

  return (
    <button className={base} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
