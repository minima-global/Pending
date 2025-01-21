import * as React from 'react';
import { createContext, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { acceptAction, declineAction, get, getPendingActions, isLocked, isWriteMode, set } from './lib';
import { MDSPendingResponse } from './types';
import MaskData from 'maskdata';
import { mask } from './config';

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
  hideHelp: boolean;
  dismissHelp: () => void;
  displayVaultIsLocked: boolean;
  setDisplayVaultIsLocked: (state: boolean) => void;
  nodeLocked: boolean;
  commandDetails: Record<string, string> | null;
  setCommandDetails: (state: Record<string, string> | null) => void;
};

export const appContext = createContext<AppContext>({
  displayActionModal: null,
  setDisplayActionModal: () => null,
  pendingData: null,
  accept: async () => null,
  decline: async () => null,
  refresh: async () => null,
  clearAll: () => null,
  hideHelp: false,
  startInterval: () => null,
  stopInterval: () => null,
  appIsInWriteMode: false,
  dismissHelp: () => null,
  displayVaultIsLocked: false,
  setDisplayVaultIsLocked: () => null,
  nodeLocked: false,
  commandDetails: null,
  setCommandDetails: () => null,
});

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const loaded = useRef(false);
  const [nodeLocked, setNodeLocked] = useState(false);
  const [hideHelp, setHideHelp] = useState(true);
  const [runInterval, setRunInterval] = useState(true);
  const [pendingData, setPendingData] = useState<AppContext['pendingData']>(null);
  const [displayVaultIsLocked, setDisplayVaultIsLocked] = useState<boolean>(false);
  const [displayActionModal, setDisplayActionModal] = useState<AppContext['displayActionModal']>(null);
  const [appIsInWriteMode, setAppIsInWriteMode] = useState<boolean | null>(null);
  const [commandDetails, setCommandDetails] = useState<Record<string, string> | null>(null);

  // init mds
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;

      (window as any).MDS.init((evt: any) => {
        if (evt.event === 'inited') {
          get('HIDE_HELP').then(function (response) {
            if (response === '1') {
              setHideHelp(true);
            } else {
              setHideHelp(false);
            }
          });

          isLocked().then((response) => {
            setNodeLocked(response);
          });

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
        } else if (evt.event === 'NEWBLOCK') {
          isLocked().then((response) => {
            setNodeLocked(response);
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
      let finalResponse = response.response;

      if (finalResponse.params) {
        finalResponse.params = MaskData.maskJSON2(finalResponse.params, mask);
      }

      if (finalResponse.response) {
        finalResponse.response = MaskData.maskJSON2(finalResponse.response, mask);
      }

      return {
        response: finalResponse,
        command: JSON.stringify(finalResponse, null, 2),
      };
    });
  };

  const decline = async (uid: string) => {
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

  // hide help
  const dismissHelp = () => {
    set('HIDE_HELP', '1');
    setHideHelp(true);
  };

  const value = {
    accept,
    decline,
    clearAll,
    refresh,
    hideHelp,
    stopInterval,
    startInterval,
    pendingData,
    dismissHelp,
    appIsInWriteMode,
    displayActionModal,
    setDisplayActionModal,
    displayVaultIsLocked,
    setDisplayVaultIsLocked,
    nodeLocked,
    commandDetails,
    setCommandDetails,
  };

  return <appContext.Provider value={value}>{children}</appContext.Provider>;
};

export default AppProvider;
