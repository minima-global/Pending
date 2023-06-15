import * as React from 'react';
import { createContext, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { acceptAction, declineAction, getPendingActions, isWriteMode } from './lib';
import { MDSPendingResponse } from './types';
import MaskData from 'maskdata';
import { maskMdsCommand, maskVaultCommand, maskVaultSetCommand } from './config';

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
  refresh: () => Promise<any>;
  accept: (uid: string) => Promise<any>;
  decline: (uid: string) => Promise<any>;
  clearAll: () => void;
  pendingData: MDSPendingResponse['pending'] | null;
  startInterval: () => void;
  stopInterval: () => void;
  appIsInWriteMode: boolean | null;
};

export const appContext = createContext<AppContext>({
  displayActionModal: null,
  setDisplayActionModal: () => null,
  pendingData: null,
  accept: async () => null,
  decline: async () => null,
  refresh: async () => null,
  clearAll: () => null,
  startInterval: () => null,
  stopInterval: () => null,
  appIsInWriteMode: false,
});

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const loaded = useRef(false);
  const [runInterval, setRunInterval] = useState(true);
  const [pendingData, setPendingData] = useState<AppContext['pendingData']>(null);
  const [displayActionModal, setDisplayActionModal] = useState<AppContext['displayActionModal']>(null);
  const [appIsInWriteMode, setAppIsInWriteMode] = useState<boolean | null>(null);

  // init mds
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;

      (window as any).MDS.init((evt: any) => {
        if (evt.event === 'inited') {
          // check if app is in write mode and let the rest of the
          // app know if it is or isn't
          isWriteMode().then((appIsInWriteMode) => {
            if (appIsInWriteMode) {
              getPendingActions().then((pendingActionsResponse) => {
                setPendingData(pendingActionsResponse.pending);
              });
            }

            setAppIsInWriteMode(appIsInWriteMode);
          });
        }
      });
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded && runInterval && appIsInWriteMode) {
      const interval = setInterval(() => {
        getPendingActions().then((pendingActionsResponse) => {
          setPendingData(pendingActionsResponse.pending);
        });
      }, 5000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [loaded, appIsInWriteMode, runInterval]);

  const refresh = () => {
    return getPendingActions().then((pendingActionsResponse) => {
      setPendingData(pendingActionsResponse.pending);
    });
  };

  const accept = async (uid: string) => {
    return acceptAction(uid).then((response) => {
      let maskCommand = {};

      console.log(response.response);

      if (response.command === 'mds') {
        maskCommand = maskMdsCommand;
      }

      if (response.response.command === 'vault') {
        console.log('hello');
        maskCommand = maskVaultCommand;
      }

      if (
        response.response.command === 'vault' &&
        response.response && response.response.params && response.response.params.action &&
        ['passwordlock', 'passwordunlock'].includes(response.response.params.action)
      ) {
        maskCommand = maskVaultSetCommand;
      }


      return {
        command: JSON.stringify(MaskData.maskJSON2(response.response, maskCommand), null, 2),
      };
    });
  };

  const decline = (uid: string) => {
    return declineAction(uid).then((response) => {
      return {
        params: response.params,
      };
    });
  };

  const clearAll = async () => {
    setDisplayActionModal({ display: true, loading: true });
    const pendingActionsResponse = await getPendingActions();
    await Promise.all(pendingActionsResponse.pending.map((i) => declineAction(i.uid)));
    refresh();
    setDisplayActionModal({ display: true, loading: false, cleared: true });
  };

  /**
   * Use these two methods to stop/start the interval that retrives pending
   * actions, this is useful for UI that should stay on the screen until it does something
   * or else a pending action can disappear once you approve / deny an item and the UI
   * just disappears
   */
  const startInterval = () => setRunInterval(true);
  const stopInterval = () => setRunInterval(false);

  const value = {
    accept,
    decline,
    clearAll,
    refresh,
    stopInterval,
    startInterval,
    pendingData,
    appIsInWriteMode,
    displayActionModal,
    setDisplayActionModal,
  };

  return <appContext.Provider value={value}>{children}</appContext.Provider>;
};

export default AppProvider;
