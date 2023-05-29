import { useContext } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { appContext } from '../../../AppContext';
import { modalAnimation } from '../../../animations';

export function ConfirmModal({ display, dismiss }) {
  const { clearAll } = useContext(appContext);
  const transition: any = useTransition(display, modalAnimation as any);

  const confirm = () => {
    clearAll();
    dismiss();
  };

  return (
    <div>
      {transition((style, display) => (
        <>
          {display && (
            <div className="mx-auto absolute top-0 left-0 z-20 w-full h-full z-10 flex items-center justify-center text-black">
              <div className="relative z-10 px-5">
                <animated.div
                  style={style}
                  className="bg-white rounded-lg p-6 mx-auto max-w-lg"
                >
                  <div className="text-center">
                    <h1 className="font-bold text-xl mb-7 mx-10">
                      Please confirm that you want to decline all pending actions
                    </h1>
                    <button
                      onClick={confirm}
                      type="submit"
                      className="w-full px-4 py-3.5 rounded font-bold text-white bg-black"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={dismiss}
                      className="mt-4 mb-1 text-center mx-auto text-black border-b border-black mx-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </animated.div>
              </div>
              <div className="absolute bg-black bg-opacity-50 top-0 left-0 w-full h-full"></div>
            </div>
          )}
        </>
      ))}
    </div>
  );
}

export default ConfirmModal;
