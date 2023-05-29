import { useTransition, animated } from '@react-spring/web';
import { modalAnimation } from '../../animations';
import { useContext } from 'react';
import { appContext } from '../../AppContext';

export function ActionModal() {
  const { displayActionModal, setDisplayActionModal } = useContext(appContext);
  const display = displayActionModal && displayActionModal.display;
  const transition: any = useTransition(display, modalAnimation as any);

  const onClose = () => {
    setDisplayActionModal(null);
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
                  className="bg-white rounded-lg p-6 mx-auto"
                >
                  <div>
                    {displayActionModal && displayActionModal.loading && <div className="spinner w-4 h-4" />}
                    {displayActionModal && displayActionModal.accept && (
                      <div>
                        {displayActionModal.minidapp && (
                          <>
                            <img
                              src={`${(window as any).MDS.filehost}/${displayActionModal.minidapp.uid}/${
                                displayActionModal.minidapp.conf.icon
                              }`}
                              className="w-14 h-14 rounded-lg mb-5 mx-auto"
                            />
                            <h1 className="font-bold text-center text-xl mb-6">
                              Action for {displayActionModal.minidapp.conf.name} has been accepted
                            </h1>
                          </>
                        )}
                        <pre className="p-1 text-left lg:p-4 text-xs lg:text-sm border-2 border-gray-200 mb-6 break-word">
                          {displayActionModal.message}
                        </pre>
                        <div className="p-1 lg:p-4 text-xs lg:text-sm border-2 border-gray-200 mb-6">
                          <pre className="text-left max-h-[14rem] overflow-scroll break-word">{displayActionModal.response}</pre>
                        </div>
                        <button
                          onClick={onClose}
                          type="submit"
                          className="w-full px-4 py-3.5 rounded font-bold text-white bg-black mb-1"
                        >
                          Close
                        </button>
                      </div>
                    )}
                    {displayActionModal && displayActionModal.deny && (
                      <div>
                        {displayActionModal.minidapp && (
                          <>
                            <img
                              src={`${(window as any).MDS.filehost}/${displayActionModal.minidapp.uid}/${
                                displayActionModal.minidapp.conf.icon
                              }`}
                              className="w-14 h-14 rounded-lg mb-5 mx-auto"
                            />
                            <h1 className="font-bold text-center text-xl mb-6">
                              Action for {displayActionModal.minidapp.conf.name} has been denied
                            </h1>
                          </>
                        )}
                        <pre className="text-left p-1 lg:p-4 text-xs lg:text-sm border-2 border-gray-200 mb-6 break-word">
                          {displayActionModal.message}
                        </pre>
                        <button
                          onClick={onClose}
                          type="submit"
                          className="w-full px-4 py-3.5 rounded font-bold text-white bg-black mb-1"
                        >
                          Close
                        </button>
                      </div>
                    )}
                    {displayActionModal && displayActionModal.cleared && (
                      <div>
                        <h1 className="font-bold text-center text-xl mb-6 mx-10">
                          Denied all pending actions
                        </h1>
                        <button
                          onClick={onClose}
                          type="submit"
                          className="w-full px-4 py-3.5 rounded font-bold text-white bg-black"
                        >
                          Close
                        </button>
                      </div>
                    )}
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

export default ActionModal;
