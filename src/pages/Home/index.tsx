import { useContext, useEffect, useState } from 'react';
import { appContext } from '../../AppContext';
import Panel from '../../components/UI/Panel';
import Button from '../../components/UI/Button';
import TitleBar from '../../components/UI/TitleBar';
import { animated } from '@react-spring/web';
import { useSpring } from 'react-spring';

function Home() {
  const { pendingData, accept, decline } = useContext(appContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPendingItem = pendingData && pendingData[currentIndex];

  const previous = () => {
    setCurrentIndex((prevState) => prevState - 1);
  };

  const next = () => {
    setCurrentIndex((prevState) => prevState + 1);
  };

  const hasPrevious = currentIndex !== 0;
  const hasNext = currentIndex + 1 !== pendingData?.length;

  const [style, animate]: any = useSpring(
    () => ({
      from: { translateY: 10, opacity: 0 },
      to: { translateY: 0, opacity: 1 },
    }),
    []
  );

  useEffect(() => {
    animate({
      from: { translateY: 10, opacity: 0, scale: 0.98 },
      to: { translateY: 0, opacity: 1, scale: 1 },
    });
  }, [currentIndex]);

  /**
   * If user's current pending action index is higher than the total
   * pending data actions, than move the user back to the previous command
   * as it's most likely that they have approved / declined the latest action
   */
  useEffect(() => {
    if (pendingData && currentIndex + 1 > pendingData.length) {
      const latestItem = pendingData.length - 1;
      setCurrentIndex(latestItem === -1 ? 0 : latestItem);
    }
  }, [currentIndex, pendingData]);

  return (
    <div className="app select-none">
      <div className="flex flex-col h-full">
        <TitleBar />
        <div className="p-4 pb-6 grid grid-cols-12">
          <div className="col-span-12 mb-3">
            <h1 className="text-2xl">Pending</h1>
          </div>
          <div className="col-span-12">
            <p className="text-core-grey-100 text-sm">
              Pending commands are triggered when Read mode MiniDapps attempt to access to your wallet. Review pending
              commands to accept or deny a request.
            </p>
          </div>
        </div>
        {!currentPendingItem && (
          <div className="flex-grow flex items-center justify-center mb-28">
            <h5 className="text-core-grey-80">Pending commands will appear here</h5>
          </div>
        )}
        {currentPendingItem && (
          <div className="h-full flex flex-col overflow-hidden bg-core-black-contrast-2">
            <div className="bg-core-black-contrast">
              <div className="grid grid-cols-12 p-5">
                <div
                  onClick={previous}
                  className={`col-span-4 flex items-center gap-3 ${
                    hasPrevious ? 'cursor-pointer' : 'pointer-events-none opacity-50'
                  }`}
                >
                  <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6.39969 12.6693L0.230469 6.50009L6.39969 0.330872L7.29582 1.22701L2.02275 6.50009L7.29582 11.7732L6.39969 12.6693Z"
                      fill="currentColor"
                    />
                  </svg>
                  Previous
                </div>
                <div className="col-span-4 flex justify-center items-center gap-3">
                  {pendingData && (
                    <>
                      {currentIndex + 1}/{pendingData.length}
                    </>
                  )}
                </div>
                <div
                  onClick={next}
                  className={`col-span-4 flex items-center justify-end gap-3 ${
                    hasNext ? 'cursor-pointer' : 'pointer-events-none opacity-50'
                  }`}
                >
                  Next
                  <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1.60031 12.6693L7.76953 6.50009L1.60031 0.330872L0.704181 1.22701L5.97725 6.50009L0.704181 11.7732L1.60031 12.6693Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <animated.div className="bg-core-black-contrast-2 flex-grow" style={style}>
              <div className="flex flex-col h-full">
                <div className="flex-grow h-full p-2">
                  <div className="p-6">
                    <div className="flex items-stretch">
                      <div className="flex items-center">
                        <div
                          className="w-14 h-14 bg-cover rounded-lg mx-auto"
                          style={{
                            backgroundImage: `url(${(window as any).MDS.filehost}/${currentPendingItem.minidapp.uid}/${
                              currentPendingItem.minidapp.conf.icon
                            }), url('./app.png')`,
                          }}
                        />
                      </div>
                      <div className="flex items-center ml-4">
                        <div>
                          <h5 className="text-2xl mb-1">{currentPendingItem.minidapp.conf.name}</h5>
                          <p className="text-sm text-core-grey-80">30 Sep 2023 13:00:07 GMT+01</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6">
                    <Panel title="Command" value={currentPendingItem.command} mono copy />
                  </div>
                </div>
                <div className="flex gap-4 p-4 mb-4">
                  <div className="w-full">
                    <Button
                      onClick={() => decline(currentPendingItem!.uid, currentPendingItem!.minidapp)}
                      variant="secondary"
                    >
                      Deny
                    </Button>
                  </div>
                  <div className="w-full">
                    <Button onClick={() => accept(currentPendingItem!.uid, currentPendingItem!.minidapp)}>
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            </animated.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
