import { animated, useTransition } from '@react-spring/web';
import { useContext } from 'react';
import { appContext } from '../../AppContext';

function Actions() {
  const { pendingData, accept, decline } = useContext(appContext);

  const transitions = useTransition(pendingData, {
    key: (item) => item?.uid,
    from: { opacity: 0, translateX: 10 },
    enter: { opacity: 1, translateX: 0 },
    leave: { opacity: 0, translateX: -50 },
    trail: 75,
    config: { duration: 100 },
  } as any);

  if (pendingData?.length === 0) {
    return (
      <div className="bg-grey rounded-lg w-full mb-4">
        <div className="px-4 py-3">There are no pending actions</div>
      </div>
    )
  }

  return (transitions as any)((props, pending) => {
    if (!pending) {
      return <div />;
    }

    return (
      <animated.div style={props as any}>
        <>
          {pending && (
            <div className="bg-grey rounded-lg w-full mb-4">
              <div className="flex w-full pt-3 px-3">
                <div className="flex gap-4">
                  <div
                    className="w-10 h-10 bg-cover rounded-lg"
                    style={{ backgroundImage: `url(${(window as any).MDS.filehost}/${pending.minidapp.uid}/${pending.minidapp.conf.icon}), url('./app.png')` }}
                  />
                  <div className="text-lg font-bold text-core-grey-80 flex items-center">{pending.minidapp.conf.name}</div>
                </div>
                <div className="flex gap-3 flex-grow flex items-center justify-end">
                  <button
                    onClick={() => accept(pending?.uid, pending?.minidapp)}
                    className="p-1 active:scale-95 bg-green-500 rounded flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-check"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                  <button
                    onClick={() => decline(pending?.uid, pending?.minidapp)}
                    className="p-1 active:scale-95 bg-red-500 rounded flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-x"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="w-full p-3 rounded">
                <div className="bg py-1 px-2 rounded font-bold text-core-grey-80 flex items-center">{pending.command}</div>
              </div>
            </div>
          )}
        </>
      </animated.div>
    );
  });
}

export default Actions;
