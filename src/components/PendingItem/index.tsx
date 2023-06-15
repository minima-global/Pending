import { useContext, useEffect, useState } from 'react';
import { appContext } from '../../AppContext';
import Panel from '../../components/UI/Panel';
import Button from '../../components/UI/Button';

const DEFAULT_VIEW = 'DEFAULT_VIEW';
const APPROVE_VIEW = 'APPROVE_VIEW';
const DENY_VIEW = 'DENY_VIEW';
const APPROVE_RESULTS_VIEW = 'APPROVE_RESULTS_VIEW';
const DENY_RESULTS_VIEW = 'DENY_RESULTS_VIEW';

function PendingItem({ data, callback }: any) {
  const { accept, decline, refresh, startInterval, stopInterval } = useContext(appContext);
  const [view, setView] = useState(DEFAULT_VIEW);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [, setLocked] = useState(false);

  useEffect(() => {
    if (view !== DEFAULT_VIEW) {
      setView(DEFAULT_VIEW);
    }
  }, [data]);

  useEffect(() => {
    if (view === DEFAULT_VIEW) {
      startInterval();
    } else {
      stopInterval();
    }
  }, [view]);

  const showDefaultView = () => setView(DEFAULT_VIEW);
  const showConfirmApproveView = () => setView(APPROVE_VIEW);
  const showConfirmDenyView = () => setView(DENY_VIEW);

  const approveAction = async () => {
    try {
      stopInterval();
      setIsLoading(true);
      setLocked(true);
      const response = await accept(data!.uid);
      setOutput(response.command);
      setView(APPROVE_RESULTS_VIEW);
    } finally {
      setIsLoading(false);
      setLocked(false);
    }
  };

  const denyAction = async () => {
    try {
      stopInterval();
      setIsLoading(true);
      setLocked(true);
      const response = await decline(data!.uid);
      setOutput(response.params);
      setView(DENY_RESULTS_VIEW);
    } finally {
      setIsLoading(false);
      setLocked(false);
    }
  };

  const close = () => {
    refresh();
    startInterval();
    setView(DEFAULT_VIEW);

    if (callback) {
      callback();
    }
  };

  const safePassword = data.command.replace(/password:[^ ]+/gm, 'password:***');
  const commandHasPasswordParam = data.command.match(/password:[^ ]+/gm);

  return (
    <div className="flex flex-col h-full">
      {view === DEFAULT_VIEW && (
        <>
          <div className="flex-grow flex flex-col h-full p-5 text-center">
            <div className="flex items-stretch">
              <div className="flex items-center">
                <div
                  className="w-14 h-14 bg-cover rounded-lg mx-auto"
                  style={{
                    backgroundImage: `url(${(window as any).MDS.filehost}/${data.minidapp.uid}/${
                      data.minidapp.conf.icon
                    }), url('./app.png')`,
                  }}
                />
              </div>
              <div className="flex items-center text-left ml-4">
                <div>
                  <h5 className="text-2xl mb-1">{data.minidapp.conf.name}</h5>
                  <p className="text-sm text-core-grey-80 hidden">30 Sep 2023 13:00:07 GMT+01</p>
                </div>
              </div>
            </div>
            <div className="my-6 flex-grow">
              <div>
                <Panel title="Command" value={safePassword} mono copy={!commandHasPasswordParam} />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-full">
                <Button onClick={showConfirmDenyView} variant="secondary">
                  Deny
                </Button>
              </div>
              <div className="w-full">
                <Button onClick={showConfirmApproveView}>Approve</Button>
              </div>
            </div>
          </div>
        </>
      )}
      {view === DENY_VIEW && (
        <>
          <div className="flex-grow flex flex-col h-full p-5 text-center">
            <div className="text-xl mb-4">Deny command?</div>
            <p className="mb-6">Are you sure you want to deny and remove this pending command?</p>
            <div className="flex-grow">
              <div>
                <Panel title="Command" value={safePassword} mono copy={!commandHasPasswordParam} />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {!isLoading && (
                <Button onClick={showDefaultView} variant="secondary">
                  Cancel
                </Button>
              )}
              <Button loading={isLoading} onClick={denyAction}>
                Deny
              </Button>
            </div>
          </div>
        </>
      )}
      {view === DENY_RESULTS_VIEW && (
        <>
          <div className="flex-grow flex flex-col h-full p-5 text-center">
            <div className="text-xl mb-3">Command denied</div>
            <h5 className="mb-6 text-core-grey-80">{data.minidapp.conf.name}</h5>
            {output && (
              <div className="flex-grow">
                <div>
                  <Panel title="Response" copy>
                    <textarea
                      readOnly
                      className="h-full bg-core-black-100 w-full resize-none custom-scrollbar lg:min-h-[250px]"
                      rows={4}
                      value={JSON.stringify(output, null, 2)}
                    />
                  </Panel>
                </div>
              </div>
            )}
            <div>
              <div className="flex w-full mt-4 gap-3">
                <Button onClick={close} variant="secondary">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {view === APPROVE_VIEW && (
        <>
          <div className="flex-grow flex flex-col h-full p-5 text-center">
            <div className="text-xl mb-4">Approve command?</div>
            <p className="mb-6">Are you sure you want to accept and run this pending command?</p>
            <div className="flex-grow text-left">
              <div>
                <Panel title="Command" value={safePassword} mono copy={!commandHasPasswordParam} />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {!isLoading && (
                <Button onClick={showDefaultView} variant="secondary">
                  Cancel
                </Button>
              )}
              <Button loading={isLoading} onClick={approveAction}>
                Approve
              </Button>
            </div>
          </div>
        </>
      )}
      {view === APPROVE_RESULTS_VIEW && (
        <>
          <div className="flex-grow flex flex-col h-full p-5 text-center">
            <div className="text-xl mb-3">Command approved</div>
            <h5 className="mb-4 text-core-grey-80">{data.minidapp.conf.name}</h5>
            {output && (
              <div className="flex-grow mb-4">
                <Panel title="Response" copy>
                  <textarea
                    readOnly
                    className="h-full bg-core-black-100 w-full resize-none custom-scrollbar lg:min-h-[250px]"
                    rows={4}
                    value={output}
                  />
                </Panel>
              </div>
            )}
            <div>
              <div className="flex w-full gap-3">
                <Button onClick={close} variant="secondary">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PendingItem;
