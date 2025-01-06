import { useContext, useEffect, useState } from 'react';
import { appContext } from '../../AppContext';
import Panel from '../../components/UI/Panel';
import Button from '../../components/UI/Button';
import VaultLockModal from '../VaultLockModal';
import { tokenInfo } from '../../lib';

const DEFAULT_VIEW = 'DEFAULT_VIEW';
const APPROVE_VIEW = 'APPROVE_VIEW';
const DENY_VIEW = 'DENY_VIEW';
const APPROVE_RESULTS_VIEW = 'APPROVE_RESULTS_VIEW';
const DENY_RESULTS_VIEW = 'DENY_RESULTS_VIEW';

function PendingItem({ data, callback }: any) {
  const { nodeLocked, accept, decline, refresh, dismissHelp, startInterval, stopInterval, setDisplayVaultIsLocked } =
    useContext(appContext);
  const [view, setView] = useState(DEFAULT_VIEW);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [response, setResponse] = useState<any>({});
  const [, setLocked] = useState(false);
  const [commandDetails, setCommandDetails] = useState<Record<string, string> | null>(null);
  const [showMore, setShowMore] = useState(false);

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

  const showConfirmApproveView = () => {
    dismissHelp();
    setView(APPROVE_VIEW);
  };
  const showConfirmDenyView = () => {
    dismissHelp();
    setView(DENY_VIEW);
  };

  const approveAction = async () => {
    if (
      // node is locked
      nodeLocked &&
      // command does not include password
      !data.command.includes('password:') &&
      // command is one of the following &&
      /send|sendpoll|multisig|tokencreate|consolidate/gi.test(data.command)
    ) {
      return setDisplayVaultIsLocked(true);
    }

    try {
      stopInterval();
      setIsLoading(true);
      setLocked(true);
      setResponse(null);
      const response = await accept(data!.uid);
      setOutput(response.command);
      setResponse(response.response);
      setView(APPROVE_RESULTS_VIEW);
    } finally {
      setIsLoading(false);
      setLocked(false);
    }
  };

  const nodeUnlockedCallback = async () => {
    try {
      stopInterval();
      setIsLoading(true);
      setLocked(true);
      setResponse(null);
      const response = await accept(data!.uid);
      setOutput(response.command);
      setResponse(response.response);
      setView(APPROVE_RESULTS_VIEW);
      return true;
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

  const safePassword = data.command
    .replace(/phrase:[^ ]+/gm, 'phrase:***')
    .replace(/confirm:[^ ]+/gm, 'confirm:***')
    .replace(/password:[^ ]+/gm, 'password:***');

  // any of these params in the command means we disable the copy button
  const commandHasPasswordParam =
    data.command.match(/phrase:[^ ]+/gm) ||
    data.command.match(/confirm:[^ ]+/gm) ||
    data.command.match(/password:[^ ]+/gm);

  useEffect(() => {
    (async () => {
      const organisedParams: Record<string, string> = {};
      const command = data.command ? data.command.split(' ')[0] : false;
      data.command && data.command.split(' ').map((element, index) => {
        if (index > 0) {
          organisedParams[element.split(':')[0]] = element.split(':').slice(1).join(':');
        }
      });

      if (command === 'send') {
        if (organisedParams.tokenid) {
          const token = await tokenInfo(organisedParams.tokenid);

          if (typeof token.name === 'string') {
            organisedParams.tokenname = token.name;
          }

          if (typeof token.token === 'object') {
            organisedParams.tokenname = token.token.name;
          }
        } else {
          organisedParams.tokenname = 'Minima';
        }
      }

      setCommandDetails({
        command,
        ...organisedParams,
      });
    })();
  }, [data]);

  const renderMessage = () => {
    if (commandDetails?.command === 'send') {
      return (
        <div>
          {!commandDetails.multi && <div>You are about to send <strong>{commandDetails.amount}</strong> <strong>{commandDetails.tokenname}</strong> to <strong>{commandDetails.address}</strong>.</div>}
          {commandDetails.multi && <div>
            You are about to send to multiple addresses:
            <ul className="list-disc ml-4 text-gray-400 break-all">
              {JSON.parse(commandDetails.multi).map((multi: string) => {
                const address = multi.split(':')[0];
                const amount = multi.split(':')[1];
                return (
                  <li><strong>{amount}</strong> {commandDetails.tokenname} to <strong>{address}</strong></li>
                )
              })}
            </ul>
          </div>}
          {commandDetails.burn && <div className="mt-2">This transaction will burn <strong>{commandDetails.burn}</strong> Minima.</div>}
          <div className="mt-2">Only accept if you wish to proceed.</div>
        </div>
      )
    }

    if (commandDetails?.command === 'sendpoll' && commandDetails.action === 'add') {
      return (
        <div>
          {!commandDetails.multi && <div>You are about to send <strong>{commandDetails.amount}</strong> <strong>{commandDetails.tokenname}</strong> to <strong>{commandDetails.address}</strong>.</div>}
          {commandDetails.multi && <div>
            You are about to send to multiple addresses:
            <ul className="list-disc ml-4 text-gray-400 break-all">
              {JSON.parse(commandDetails.multi).map((multi: string) => {
                const address = multi.split(':')[0];
                const amount = multi.split(':')[1];
                return (
                  <li><strong>{amount}</strong> {commandDetails.tokenname} to <strong>{address}</strong></li>
                )
              })}
            </ul>
          </div>}
          {commandDetails.burn && <div className="mt-2">This transaction will burn <strong>{commandDetails.burn}</strong> Minima.</div>}
          <div className="mt-2">If you do not currently have funds available, this transaction will be reattempted every 30 seconds. Only accept if you wish to proceed.</div>
        </div>
      )
    }

    if (commandDetails?.command === 'sendpoll' && commandDetails.action === 'list') {
      return (
        <div>
          <div>This will show all transactions from your node that are currently waiting to be sent.</div>
        </div>
      )
    }

    if (commandDetails?.command === 'sendpoll' && commandDetails.action === 'remove') {
      return (
        <div>
          <div>This will remove the transaction with unique id: <strong>{commandDetails.uid}</strong> from the list of transactions waiting to be sent.</div>
        </div>
      )
    }

    if (commandDetails?.command === 'cointrack' && commandDetails.enable === 'true') {
      return (
        <div>
          Your node will monitor when the coin with coin ID <strong>{commandDetails.coinid}</strong> moves on-chain.
        </div>
      )
    }


    if (commandDetails?.command === 'cointrack' && commandDetails.enable === 'false') {
      return (
        <div>
          Your node will no longer monitor when the coin with coin ID <strong>{commandDetails.coinid}</strong> moves on-chain.
        </div>
      )
    }

    if (commandDetails?.command === 'multisig' && commandDetails.action === 'create') {
      return (
        <div>
          <div>
            <div className="mb-2">You are about to create a new coin that will require multiple signatures to spend. It will be created with the following details:</div>
            <ul className="list-disc ml-4 text-gray-400">
              <li>Transaction ID: <strong>{commandDetails.id}</strong></li>
              <li>
                Public Keys:
                <ol className="list-decimal	 ml-8">
                  {commandDetails.publickeys && JSON.parse(commandDetails.publickeys).map((publicKey) => <li className="font-bold">{publicKey.slice(0, 8)}...{publicKey.slice(-32)}</li>)}
                </ol>
              </li>
              <li>Required signatures: <strong>{commandDetails.required}</strong></li>
              {commandDetails.root && (
                <li>The multi signature threshold requirement can be overridden with this root key: <strong>{commandDetails.root}</strong></li>
              )}
            </ul>
          </div>
        </div>
      )
    }


    if (commandDetails?.command === 'multisig' && commandDetails.action === 'getkey') {
      return (
        <div>
          <div>
            <div>This will return one of your public keys.</div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'multisig' && commandDetails.action === 'list' && !commandDetails.id) {
      return (
        <div>
          <div>
            <div>This will return a list of all the multi signature coins for which you are a signer.</div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'multisig' && commandDetails.action === 'list' && commandDetails.id) {
      return (
        <div>
          <div>
            <div>This will return a list of the multi signature coins with id: <strong>{commandDetails.id}</strong></div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'multisig' && commandDetails.action === 'spend' && commandDetails.id) {
      return (
        <div>
          <div>
            <div>You are about to create an unsigned transaction file to spend a <strong>{commandDetails.amount}</strong> from the multi-signature coin with ID: <strong>{commandDetails.id}</strong>.</div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'multisig' && commandDetails.action === 'spend' && !commandDetails.id && commandDetails.coinid) {
      return (
        <div>
          <div>
            <div>You are about to create an unsigned transaction file to spend a <strong>{commandDetails.amount}</strong> from the multi-signature coin with coin id: <strong>{commandDetails.coinid}</strong>.</div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'multisig' && commandDetails.action === 'sign') {
      return (
        <div>
          <div>
            <div>You are about to post the transaction provided in the file: <strong>{commandDetails.file}</strong>. This transaction will be sent to the network.</div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'multisig' && commandDetails.action === 'view' && commandDetails.file) {
      return (
        <div>
          <div>
            <div>You are about to view the transaction provided in the file: <strong>{commandDetails.file}</strong>.</div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'sign' && commandDetails.publickey) {
      return (
        <div>
          <div>
            <div>You are about to sign data with the following public key: <strong>{commandDetails.publickey}</strong>.</div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'consolidate') {
      return (
        <div>
          <div>
            <div>You are about to consolidate multiple <strong>{commandDetails.tokenid}</strong> coins into one by sending them back to yourself. This requires at least 3 coins as inputs. This transaction will burn <strong>{commandDetails.burn}</strong> Minima.</div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'tokencreate') {
      return (
        <div>
          <div>
            <div className="mb-2">You are about to mint a new NFT with the following attributes:</div>
            <ul className="list-disc list-inside">
              <li>Name: <strong>{commandDetails.name}</strong></li>
              <li>Supply: <strong>{commandDetails.amount}</strong></li>
              {commandDetails.decimals && commandDetails.decimals !== '0' && <li>Decimal places: <strong>{commandDetails.decimals}</strong></li>}
              {commandDetails.script && <li>Script: <strong>{commandDetails.script}</strong></li>}
              {commandDetails.webvalidate && <li>Web validation URL: <strong>{commandDetails.webvalidate}</strong></li>}
            </ul>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'txnsign') {
      return (
        <div>
          <div>
            <div className="mb-2">You are about to sign a transaction with the following details:</div>
            <ul className="list-disc list-inside">
              <li>Transaction ID: <strong>{commandDetails.id}</strong></li>
              <li>Public Key: <strong>{commandDetails.publickey}</strong></li>
            </ul>
          </div>
        </div>
      )
    }

    return null;
  }

  const renderShowMore = () => {
    if (commandDetails?.command === 'txnsign') {
      return (
        <div>
          {showMore && (
            <div>
              <ul className="list-disc list-inside">
                {commandDetails.txnpostauto && <li>This transaction will be posted immediately after signing.</li>}
                {commandDetails.txnpostburn && <li>This transaction will burn <strong>{commandDetails.txnpostburn}</strong> Minima</li>}
                {commandDetails.txnpostmine && <li>This transaction will be mined and posted immediately after signing.</li>}
                {commandDetails.txndelete && <li>This transaction will be deleted after posting.</li>}
              </ul>
            </div>
          )}
        </div>
      )
    }

    if (commandDetails?.command === 'consolidate' && (commandDetails.coinage || commandDetails.maxcoins || commandDetails.maxsigs)) {
      return (
        <div>
          {showMore && (
            <div>
              <ul className="mt-2 list-disc list-inside">
                {commandDetails.coinage && <li>This transaction will only consolidate coins older than <strong>{commandDetails.coinage}</strong> blocks</li>}
                {commandDetails.maxcoins && <li>This transaction will only consolidate a maximum of <strong>{commandDetails.maxcoins}</strong> coins</li>}
                {commandDetails.maxsigs && <li>This transaction will include a maximum of <strong>{commandDetails.maxsigs}</strong> signatures</li>}
              </ul>
            </div>
          )}
        </div>
      )
    }

    if (commandDetails?.command === 'send' && (commandDetails.fromaddress || commandDetails.split || commandDetails.password || commandDetails.state)) {
      return (
        <div>
          {showMore && (
            <div className="mt-2">
              <ul className="list-disc list-inside">
                {commandDetails.fromaddress && <li>This will be sent from the address: <strong>{commandDetails.fromaddress}</strong>.</li>}
                {commandDetails.split && !commandDetails.multi && <li>The amount will be split into <strong>{commandDetails.split}</strong> units.</li>}
                {commandDetails.split && commandDetails.multi && <li>The amounts will be split into <strong>{commandDetails.split}</strong> units.</li>}
                {commandDetails.password && <li>A password has been provided.</li>}
                {commandDetails.state &&
                  <li>This transaction includes custom state variables:
                    <ul className="ml-4 list-disc list-inside">
                      {(Object.entries(JSON.parse(commandDetails.state)) as string[][]).map((item) => <li>{item[0]}: {item[1]}</li>)}
                    </ul>
                  </li>
                }
              </ul>
            </div>
          )}
        </div>
      )
    }

    if (commandDetails?.command === 'sendpoll' && (commandDetails.fromaddress || commandDetails.split || commandDetails.password || commandDetails.state)) {
      return (
        <div>
          {showMore && (
            <div className="mt-2">
              <ul className="list-disc list-inside">
                {commandDetails.fromaddress && <li>This will be sent from the address: <strong>{commandDetails.fromaddress}</strong>.</li>}
                {commandDetails.split && !commandDetails.multi && <li>The amount will be split into <strong>{commandDetails.split}</strong> units.</li>}
                {commandDetails.split && commandDetails.multi && <li>The amounts will be split into <strong>{commandDetails.split}</strong> units.</li>}
                {commandDetails.password && <li>A password has been provided.</li>}
                {commandDetails.state &&
                  <li>This transaction includes custom state variables:
                    <ul className="ml-4 list-disc list-inside">
                      {(Object.entries(JSON.parse(commandDetails.state)) as string[][]).map((item) => <li>{item[0]}: {item[1]}</li>)}
                    </ul>
                  </li>
                }
              </ul>
            </div>
          )}
        </div>
      )
    }

    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <VaultLockModal callback={nodeUnlockedCallback} />
      {view === DEFAULT_VIEW && (
        <>
          <div className="flex-grow flex flex-col h-full p-5 text-center">
            <div className="flex items-stretch">
              <div className="flex items-center">
                <div
                  className="w-14 h-14 bg-cover rounded-lg mx-auto"
                  style={{
                    backgroundImage: `url(${(window as any).MDS.filehost}/${data.minidapp.uid}/${data.minidapp.conf.icon
                      }), url('./assets/app.png')`,
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
            {renderMessage() && (
              <div>
                <div className="bg-core-black-contrast text-sm text-white text-left mt-4 pt-2.5 pb-2 px-2 rounded-t">
                  <div className="grid grid-cols-2">
                    <div className="col-span-1 flex items-center pl-2">
                      Command
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {renderShowMore() && (
                        <div onClick={() => setShowMore(!showMore)} className="text-xs cursor-pointer bg-[#26292c] py-1 px-2 rounded-md w-fit flex">
                          <svg className={`w-4 h-4 -ml-0.5 mr-1 transition-all ${showMore ? "rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                          {!showMore ? "Show more" : "Show less"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-black py-4 px-5 text-left text-sm rounded-b">{renderMessage()}{renderShowMore()}</div>
              </div>
            )}
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
                  <Panel title="Response" copy value={output}>
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
            {response && response.status && (
              <div className="mb-3">
                <div className="flex gap-3 bg-lime-500 text-black font-bold w-full text-left p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-check-circle"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  The command was successful
                </div>
              </div>
            )}
            {response && !response.status && (
              <div className="mb-3 text-white">
                <div className="flex gap-3 bg-red-600 font-bold w-full text-left p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  The command failed
                </div>
                <div className="text-sm flex gap-3 mb-4 bg-red-800 font-bold w-full text-left p-3">
                  {response.error}
                </div>
              </div>
            )}
            {output && (
              <div className="flex-grow mb-4">
                <Panel title="Response" copy value={output}>
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
