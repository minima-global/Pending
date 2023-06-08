import * as React from 'react';
import Clipboard from 'react-clipboard.js';
import { useEffect, useState } from 'react';

type PanelProps = {
  title: string;
  value?: string | number;
  link?: string | null;
  copy?: boolean;
  refresh?: boolean;
  mono?: boolean;
};

const Panel: React.FC<React.PropsWithChildren<PanelProps>> = ({
  title,
  children,
  value,
  link = null,
  copy = false,
  refresh = false,
  mono = false,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCopied(false);
    }, 2500);

    return () => {
      clearTimeout(timeout);
    };
  }, [copied]);

  return (
    <div className="flex flex-col bg-core-black-contrast rounded relative overflow-hidden h-full">
      <div className="relative text-white text-left p-4">
        {title}
        {copy && (
          <div className="absolute top-0 right-0 h-full flex items-center mr-4 text-core-grey">
            {!copied && (
              <div className="flex items-center z-10 -mt-0.5">
                <div>
                  <Clipboard data-clipboard-text={value} onClick={() => setCopied(true)}>
                    <div className="text-sm text-core-grey-80 flex items-center gap-2">
                      <span className="mt-0.5">Copy</span>
                      <svg width="20" height="21" viewBox="0 0 17 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M1.5 20.9751C1.1 20.9751 0.75 20.8251 0.45 20.5251C0.15 20.2251 0 19.8751 0 19.4751V4.4001H1.5V19.4751H13.35V20.9751H1.5ZM4.5 17.9751C4.1 17.9751 3.75 17.8251 3.45 17.5251C3.15 17.2251 3 16.8751 3 16.4751V2.4751C3 2.0751 3.15 1.7251 3.45 1.4251C3.75 1.1251 4.1 0.975098 4.5 0.975098H15.5C15.9 0.975098 16.25 1.1251 16.55 1.4251C16.85 1.7251 17 2.0751 17 2.4751V16.4751C17 16.8751 16.85 17.2251 16.55 17.5251C16.25 17.8251 15.9 17.9751 15.5 17.9751H4.5ZM4.5 16.4751H15.5V2.4751H4.5V16.4751Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </Clipboard>
                </div>
              </div>
            )}
            {copied && (
              <div className="flex items-center z-10 text-status-green">
                <div>
                  <div className="text-sm text-primary flex items-center gap-2">
                    Copied
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M8.58075 14.2538L15.3038 7.53075L14.25 6.47693L8.58075 12.1462L5.73075 9.29615L4.67693 10.35L8.58075 14.2538ZM10.0016 19.5C8.68772 19.5 7.45268 19.2506 6.29655 18.752C5.1404 18.2533 4.13472 17.5765 3.2795 16.7217C2.42427 15.8669 1.74721 14.8616 1.24833 13.706C0.749442 12.5504 0.5 11.3156 0.5 10.0017C0.5 8.68772 0.749334 7.45268 1.248 6.29655C1.74667 5.1404 2.42342 4.13472 3.27825 3.2795C4.1331 2.42427 5.13834 1.74721 6.29398 1.24833C7.44959 0.749442 8.68437 0.5 9.9983 0.5C11.3122 0.5 12.5473 0.749333 13.7034 1.248C14.8596 1.74667 15.8652 2.42342 16.7205 3.27825C17.5757 4.1331 18.2527 5.13834 18.7516 6.29398C19.2505 7.44959 19.5 8.68437 19.5 9.9983C19.5 11.3122 19.2506 12.5473 18.752 13.7034C18.2533 14.8596 17.5765 15.8652 16.7217 16.7205C15.8669 17.5757 14.8616 18.2527 13.706 18.7516C12.5504 19.2505 11.3156 19.5 10.0016 19.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className={`bg-core-black-100 p-4 flex-grow flex text-sm lg:text-md ${mono ? 'font-mono' : ''}`}>
        {children && <>{children}</>}
        {!children && (
          <div className="grid grid-cols-12 text-left">
            <div className={`${refresh ? 'col-span-9' : 'col-span-12'}`}>
              <div
                className={`lg:text-base break-words ${
                  link ? 'cursor-pointer text-white underline' : 'text-core-grey-80'
                }`}
              >
                {value}
              </div>
            </div>
            {refresh && (
              <div className="col-span-3 flex items-center justify-end">
                {refresh && (
                  <div className="cursor-pointer transition-all active:rotate-180">
                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M11.05 15.75C8.8872 15.75 7.0465 14.9974 5.52792 13.4923C4.00933 11.9871 3.25004 10.1564 3.25004 7.99998V7.21915L1.40002 9.06918L0.346191 8.01535L4.00002 4.36155L7.65384 8.01535L6.60002 9.06918L4.74999 7.21915V7.99998C4.74999 9.73716 5.36153 11.2131 6.58462 12.4279C7.8077 13.6426 9.29617 14.25 11.05 14.25C11.4641 14.25 11.8779 14.2048 12.2914 14.1144C12.7048 14.024 13.1083 13.8885 13.5019 13.7077L14.6269 14.8327C14.0641 15.1352 13.483 15.3637 12.8837 15.5182C12.2843 15.6727 11.6731 15.75 11.05 15.75ZM18 11.6384L14.3462 7.9846L15.4 6.93078L17.25 8.7808V7.99998C17.25 6.26279 16.6385 4.78682 15.4154 3.57207C14.1923 2.35732 12.7039 1.74995 10.95 1.74995C10.5359 1.74995 10.1221 1.79514 9.70867 1.88553C9.29522 1.97591 8.89169 2.11148 8.49809 2.29225L7.37312 1.1673C7.93593 0.864734 8.51702 0.636209 9.11637 0.481726C9.71573 0.327243 10.327 0.25 10.95 0.25C13.1128 0.25 14.9535 1.00256 16.4721 2.50768C17.9907 4.01281 18.75 5.84358 18.75 7.99998V8.7808L20.6 6.93078L21.6538 7.9846L18 11.6384Z"
                        fill="#F4F4F5"
                      />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Panel;
