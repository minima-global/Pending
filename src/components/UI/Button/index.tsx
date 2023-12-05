import * as React from 'react';

type ButtonProps = {
  size?: 'medium' |'default' | 'small';
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
};

const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({
  loading,
  variant = 'primary',
  size = 'default',
  onClick = undefined,
  children,
  disabled = false,
  type = 'button'
}) => {
  let base = 'w-full relative rounded font-bold disabled:opacity-40 disabled:cursor-not-allowed';

  if (variant === 'primary') {
    base += ' text-black bg-white';
  } else if (variant === 'secondary') {
    base += ' text-white bg-core-black-contrast-3';
  }

  if (size === 'default') {
    base += ' px-4 py-3.5';
  } else if (size === 'small') {
    base += ' text-sm px-4 py-2';
  } else if (size === 'medium') {
    base += ' text-sm px-4 py-3';
  }

  if (loading) {
    base += ' btn--loading';
  }

  return (
    <button type={type} className={base} onClick={onClick} disabled={loading || disabled}>
      {children}
      {loading && <span className="spinner" />}
    </button>
  );
};

export default Button;
