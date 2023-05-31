import * as React from 'react';
import { createContext, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { acceptAction, declineAction, getPendingActions } from './lib';
import { MDSPendingResponse } from './types';
import MaskData from 'maskdata';
import { maskMdsCommand, maskParamCommand, maskVaultCommand } from './config';

type AppContext = {
  displayActionModal: {
    minidapp?: MDSPendingResponse['pending'][0]['minidapp'];
    accept?: boolean;
    deny?: boolean;
    cleared?: boolean;
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
  clearAll: () => void;
  pendingData: MDSPendingResponse['pending'] | null;
};

export const appContext = createContext<AppContext>({
  displayActionModal: null,
  setDisplayActionModal: () => null,
  pendingData: null,
  accept: () => null,
  decline: () => null,
  clearAll: () => null,
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
        let maskCommand = {};

        if (response.command === 'mds') {
          maskCommand = maskMdsCommand;
        } else if (response.command === 'vault') {
          maskCommand = maskVaultCommand;
        }

        setDisplayActionModal({
          minidapp,
          accept: true,
          display: true,
          loading: false,
          message: JSON.stringify(MaskData.maskJSON2(response.params, maskParamCommand), null, 2),
          response: JSON.stringify(MaskData.maskJSON2(response.response, maskCommand), null, 2),
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

  const clearAll = async () => {
    setDisplayActionModal({ display: true, loading: true });
    const pendingActionsResponse = await getPendingActions();
    await Promise.all(pendingActionsResponse.pending.map((i) => declineAction(i.uid)));
    refresh();
    setDisplayActionModal({ display: true, loading: false, cleared: true });
  };

  const value = {
    accept,
    decline,
    clearAll,
    pendingData,
    displayActionModal,
    setDisplayActionModal,
  };

  return <appContext.Provider value={value}>{children}</appContext.Provider>;
};

export default AppProvider;
