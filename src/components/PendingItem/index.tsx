import { useContext, useEffect, useState } from 'react';
import { appContext } from '../../AppContext';
import Panel from '../../components/UI/Panel';
import Button from '../../components/UI/Button';
import VaultLockModal from '../VaultLockModal';
import { getScript, tokenInfo } from '../../lib';
import Decimal from 'decimal.js';

const DEFAULT_VIEW = 'DEFAULT_VIEW';
const APPROVE_VIEW = 'APPROVE_VIEW';
const DENY_VIEW = 'DENY_VIEW';
const APPROVE_RESULTS_VIEW = 'APPROVE_RESULTS_VIEW';
const DENY_RESULTS_VIEW = 'DENY_RESULTS_VIEW';

Decimal.set({ precision: 44 });

function PendingItem({ data, callback }: any) {
  const { nodeLocked, accept, decline, refresh, dismissHelp, startInterval, stopInterval, setDisplayVaultIsLocked, commandDetails, setCommandDetails } =
    useContext(appContext);
  const [view, setView] = useState(DEFAULT_VIEW);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [response, setResponse] = useState<any>({});
  const [, setLocked] = useState(false);
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
      /send|sign|sendpoll|multisig|tokencreate|consolidate/gi.test(data.command)
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
    .replace(/\sphrase:[^ ]+/gm, ' phrase:***')
    .replace(/\sconfirm:[^ ]+/gm, ' confirm:***')
    .replace(/\spassword:[^ ]+/gm, ' password:***');

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

      if (command === 'send' || command === 'sendpoll' || command === 'multisig') {
        if (organisedParams.tokenid) {
          const token = await tokenInfo(organisedParams.tokenid);

          if (token && typeof token.name === 'string') {
            organisedParams.tokenname = token.name;
          }

          if (token && typeof token.token === 'object') {
            organisedParams.tokenname = token.token.name;
          }

          if (!token) {
            organisedParams.tokenname = `tokenid:${organisedParams.tokenid}`;
          }
        } else {
          organisedParams.tokenname = 'Minima';
        }
      }

      if (command === 'removescript') {
        const script = await getScript(organisedParams.address);

        if (script) {
          organisedParams.script = script;
        }
      }

      if (data.command && data.command.includes('name:')) {
        const nameValue = data.command.substring(data.command.indexOf('{'), data.command.lastIndexOf('}') + 1);

        try {
          const JSONNameValue = JSON.parse(nameValue);
          organisedParams.name = JSONNameValue.name;
        } catch (e) {
          // do nothing if errors
        }
      }

      if (data.command && data.command.includes('multi:')) {
        const multi = data.command.substring(data.command.indexOf('['), data.command.indexOf(']') + 1);

        try {
          organisedParams.multi = multi;
        } catch (e) {
          organisedParams.multi = '';
        }
      }

      setCommandDetails({
        command,
        ...organisedParams,
      });
    })();
  }, [data]);

  const calculateMinimaWhenCreatingToken = (amount: string, decimals: string) => {
    const finalisedAmount = amount.replace(/^"|"$/g, '');
    const finalisedDecimals = decimals.replace(/^"|"$/g, '');
    const base = new Decimal(0.00000000000000000000000000000000000000000001);
    const result = base.mul((10 ** Number(finalisedDecimals) * Number(finalisedAmount)));
    return result.toString();
  }

  // if it fails to parse name to json, then just render the name as it is a string
  const renderTokenName = (name: string) => {
    try {
      const nameObject: Record<string, string> = JSON.parse(name.replace(/^"|"$/g, ''));

      return (
        <>
          {Object.entries(nameObject).map(([key, value]) => {
            if (!value) {
              return null;
            }

            return <li key={key}><span className="capitalize">{key}</span>: <strong>{value.length > 128 ? `${value.slice(0, 125)}...` : value}</strong></li>;
          })}
        </>
      )
    } catch (e) {
      return <li>Name: <strong>{name.toString()}</strong></li>;
    }
  }

  const isNameJsonAndHasValidWebValidateValue = (name: string) => {
    try {
      const nameObject: Record<string, string> = JSON.parse(name.replace(/^"|"$/g, ''));

      return !!nameObject.webvalidate;
    } catch (e) {
      return false;
    }
  }

  const renderMulti = (multi: string) => {
    try {
      if (!commandDetails) {
        return null;
      }

      const multiArray = JSON.parse(multi);
      return multiArray.map((multi: string) => {
        const address = multi.split(':')[0];
        const amount = multi.split(':')[1];
        return <li key={multi}><strong>{amount}</strong> {commandDetails.tokenname} to <strong>{address}</strong></li>;
      });
    } catch (e) {
      return <li>"There is an unknown error with the displaying the multi command</li>;
    }
  }

  const renderMessage = () => {
    if (commandDetails?.command === 'send') {
      return (
        <div>
          {!commandDetails.multi && <div className="break-all">You are about to send <strong>{commandDetails.amount}</strong> <strong>{commandDetails.tokenname}</strong> to <strong>{commandDetails.address}</strong>.</div>}
          {commandDetails.multi && <div className="break-words">
            You are about to send <strong>{commandDetails.tokenname}</strong> to multiple addresses:
            <ul className="mt-2 list-disc ml-4 text-gray-400 break-all">
              {renderMulti(commandDetails.multi)}
            </ul>
          </div>}
          {commandDetails.burn && <div className="mt-2">This transaction will burn <strong>{commandDetails.burn}</strong> Minima.</div>}
          <div className="mt-2">Only approve if you wish to proceed.</div>
        </div>
      )
    }

    if (commandDetails?.command === 'sendpoll' && commandDetails.action === 'add') {
      return (
        <div>
          {!commandDetails.multi && <div className="break-all">You are about to send <strong>{commandDetails.tokenname}</strong> to <strong>{commandDetails.address}</strong>.</div>}
          {commandDetails.multi && <div className="break-words">
            You are about to send <strong>{commandDetails.tokenname}</strong> to multiple addresses:
            <ul className="mt-2 list-disc ml-4 text-gray-400 break-all">
              {renderMulti(commandDetails.multi)}
            </ul>
          </div>}
          {commandDetails.burn && <div className="mt-2">This transaction will burn <strong>{commandDetails.burn}</strong> Minima.</div>}
          <div className="mt-2">If you do not currently have funds available, this transaction will be reattempted every 30 seconds. Only approve if you wish to proceed.</div>
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
          The coin with coin ID <strong>{commandDetails.coinid}</strong> will be added to your node. Your node will monitor when this coin moves on-chain.
        </div>
      )
    }


    if (commandDetails?.command === 'cointrack' && commandDetails.enable === 'false') {
      return (
        <div>
          The coin with coin ID <strong>{commandDetails.coinid}</strong> will be removed from your node. Your node will not monitor when this coin moves on-chain.
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

    if (commandDetails?.command === 'vault') {
      return (
        <div>
          <div>Running this command will return and expose your 24 word seed phrase to the
            app that requested it. <strong>USE WITH CAUTION.</strong></div>
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
            <div>You are about to create an unsigned transaction file to spend <strong>{commandDetails.amount}</strong> <strong>{commandDetails.tokenname}</strong> from the multi-signature coin with ID: <strong>{commandDetails.id}</strong>.</div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'multisig' && commandDetails.action === 'spend' && !commandDetails.id && commandDetails.coinid) {
      return (
        <div>
          <div>
            <div>You are about to create an unsigned transaction file to spend <strong>{commandDetails.amount}</strong> <strong>{commandDetails.tokenname}</strong> from the multi-signature coin with the coin id: <strong>{commandDetails.coinid}</strong>.</div>
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
            <div className="break-all">You are about to sign data with the following public key: <strong>{commandDetails.publickey}</strong>.</div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'consolidate') {
      return (
        <div>
          <div>
            <div>You are about to consolidate multiple coins with tokenid: <strong>{commandDetails.tokenid}</strong> by sending them back to yourself. This requires at least 3 coins as inputs.</div>
            {commandDetails.burn && <div className="mt-2">This transaction will burn <strong>{commandDetails.burn}</strong> Minima.</div>}
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'mds') {
      if (commandDetails.action === 'list') {
        return (
          <div>
            <div>
              This will return sensitive information including the password required for logging in to your MiniDapp System and list your installed MiniDapps.
            </div>
          </div>
        )
      }

      if (commandDetails.action === 'install' && commandDetails.file) {
        return (
          <div>
            <div>
              You are about to install the following MiniDapp: <strong>{commandDetails.file}</strong>
            </div>
            {(!commandDetails.trust || commandDetails.trust === 'read') && <div className="mt-2">The MiniDapp will be given <strong>READ</strong> only permission to your node and wallet (recommended).</div>}
            {commandDetails.trust === 'write' && <div className="mt-2">The MiniDapp will be given <strong>WRITE</strong> permission to your node and wallet (not recommended).</div>}
          </div>
        )
      }

      if (commandDetails.action === 'update' && commandDetails.file) {
        return (
          <div>
            <div>You are about to update the MiniDapp with uid: <strong>{commandDetails.uid}</strong>, with the following file: <strong>{commandDetails.file}</strong>.</div>
          </div>
        )
      }

      if (commandDetails.action === 'uninstall') {
        return (
          <div>
            <div>You are about to uninstall the MiniDapp with uid: <strong>{commandDetails.uid}</strong>. This will remove all its saved contents and may affect your ability to access some or all of your assets.</div>
          </div>
        )
      }

      if (commandDetails.action === 'download') {
        if (commandDetails.folder) {
          return (
            <div>
              <div>You are about to download the MiniDapp with uid: <strong>{commandDetails.uid}</strong>. It will be saved in the following folder: <strong>{commandDetails.folder}</strong></div>
            </div>
          )
        }

        if (commandDetails.locationonly === 'true') {
          return (
            <div>
              <div>You are about to display the location of the MiniDapp with uid: <strong>{commandDetails.uid}</strong>.</div>
            </div>
          )
        }

        return (
          <div>
            <div>You are about to download the MiniDapp with uid: <strong>{commandDetails.uid}</strong>. It will be saved locally in your node's base folder location.</div>
          </div>
        )
      }

      if (commandDetails.action === 'pending') {
        return (
          <div>
            <div>You are about to list all Pending commands waiting to be accepted or denied.</div>
          </div>
        )
      }

      if (commandDetails.action === 'accept') {
        return (
          <div>
            <div>You are about to approve the Pending command with uid: <strong>{commandDetails.uid}</strong>.</div>
          </div>
        )
      }

      if (commandDetails.action === 'deny') {
        return (
          <div>
            <div>You are about to deny the Pending command with uid: <strong>{commandDetails.uid}</strong>.</div>
          </div>
        )
      }

      if (commandDetails.action === 'permission') {
        return (
          <div>
            <div>You are about to change the permission for the MiniDapp with uid <strong>{commandDetails.uid}</strong> to <strong>{commandDetails.trust === 'read' ? 'READ' : 'WRITE'}</strong>.</div>
            {commandDetails.trust === 'read' && <div className="mt-2">The MiniDapp will be given <strong>READ</strong> only permission to your node and wallet (recommended).</div>}
            {commandDetails.trust === 'write' && <div className="mt-2">The MiniDapp will be given <strong>WRITE</strong> permission to your node and wallet (not recommended).</div>}
          </div>
        )
      }

      if (commandDetails.action === 'publicmds') {
        return (
          <div>
            <div>You are about to <strong>{commandDetails.enable === 'true' ? 'ENABLE' : 'DISABLE'}</strong> your Public MiniDapp system.</div>
            {commandDetails.enable === 'true' && <div className="mt-2">You may only enable Public MDS if your node is fully configured as a Mega MMR node with the -megammr start up parameter.</div>}
          </div>
        )
      }

      return (
        <div>
          <div>This will return sensitive information including the password required for logging in to your MiniDapp System and list your installed MiniDapps.</div>
        </div>
      )
    }

    if (commandDetails?.command === 'seedrandom') {
      return (
        <div>
          <div>You are about to generate a random value, based on your seed and the following modifier: <strong>{commandDetails.modifier}</strong></div>
        </div>
      )
    }

    if (commandDetails?.command === 'quit') {
      if (commandDetails.compact === 'true') {
        return (
          <div>
            <div>You are about to shutdown your node and compact the databases. Please
              ensure you have a copy of your seed phrase and a backup of your node before
              shutting down.</div>
          </div>
        )
      }
      return (
        <div>
          <div>You are about to shutdown your node. Please ensure you have a copy of your seed phrase and a backup of your node before shutting down.</div>
        </div>
      )
    }

    if (commandDetails?.command === 'tokencreate') {
      const decimals = commandDetails.decimals.toString().replace(/"/g, '');
      const amount = commandDetails.amount.toString().replace(/"/g, '');
      return (
        <div>
          <div>
            <div className="mb-2">You are about to mint a new {commandDetails.decimals === '0' ? 'NFT' : 'token'} with the following attributes:</div>
            <ul className="list-disc list-inside break-all">
              {renderTokenName(commandDetails.name)}
              <li>Supply: <strong>{amount}</strong></li>
              {commandDetails.decimals && commandDetails.decimals !== '0' && <li>Decimal places: <strong>{decimals}</strong></li>}
              {commandDetails.script && <li>Script: <strong>{commandDetails.script}</strong></li>}
              {commandDetails.webvalidate && !isNameJsonAndHasValidWebValidateValue(commandDetails.name) && <li>Web validation URL: <strong>{commandDetails.webvalidate}</strong></li>}
            </ul>
            <div className="mt-2">This transaction will use <strong>{calculateMinimaWhenCreatingToken(commandDetails.amount, commandDetails.decimals)}</strong> Minima{commandDetails.burn ? <span> and burn <strong>{commandDetails.burn}</strong> Minima.</span> : '.'}</div>
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

    if (commandDetails?.command === 'backup') {
      if (commandDetails.auto === 'true') {
        return (
          <div>
            <div>
              <div>You are about to backup this node and enable automatic backups every 24 hours. </div>
              <div className="mt-2 font-bold">Please note:</div>
              <ul className="mt-2 ml-4 list-disc">
                <li>Auto backups are not password protected - any password provided will be ignored.</li>
                <li>The backup will be saved to the location shown in the response - any file path or name provided will be ignored.</li>
                <li>Auto backups contain 100 transaction history unless otherwise configured at startup.</li>
              </ul>
              <div className="mt-2">For easier backup management, it is recommended to use the Security MiniDapp.</div>
            </div>
          </div>
        )
      }

      if (commandDetails.auto === 'false') {
        return (
          <div>
            <div>You are about to disable automatic backups for this node.</div>
            <div className="mt-2">For easier backup management, it is recommended to use the security MiniDapp.</div>
          </div>
        )
      }

      return (
        <div>
          <div>You are about to take a backup of this node. The file location will be shown in the response.</div>
          <div className="mt-2">For easier backup management, it is recommended to use the security MiniDapp.</div>
          {(commandDetails.password || commandDetails.file || commandDetails.maxhistory) && <ul className="mt-2 ml-4 list-disc">
            {commandDetails.password && <li>It will be encrypted with the password provided.</li>}
            {commandDetails.file && <li>It will be saved in the following file/location: <strong>{commandDetails.file}</strong>.</li>}
            {commandDetails.maxhistory && <li>This backup will contain a maximum history of <strong>{commandDetails.maxhistory}</strong> of your transactions.</li>}
          </ul>}
        </div>
      )
    }

    if (commandDetails?.command === 'restore') {
      return (
        <div>
          <div>
            <div>You are about to restore the following backup file: <strong>{commandDetails.file}</strong>.</div>
            {(commandDetails.password) && (
              <ul className="mt-2 ml-4 list-disc text-[13px]">
                {commandDetails.password && <li>The password provided will be used to decrypt the backup.</li>}
              </ul>
            )}
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'restoresync') {
      return (
        <div>
          <div>
            <div>You are about to restore the following backup file: <strong>{commandDetails.file}</strong>.</div>
            {(commandDetails.password || commandDetails.host || commandDetails.keyuses) && (
              <ul className="mt-2 ml-4 list-disc text-[13px]">
                {commandDetails.password && <li>The password provided will be used to decrypt the backup.</li>}
                {commandDetails.host && <li>Once restored, your node will attempt to sync to the latest block from the archive node at the following host: <strong>{commandDetails.host}</strong>. This will be skipped if your backup is less than 48 hours old.</li>}
                {commandDetails.keyuses && <li>Your key uses value will be increased by <strong>{commandDetails.keyuses}</strong>. This value must be higher than the maximum number of times you have transacted since taking the backup.</li>}
              </ul>
            )}
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'rpc') {
      return (
        <div>
          <div>
            {commandDetails.enable === 'true' && <div>You are about to enable RPC on your node. This may expose your node to public access if not protected by a firewall. <strong>USE WITH CAUTION</strong>.</div>}
            {commandDetails.enable === 'false' && <div>You are about to disable RPC on your node. If external applications are using RPC to communicate with your node, these will no longer function as expected.</div>}
            {(commandDetails.ssl || commandDetails.password) && (
              <ul className="mt-2 ml-4 list-disc text-[13px]">
                {commandDetails.ssl && <li>Self signed SSL will be enabled - you can use stunnel yourself.</li>}
                {commandDetails.password && <li>Your RPC Basic Auth password used in headers will be set to the password provided - ONLY secure if used with SSL.</li>}
              </ul>
            )}
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'removescript') {
      return (
        <div>
          <div>
            <div>You are about to remove the following script from your node. Be careful, removing scripts which are relevant to you can result in losing access to some of your assets.</div>
            <div className="mt-2">If you lose access to your assets as a result of removing this script, you will need to re-add the script and resync your node.</div>
            <div className="mt-2 break-all">Address: <strong>{commandDetails.address}</strong></div>
            <div className="mt-2">
              Script: {!commandDetails.script && <span className="text-red-500">Could not be retrieved</span>}
              {commandDetails.script && (
                <pre className="mt-2 border border-gray-800 text-[13px] rounded p-2 break-all">
                  {commandDetails.script}
                </pre>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (commandDetails?.command === 'megammrsync') {
      if (commandDetails.action === 'resync' && commandDetails.phrase && !commandDetails.file) {
        return (
          <div>
            <div>You are about to restore and resync your node to a new seed phrase using the host <strong>{commandDetails.host}</strong>. Your transaction history will be wiped and wallet will be restored.</div>
            <div className="mt-2">It is recommended to first backup your node and ensure you have written down your seed phrase.</div>
          </div>
        );
      }

      if (commandDetails.action === 'resync' && commandDetails.file && !commandDetails.phrase) {
        return (
          <div>
            <div>You are about to restore a backup and resync your node using the host <strong>{commandDetails.host}</strong>. Your transaction history will be wiped and wallet will be restored.</div>
            <div className="mt-2">It is recommended to first backup your node and ensure you have written down your seed phrase.</div>
          </div>
        );
      }

      if (commandDetails.action === 'resync') {
        return (
          <div>
            <div>You are about to resync your node from the host <strong>{commandDetails.host}</strong>. Your transaction history will be wiped and wallet will be restored.</div>
            <div className="mt-2">It is recommended to first backup your node and ensure you have written down your seed phrase.</div>
          </div>
        );
      }

      return (
        <div>You are about to show which addresses and public keys you would search for during a resync.</div>
      )
    }

    if (commandDetails?.command === 'archive') {
      if (commandDetails.action === 'integrity') {
        return (
          <div>You are about to check the integrity of your own archive data. This may take a while. If possible, it is recommended to run this directly from the Minima Terminal.</div>
        );
      }

      if (commandDetails.action === 'inspect') {
        return (
          <div>You are about to inspect the following file: <strong>{commandDetails.file}</strong>. This may take a while. If possible, it is recommended to run this directly from the Minima Terminal.</div>
        );
      }

      if (commandDetails.action === 'export') {
        return (
          <div>
            <div>You are about to export your archive database to a .gzip file. {commandDetails.file ? <div>It will be saved in the following file/location: <strong>{commandDetails.file}</strong>.</div> : <div>It will be saved in your node's base folder</div>}</div>
            <div className="mt-2">It is recommended to use the exportraw method instead, for improved performance.</div>
            <div className="mt-2">This may take a while. If possible, it is recommended to run this directly from the Minima Terminal.</div>
          </div>
        );
      }

      if (commandDetails.action === 'exportraw' && !commandDetails.file) {
        return (
          <div>
            <div>You are about to export your archive database to a .dat file. The file will be saved locally in your node's base folder.</div>
            <div className="mt-2">This may take a while. If possible, it is recommended to run this directly from the Minima Terminal.</div>
          </div>
        );
      }

      if (commandDetails.action === 'exportraw' && commandDetails.file) {
        return (
          <div>
            <div>You are about to export your archive database to a .dat file. It will be saved in the following file/location: <strong>{commandDetails.file}</strong>.</div>
            <div className="mt-2">If no folder path has been defined, the file will be saved locally in your node's base folder.</div>
          </div>
        );
      }

      if (commandDetails.action === 'resync') {
        return (
          <div>
            <div>You are about to {commandDetails.phrase ? 'wipe and restore' : 're-sync'} your node from the host <strong>{commandDetails.host}</strong>. This host should be an archive node and you must remain online for the duration of the syncing process. This will take a long time. If possible, perform a QuickSync instead.</div>
            <div className="mt-2">It is recommended to first backup your node and ensure you have written down your seed phrase.</div>
          </div>
        );
      }

      if (commandDetails.action === 'import') {
        return (
          <div>
            {commandDetails.phrase && <div>You are about to wipe and restore this node to a new seed phrase and import all archive data from the following archive file: <strong>{commandDetails.file}</strong>.</div>}
            {!commandDetails.phrase && <div>You are about to import and resync from the following archive file: <strong>{commandDetails.file}</strong>. Please ensure your node is set up as an archive node before proceeding. This will take a while. If possible, it is recommended to run this directly from the Minima Terminal.</div>}
            <div className="mt-2">It is recommended to first backup your node and ensure you have written down your seed phrase.</div>
          </div>
        );
      }

      if (commandDetails.action === 'addresscheck') {
        return (
          <div>
            <div>You are about to check your archive database for spent and unspent coins at the following wallet or script address: <strong>{commandDetails.address}</strong>.</div>
          </div>
        );
      }

      return (
        <div>You are about to show which addresses and public keys you would search for during a resync.</div>
      )
    }

    if (commandDetails?.command === 'mysql') {
      if (commandDetails.action === 'info') {
        return (
          <div>
            {(commandDetails.host || commandDetails.database || commandDetails.user) ? (
              <div>
                <div>You are about to connect to the following MySQL database:</div>
                <ul className="mt-2 ml-4 list-disc text-[13px]">
                  {commandDetails.host && <li>host: <strong>{commandDetails.host}</strong></li>}
                  {commandDetails.database && <li>database: <strong>{commandDetails.database}</strong></li>}
                  {commandDetails.user && <li>user: <strong>{commandDetails.user}</strong></li>}
                </ul>
              </div>
            ) : (
              <div>You are about to connect to the MySQL database.</div>
            )}
            {!commandDetails.action && (
              <div className="mt-2 text-xs">Connection details and the block count in both the node's archive and the MySQL database will be returned.</div>
            )}
            {(commandDetails.readonly) && (
              <ul className="mt-2 ml-4 list-disc text-[13px]">
                {commandDetails.readonly === 'true' && <li>This MySQL connection will be in read-only mode.</li>}
                {commandDetails.readonly === 'false' && <li>This MySQL connection will be in write mode.</li>}
              </ul>
            )}
          </div>
        )
      }

      if (commandDetails.action === 'integrity') {
        return (
          <div>This command will check the block order is correct in the MySQL db.</div>
        )
      }

      if (commandDetails.action === 'autobackup') {
        return (
          <div>The node’s archive data will be automatically backed up to the MySQL database. If your node is using the <strong>-mysqlalltxpow</strong> startup parameter, all transactions will also be backed up to MySQL.</div>
        )
      }

      if (commandDetails.action === 'update') {
        return (
          <div>The MySQL database will be synced with the node’s archive database.</div>
        )
      }

      if (commandDetails.action === 'addresscheck') {
        return (
          <div>The history of all spent and unspent coins from the following address: <strong>{commandDetails.address}</strong>, will be checked.</div>
        )
      }

      if (commandDetails.action === 'setlogin') {
        return (
          <div>The MySQL login details will be saved so you don’t need to provide them every time you use a MySQL commandso you don’t need to provide them every time you use a MySQL command.</div>
        )
      }

      if (commandDetails.action === 'clearlogin') {
        return (
          <div>The saved MySQL login details will be cleared.</div>
        )
      }

      if (commandDetails.action === 'findtxpow') {
        return (
          <div>The following TxPoW will be searched for in the MySQL database: <strong>{commandDetails.txpowid}</strong></div>
        )
      }

      if (commandDetails.action === 'resync') {
        return (
          <div>
            <div>Your node will be {commandDetails.phrase ? 'wiped and restore' : 're-sync'} from the MySQL database. Your transaction history will be wiped and wallet will be restored.</div>
            <div className="mt-2">It is recommended to first backup your node and ensure you have written down your seed phrase.</div>
            <div className="mt-2">This will take a long time so it is recommended to perform this directly from the Minima Terminal.</div>
            <div className="mt-2">The node will shutdown once complete, so you must restart it.</div>
          </div>
        )
      }

      if (commandDetails.action === 'wipe') {
        return (
          <div>Be careful. The MySQL database will be wiped.</div>
        )
      }

      if (commandDetails.action === 'h2export') {
        return (
          <div>
            <div>The MySQL archive database will be exported to a .gzip file. This can be used to resync a node. Consider using the raw export option for improved performance.</div>
            {(commandDetails.file) && (
              <ul className="mt-2 ml-4 list-disc text-[13px]">
                {commandDetails.file && <li>It will be saved in the following file/location: <strong>{commandDetails.file}</strong></li>}
              </ul>
            )}
          </div>
        )
      }

      if (commandDetails.action === 'h2import') {
        return (
          <div>
            <div>The following file will be imported to the MySQL archive database: <strong>{commandDetails.file}</strong>.</div>
            <div className="mt-2"> This must be a valid .gzip file. Consider using the raw import option for improved performance.</div>
          </div>
        )
      }


      if (commandDetails.action === 'rawexport') {
        return (
          <div>
            <div>The MySQL archive database will be exported to a raw .dat file. This can be used to resync a node.</div>
            <ul className="mt-2 ml-4 list-disc text-[13px]">
              {commandDetails.file && <li>It will be saved in the following file/location: <strong>{commandDetails.file}</strong></li>}
              {!commandDetails.file && <li>This will be saved in your node's base folder.</li>}
            </ul>
          </div>
        )
      }

      if (commandDetails.action === 'rawimport') {
        return (
          <div>
            <div>The following file will be imported to the MySQL archive database: <strong>{commandDetails.file}</strong>.</div>
            <div className="mt-2">This must be a valid <strong>.dat</strong> file.</div>
          </div>
        )
      }

      if ((commandDetails.host || commandDetails.database || commandDetails.user)) {
        return (
          <div>
            <div>You are about to connect to the following MySQL database:</div>
            <ul className="mt-2 ml-4 list-disc text-[13px]">
              {commandDetails.host && <li>host: <strong>{commandDetails.host}</strong></li>}
              {commandDetails.database && <li>database: <strong>{commandDetails.database}</strong></li>}
              {commandDetails.user && <li>user: <strong>{commandDetails.user}</strong></li>}
            </ul>
            {!commandDetails.action && (
              <div className="mt-2">Connection details and the block count in both the node's archive and the MySQL database will be returned.</div>
            )}
          </div>
        )
      }
    }


    if (commandDetails?.command === 'mysqlcoins') {
      if (commandDetails.action === 'info') {
        return (
          <div>
            {(commandDetails.host || commandDetails.database || commandDetails.user) ? (
              <div>
                <div>You are about to connect to the following MySQL coins database:</div>
                <ul className="mt-2 ml-4 list-disc text-[13px]">
                  {commandDetails.host && <li>host: <strong>{commandDetails.host}</strong></li>}
                  {commandDetails.database && <li>database: <strong>{commandDetails.database}</strong></li>}
                  {commandDetails.user && <li>user: <strong>{commandDetails.user}</strong></li>}
                </ul>
              </div>
            ) : (
              <div>You are about to connect to the MySQL coins database.</div>
            )}
            {!commandDetails.action && (
              <div className="mt-2 text-xs">Details about the last synced block will be returned.</div>
            )}
            {(commandDetails.readonly) && (
              <ul className="mt-2 ml-4 list-disc text-[13px]">
                {commandDetails.readonly === 'true' && <li>This MySQL connection will be in read-only mode.</li>}
                {commandDetails.readonly === 'false' && <li>This MySQL connection will be in write mode.</li>}
              </ul>
            )}
          </div>
        )
      }

      if (commandDetails.action === 'wipe') {
        return (
          <div>Be careful. The MySQL coins database will be wiped.</div>
        )
      }

      if (commandDetails.action === 'update' && !commandDetails.maxcoins) {
        return (
          <div>
            <div>The MySQL coins database will be synced with the node's coin database. This can take a long time - consider limiting the number of coins to sync at once using the <strong><i>maxcoins</i></strong> parameter.</div>
          </div>
        )
      }

      if (commandDetails.action === 'update' && commandDetails.maxcoins) {
        return (
          <div>
            The MySQL coins database will be synced with the node's coin database. A maximum of <strong>{commandDetails.maxcoins}</strong> coins will be synced.
          </div>
        )
      }

      if (commandDetails.action === 'search' && commandDetails.address) {
        return (
          <div>
            <div>A search will be performed on the coins at the following address: <strong>{commandDetails.address}</strong>.</div>
            {(commandDetails.spent) && (
              <ul className="mt-2 ml-4 list-disc text-[13px]">
                {commandDetails.spent === 'true' && <li>Only spent coins will be returned.</li>}
                {commandDetails.spent === 'false' && <li>Only unspent coins will be returned.</li>}
              </ul>
            )}
          </div>
        )
      }

      if (commandDetails.action === 'search' && commandDetails.where) {
        return (
          <div>
            <div>A search will be performed on the coins with the following SQL WHERE statement:</div>
            <div className="mt-2">
              <pre className="mt-2 border border-gray-800 text-[13px] rounded p-2 break-all">
                {commandDetails.where}
              </pre>
            </div>
            {(commandDetails.limit) && (
              <ul className="mt-2 ml-4 list-disc text-[13px]">
                {commandDetails.limit && <li>The number of rows returned will be limited to <strong>{commandDetails.limit}</strong>.</li>}
              </ul>
            )}
          </div>
        )
      }

      if (commandDetails.action === 'search' && commandDetails.query) {
        return (
          <div>
            <div>A search will be performed on the coins with the following SQL query:</div>
            <div className="mt-2">
              <pre className="mt-2 border border-gray-800 text-[13px] rounded p-2 break-all">
                {commandDetails.query}
              </pre>
            </div>
            {(commandDetails.limit) && (
              <ul className="mt-2 ml-4 list-disc text-[13px]">
                {commandDetails.limit && <li>The number of rows returned will be limited to: <strong>{commandDetails.limit}</strong>.</li>}
              </ul>
            )}
          </div>
        )
      }

      if ((commandDetails.host || commandDetails.database || commandDetails.user)) {
        return (
          <div>
            <div>You are about to connect to the following MySQL coins database:</div>
            <ul className="mt-2 ml-4 list-disc text-[13px]">
              {commandDetails.host && <li>host: <strong>{commandDetails.host}</strong></li>}
              {commandDetails.database && <li>database: <strong>{commandDetails.database}</strong></li>}
              {commandDetails.user && <li>user: <strong>{commandDetails.user}</strong></li>}
            </ul>
            {!commandDetails.action && (
              <div className="mt-2 text-xs">Details about the last synced block will be returned.</div>
            )}
          </div>
        )
      }
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
                    <ul className="ml-8 list-disc break-all">
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

    if (commandDetails?.command === 'megammrsync' && (commandDetails.phrase || commandDetails.password || commandDetails.anyphrase || commandDetails.keys || commandDetails.keyuses || commandDetails.file)) {
      return (
        <div>
          {showMore && (
            <ul className="mt-2 ml-4 list-disc text-[13px]">
              {commandDetails.phrase && <li>The wallet will be regenerated with the seed phrase provided.</li>}
              {commandDetails.anyphrase === 'true' && <li>A custom seed phrase will be allowed.</li>}
              {commandDetails.anyphrase === 'false' && <li>A custom seed phrase will not be allowed.</li>}
              {commandDetails.keys && <li><strong>{commandDetails.keys}</strong> keys will be generated. This should be at least 64 to restore a previously used wallet.</li>}
              {commandDetails.keyuses && <li>Your key uses value will be set to <strong>{commandDetails.keyuses}</strong>. This value must be higher than the maximum number of times you have transacted since starting your node. 262144 is the maximum possible value.</li>}
              {commandDetails.file && <li>The following backup file will be restored: <strong>{commandDetails.file}</strong>.</li>}
              {commandDetails.password && <li>The password provided will be used to decrypt the backup.</li>}
            </ul>
          )}
        </div>
      )
    }

    if (commandDetails?.command === 'archive' && commandDetails.action === 'addresscheck' && (commandDetails.statecheck || commandDetails.logs || commandDetails.maxexport)) {
      return (
        <div>
          {showMore && (
            <ul className="mt-2 ml-4 list-disc text-[13px]">
              {commandDetails.statecheck && <li>The following data will be searched for in the state variables: <strong>{commandDetails.statecheck}</strong></li>}
              {commandDetails.logs === 'true' && <li>Detailed logs will be provided</li>}
              {commandDetails.logs === 'false' && <li>Detailed logs will not be provided</li>}
              {commandDetails.maxexport && <li><strong>{commandDetails.maxexport}</strong> blocks will be exported.</li>}
            </ul>
          )}
        </div>
      )
    }

    if (commandDetails?.command === 'archive' && (commandDetails.action === 'import' || commandDetails.action === 'resync') && (commandDetails.anyphrase || commandDetails.phrase || commandDetails.keys || commandDetails.keyuses)) {
      return (
        <div>
          {showMore && (
            <ul className="mt-2 ml-4 list-disc text-[13px]">
              {commandDetails.anyphrase === 'true' && <li>A custom seed phrase will be allowed.</li>}
              {commandDetails.anyphrase === 'false' && <li>A custom seed phrase will not be allowed.</li>}
              {commandDetails.phrase && <li>The wallet will be regenerated with the seed phrase provided.</li>}
              {commandDetails.keys && <li><strong>{commandDetails.keys}</strong> keys will be generated. This should be at least 64 to restore a previously used wallet.</li>}
              {commandDetails.keyuses && <li>Your key uses value will be set to <strong>{commandDetails.keyuses}</strong>. This value must be higher than the maximum number of times you have transacted since starting your node. 262144 is the maximum possible value.</li>}
            </ul>
          )}
        </div>
      )
    }

    if (commandDetails?.command === 'mysql' && commandDetails.action === 'resync' && (commandDetails.phrase || commandDetails.keys)) {
      return (
        <div>
          {showMore && (
            <ul className="mt-2 ml-4 list-disc">
              {commandDetails.phrase && <li>The wallet will be regenerated with the seed phrase provided.</li>}
              {commandDetails.keys && <li><strong>{commandDetails.keys}</strong> keys will be generated. This should be at least 64 to restore a previously used wallet.</li>}
              {commandDetails.keyuses && <li>Your key uses value will be set to <strong>{commandDetails.keyuses}</strong>. This value must be higher than the maximum number of times you have transacted since starting your node. 262144 is the maximum possible value.</li>}
            </ul>
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
                      Info
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
            <p className="mb-6">Are you sure you want to approve and run this pending command?</p>
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
