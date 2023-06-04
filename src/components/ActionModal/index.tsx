import Clipboard from 'react-clipboard.js';
import { useContext, useEffect, useState } from 'react';
import Modal from '../UI/Modal';
import { appContext } from '../../AppContext';

export function ActionModal() {
  const { displayActionModal, setDisplayActionModal } = useContext(appContext);
  const display = displayActionModal && displayActionModal.display;
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
    <Modal display={!!display} frosted close={{ textContent: 'Close', callback: onClose }}>
      <div className="w-full">
        {displayActionModal && displayActionModal.loading && (
          <div className="w-full flex items-center justify-center mb-2">
            <div className="spinner w-4 h-4 mx-auto" />
          </div>
        )}
        {displayActionModal && displayActionModal.accept && (
          <div>
            <h1 className="font-bold text-center text-xl mb-8">Pending action has been approved</h1>
            <div className="text-left p-1 lg:p-4 text-xs lg:text-sm rounded px-4 py-3 bg-core-black-contrast mb-6 break-word">
              <pre className="text-left max-h-[14rem] overflow-y-scroll break-word pr-3 custom-scrollbar">
                {displayActionModal.message}
                <br />
                {displayActionModal.response}
              </pre>
            </div>
            <Clipboard
              className="w-full"
              data-clipboard-text={displayActionModal.response}
              onClick={() => setCopied(true)}
            >
              <div className="w-full px-4 py-3.5 rounded font-bold bg-white border border-black text-black mb-1 flex items-center justify-center">
                {!copied && 'Copy Response'}
                {copied && (
                  <div className="flex gap-2 items-center">
                    Copied to clipboard
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M8.58075 14.2538L15.3038 7.53075L14.25 6.47693L8.58075 12.1462L5.73075 9.29615L4.67693 10.35L8.58075 14.2538ZM10.0016 19.5C8.68772 19.5 7.45268 19.2506 6.29655 18.752C5.1404 18.2533 4.13472 17.5765 3.2795 16.7217C2.42427 15.8669 1.74721 14.8616 1.24833 13.706C0.749442 12.5504 0.5 11.3156 0.5 10.0017C0.5 8.68772 0.749334 7.45268 1.248 6.29655C1.74667 5.1404 2.42342 4.13472 3.27825 3.2795C4.1331 2.42427 5.13834 1.74721 6.29398 1.24833C7.44959 0.749442 8.68437 0.5 9.9983 0.5C11.3122 0.5 12.5473 0.749333 13.7034 1.248C14.8596 1.74667 15.8652 2.42342 16.7205 3.27825C17.5757 4.1331 18.2527 5.13834 18.7516 6.29398C19.2505 7.44959 19.5 8.68437 19.5 9.9983C19.5 11.3122 19.2506 12.5473 18.752 13.7034C18.2533 14.8596 17.5765 15.8652 16.7217 16.7205C15.8669 17.5757 14.8616 18.2527 13.706 18.7516C12.5504 19.2505 11.3156 19.5 10.0016 19.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </Clipboard>
          </div>
        )}
        {displayActionModal && displayActionModal.deny && (
          <div>
            <h1 className="font-bold text-center text-xl mb-8">Pending action has been denied</h1>
            <pre className="text-left p-1 lg:p-4 text-xs lg:text-sm rounded px-4 py-3 bg-core-black-contrast mb-2 break-word">
              {displayActionModal.message}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ActionModal;
