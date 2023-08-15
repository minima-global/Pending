import { PropsWithChildren, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { modalAnimation } from '../../../animations';
import Button from '../Button';

type ModalProps = {
  display: boolean;
  frosted: boolean;
  close?: {
    textContent?: string;
    callback: () => void;
  };
};

export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ frosted = false, display, children, close }) => {
  const transition: any = useTransition(display, modalAnimation as any);

  useEffect(() => {
    // document.body.style.overflow = display ? 'hidden' : 'unset';
  }, [display]);

  return (
    <div>
      {transition((style, display) => (
        <div>
          {display && (
            <div className="mx-auto fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center text-black">
              <div className="relative z-50 w-full max-w-md px-5">
                <animated.div
                  style={style}
                  className="modal mb-8 text-white bg-core-black-contrast-2 box-shadow-lg rounded p-8 mx-auto relative overflow-hidden"
                >
                  {children}
                </animated.div>
              </div>
              {close && (
                <div className="absolute bottom-10 w-full px-6 z-50">
                  <Button variant="secondary" onClick={close.callback}>
                    {close.textContent || 'Close'}
                  </Button>
                </div>
              )}
              {frosted && <div className="fixed z-40 backdrop-blur-2xl bg-black/20 top-0 left-0 w-full h-full"></div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Modal;
