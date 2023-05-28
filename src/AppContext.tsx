import * as React from 'react';
import { createContext, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { acceptAction, declineAction, getPendingActions } from './lib';
import { MDSPendingResponse } from './types';

type AppContext = {
  displayActionModal: {
    minidapp?: MDSPendingResponse['pending'][0]['minidapp'];
    accept?: boolean;
    deny?: boolean;
    display: boolean;
    loading: boolean;
    message?: string;
    response?: string;
  } | null;
  setDisplayActionModal: Dispatch<
    SetStateAction<{
      minidapp?: MDSPendingResponse['pending'][0]['minidapp'];
      accept?: boolean;
      deny?: boolean;
      display: boolean;
      loading: boolean;
      message?: string;
      response?: string;
    } | null>
  >;
  accept: (uid: string, minidapp: MDSPendingResponse['pending'][0]['minidapp']) => void;
  decline: (uid: string, minidapp: MDSPendingResponse['pending'][0]['minidapp']) => void;
  pendingData: MDSPendingResponse['pending'] | null;
};

export const appContext = createContext<AppContext>({
  displayActionModal: null,
  setDisplayActionModal: () => null,
  pendingData: null,
  accept: () => null,
  decline: () => null,
});

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const loaded = useRef(false);
  const [pendingData, setPendingData] = useState<AppContext['pendingData']>(null);
  const [displayActionModal, setDisplayActionModal] = useState<AppContext['displayActionModal']>(null);

  // init mds
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;

      (window as any).MDS.init((evt: any) => {
        if (evt.event === 'inited') {
          getPendingActions().then((pendingActionsResponse) => {
            setPendingData(pendingActionsResponse.pending);
          });

          setInterval(() => {
            getPendingActions().then((pendingActionsResponse) => {
              setPendingData(pendingActionsResponse.pending);
            });
          }, 5000);
        }
      });
    }
  }, [loaded]);

  const refresh = () => {
    return getPendingActions().then((pendingActionsResponse) => {
      setPendingData(pendingActionsResponse.pending);
    });
  };

  const accept = async (uid: string, minidapp: MDSPendingResponse['pending'][0]['minidapp']) => {
    setDisplayActionModal({ display: true, loading: true });

    acceptAction(uid).then((response) => {
      refresh().then(() => {
        setDisplayActionModal({
          minidapp,
          accept: true,
          display: true,
          loading: false,
          message: JSON.stringify(response.params, null, 2),
          response: JSON.stringify(response.response, null, 2),
        });
      });
    });
  };

  const decline = (uid: string, minidapp: MDSPendingResponse['pending'][0]['minidapp']) => {
    setDisplayActionModal({ display: true, loading: true });

    declineAction(uid).then((response) => {
      refresh().then(() => {
        setDisplayActionModal({
          minidapp,
          deny: true,
          display: true,
          loading: false,
          message: JSON.stringify(response.params, null, 2),
        });
      });
    });
  };

  const value = {
    accept,
    decline,
    pendingData,
    displayActionModal,
    setDisplayActionModal,
  };

  return <appContext.Provider value={value}>{children}</appContext.Provider>;
};

export default AppProvider;
