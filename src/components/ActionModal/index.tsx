import { useTransition, animated } from '@react-spring/web';
import { modalAnimation } from '../../animations';
import { useContext, useEffect, useState } from 'react';
import { appContext } from '../../AppContext';
import Clipboard from 'react-clipboard.js';

export function ActionModal() {
  const { displayActionModal, setDisplayActionModal } = useContext(appContext);
  const display = displayActionModal && displayActionModal.display;
  const transition: any = useTransition(display, modalAnimation as any);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCopied(false);
    }, 2500);

    return () => {
      clearTimeout(timeout);
    };
  }, [copied]);

  const onClose = () => {
    setDisplayActionModal(null);
  };

  return (
    <div>
      {transition((style, display) => (
        <>
          {display && (
            <div className="mx-auto fixed top-0 left-0 z-20 w-full h-full z-10 flex items-center justify-center text-black">
              <div className="relative z-10 px-5 w-full">
                <animated.div style={style} className="bg-white rounded-lg p-6 mx-auto max-w-lg">
                  <div className="w-full">
                    {displayActionModal && displayActionModal.loading && (
                      <div className="w-full flex items-center justify-center mb-2">
                        <div className="spinner w-4 h-4 mx-auto" />
                      </div>
                    )}
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
                          <pre className="text-left max-h-[14rem] overflow-scroll break-word">
                            {displayActionModal.response}
                          </pre>
                        </div>
                        <Clipboard
                          className="w-full"
                          data-clipboard-text={displayActionModal.response}
                          onClick={() => setCopied(true)}
                        >
                          <div className="w-full px-4 py-3.5 rounded font-bold bg-white border border-black text-black mb-2 flex items-center justify-center">
                            {!copied && 'Copy Response'}
                            {copied && (
                              <div className="flex gap-2 items-center">
                                Copied to clipboard
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8.58075 14.2538L15.3038 7.53075L14.25 6.47693L8.58075 12.1462L5.73075 9.29615L4.67693 10.35L8.58075 14.2538ZM10.0016 19.5C8.68772 19.5 7.45268 19.2506 6.29655 18.752C5.1404 18.2533 4.13472 17.5765 3.2795 16.7217C2.42427 15.8669 1.74721 14.8616 1.24833 13.706C0.749442 12.5504 0.5 11.3156 0.5 10.0017C0.5 8.68772 0.749334 7.45268 1.248 6.29655C1.74667 5.1404 2.42342 4.13472 3.27825 3.2795C4.1331 2.42427 5.13834 1.74721 6.29398 1.24833C7.44959 0.749442 8.68437 0.5 9.9983 0.5C11.3122 0.5 12.5473 0.749333 13.7034 1.248C14.8596 1.74667 15.8652 2.42342 16.7205 3.27825C17.5757 4.1331 18.2527 5.13834 18.7516 6.29398C19.2505 7.44959 19.5 8.68437 19.5 9.9983C19.5 11.3122 19.2506 12.5473 18.752 13.7034C18.2533 14.8596 17.5765 15.8652 16.7217 16.7205C15.8669 17.5757 14.8616 18.2527 13.706 18.7516C12.5504 19.2505 11.3156 19.5 10.0016 19.5Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </Clipboard>
                        <button
                          onClick={onClose}
                          type="button"
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
                        <h1 className="font-bold text-center text-xl mb-6 mx-10">Denied all pending actions</h1>
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
