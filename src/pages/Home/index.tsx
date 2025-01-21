import { useContext, useEffect, useState } from 'react';
import { appContext } from '../../AppContext';
import Button from '../../components/UI/Button';
import TitleBar from '../../components/UI/TitleBar';
import { animated } from '@react-spring/web';
import { useSpring } from 'react-spring';
import PendingItem from '../../components/PendingItem';

function Home() {
  const { hideHelp, pendingData, setCommandDetails } = useContext(appContext);
  const [currentIndex, setCurrentIndex] = useState<number | null>(0);
  const [view, setView] = useState('GRID');
  const currentPendingItem = pendingData && typeof currentIndex === 'number' && pendingData[currentIndex];

  /**
   * If the view is grid, we want to always have a current index as the user
   * can navigate between the different pending action items
   *
   * If the view is row, we want to set the current index to null as the user
   * needs to click the details button to display the full information panel
   */
  useEffect(() => {
    if (view === 'GRID') {
      setCurrentIndex(0);
    } else if (view === 'ROW') {
      setCurrentIndex(null);
    }
  }, [view]);

  const previous = () => {
    setCommandDetails(null);
    setCurrentIndex((prevState) => (typeof prevState === 'number' ? prevState - 1 : prevState));
  };

  const next = () => {
    setCommandDetails(null);
    setCurrentIndex((prevState) => (typeof prevState === 'number' ? prevState + 1 : prevState));
  };

  const hasPrevious = currentIndex !== 0;
  const hasNext = typeof currentIndex === 'number' && currentIndex + 1 !== pendingData?.length;

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
    if (pendingData && typeof currentIndex === 'number' && currentIndex + 1 > pendingData.length) {
      const latestItem = pendingData.length - 1;
      setCurrentIndex(latestItem === -1 ? 0 : latestItem);
    }
  }, [currentIndex, pendingData]);

  return (
    <div className="app select-none flex flex-col">
      <div className="lg:bg-core-black-contrast">
        <TitleBar />
        <div className="flex flex-col mx-auto max-w-xl">
          <div className={`grid grid-cols-12 transition-scale duration-200 ${!hideHelp ? '`m-4 lg:pt-4 lg:px-0 pb-6 scale-y-100' : 'opacity-0 scale-y-0 h-[0px] w-[0px]'}`}>
            <div className="col-span-12">
              <p className={`px-4 lg:px-0 text-xs lg:text-base text-core-grey-100 text-sm transition-opacity duration-100 delay-150 ${!hideHelp ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                Pending commands are triggered when a MiniDapp attempts to access your wallet. Accept commands you would like to go ahead with and deny any others.
              </p>
            </div>
          </div>
          <div className="pb-5 flex justify-end gap-4 px-4 lg:px-0">
            <div
              onClick={() => setView('GRID')}
              className={`cursor-pointer flex items-center ${view == 'ROW' ? 'text-core-grey-80' : 'hidden'}`}
            >
              <svg
                width="20"
                height="13"
                viewBox="0 0 20 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.654297 2H4.0004V11H0.654297V2ZM5.50042 0H14.5004V13H5.50042V0ZM16.0004 2H19.3465V11H16.0004V2ZM7.0004 1.49998V11.5H13.0004V1.49998H7.0004Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div
              onClick={() => setView('ROW')}
              className={`cursor-pointer flex items-center ${view == 'GRID' ? 'text-core-grey-80' : 'hidden'}`}
            >
              <svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.25 12.25V10.75H10.75V12.25H7.25ZM3.25 7.05763V5.55768H14.75V7.05763H3.25ZM0.25 1.86533V0.365356H17.75V1.86533H0.25Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-grow lg:grow-0 lg:pb-4 flex flex-col mx-auto w-full max-w-xl lg:pt-4">
        {view === 'ROW' && (
          <div className={`flex-grow relative`}>
            {(pendingData === null || pendingData?.length === 0) && (
              <div className="lg:mt-4 flex-grow flex items-center justify-center h-full pb-28">
                <h5 className="text-core-grey-80">Pending commands will appear here</h5>
              </div>
            )}
            {!currentPendingItem && (
              <div>
                {pendingData?.map((currentPendingItem, index) => (
                  <div key={currentPendingItem.uid} className="overflow-hidden flex-grow pb-4 px-4 lg:px-0">
                    <div className="bg-core-black-contrast-2 rounded-xl overflow-hidden flex items-center justify-start">
                      <div
                        className="min-w-[48px] w-[48px] h-[48px] ml-4 mr-1 lg:mr-0 lg:ml-0 rounded lg:min-w-[80px] lg:h-[80px] bg-cover mx-auto"
                        style={{
                          backgroundImage: `url(${(window as any).MDS.filehost}/${currentPendingItem.minidapp.uid}/${
                            currentPendingItem.minidapp.conf.icon
                          }), url('./assets/app.png')`,
                        }}
                      />
                      <div className="flex-grow p-4 w-full overflow-hidden">
                        <h5 className="font-bold mb-1">{currentPendingItem.minidapp.conf.name}</h5>
                        <p className="text-sm text-core-grey-80 text-ellipsis truncate">
                          Command: {currentPendingItem.command}
                        </p>
                      </div>
                      <div className="flex items-center px-4">
                        <Button size="small" variant="secondary" onClick={() => setCurrentIndex(index)}>
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {currentPendingItem && (
              <div className="absolute top-0 w-full h-full flex flex-col bg-core-black-contrast-2">
                <div className="bg-core-black-contrast">
                  <div className="grid grid-cols-12 p-5">
                    <div
                      onClick={() => setCurrentIndex(null)}
                      className={`col-span-4 flex items-center gap-3 cursor-pointer`}
                    >
                      <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6.39969 12.6693L0.230469 6.50009L6.39969 0.330872L7.29582 1.22701L2.02275 6.50009L7.29582 11.7732L6.39969 12.6693Z"
                          fill="currentColor"
                        />
                      </svg>
                      Back
                    </div>
                  </div>
                </div>
                <animated.div className="bg-core-black-contrast-2 flex-grow" style={style}>
                  <PendingItem data={currentPendingItem} callback={() => setCurrentIndex(null)} />
                </animated.div>
              </div>
            )}
          </div>
        )}
        {view === 'GRID' && (
          <>
            {!currentPendingItem && (
              <div className="lg:mt-4 flex-grow flex items-center justify-center mb-28">
                <h5 className="text-core-grey-80">Pending commands will appear here</h5>
              </div>
            )}
            {currentPendingItem && typeof currentIndex === 'number' && (
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
                  <PendingItem data={currentPendingItem} />
                </animated.div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
