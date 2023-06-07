import { useContext, useEffect, useState } from 'react';
import { appContext } from '../../AppContext';
import Button from '../../components/UI/Button';
import TitleBar from '../../components/UI/TitleBar';
import { animated } from '@react-spring/web';
import { useSpring } from 'react-spring';
import PendingItem from '../../components/PendingItem';

function Home() {
  const { pendingData } = useContext(appContext);
  const [currentIndex, setCurrentIndex] = useState<number | null>(0);
  const [view, setView] = useState('GRID');
  const currentPendingItem = pendingData && typeof currentIndex === 'number' && currentIndex && pendingData[currentIndex];

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
    setCurrentIndex((prevState) => typeof prevState === 'number' ? prevState - 1 : prevState);
  };

  const next = () => {
    setCurrentIndex((prevState) => typeof prevState === 'number' ? prevState + 1 : prevState);
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
        <div className="px-5 pb-5 flex justify-end gap-4">
          <div
            onClick={() => setView('GRID')}
            className={`cursor-pointer w-fit px-4 py-1 rounded-full font-bold text-sm flex items-center ${
              view == 'GRID' ? 'bg-white text-black' : 'bg-core-black-contrast-2'
            }`}
          >
            Grid
            <svg
              className="ml-2.5 -mr-0.5"
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
            className={`cursor-pointer w-fit px-4 py-1 rounded-full font-bold text-sm flex items-center ${
              view == 'ROW' ? 'bg-white text-black' : 'bg-core-black-contrast-2'
            }`}
          >
            Row
            <svg
              className="ml-3 -mr-0.5"
              width="18"
              height="13"
              viewBox="0 0 18 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.25 12.25V10.75H10.75V12.25H7.25ZM3.25 7.05763V5.55768H14.75V7.05763H3.25ZM0.25 1.86533V0.365356H17.75V1.86533H0.25Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        {view === 'ROW' && (
          <div
            className={`flex-grow relative custom-scrollbar ${
              currentPendingItem ? 'overflow-hidden' : 'overflow-y-scroll'
            }`}
          >
            {pendingData?.length === 0 && (
              <div className="flex-grow flex items-center justify-center h-full pb-28">
                <h5 className="text-core-grey-80 -mr-1.5">Pending commands will appear here</h5>
              </div>
            )}
            <div>
              {pendingData?.map((currentPendingItem, index) => (
                <div key={currentPendingItem.uid} className="overflow-hidden flex-grow pl-5 pr-3 pb-4">
                  <div className="bg-core-black-contrast-2 rounded-xl overflow-hidden flex justify-start">
                    <div
                      className="w-[80px] h-[80px] bg-cover mx-auto"
                      style={{
                        backgroundImage: `url(${(window as any).MDS.filehost}/${currentPendingItem.minidapp.uid}/${
                          currentPendingItem.minidapp.conf.icon
                        }), url('./app.png')`,
                      }}
                    />
                    <div className="flex-grow p-4">
                      <h5 className="font-bold mb-1">{currentPendingItem.minidapp.conf.name}</h5>
                      <p className="text-sm text-core-grey-80">Command: {currentPendingItem.command}</p>
                    </div>
                    <div className="flex items-center px-4">
                      <Button size="small" variant="secondary" onClick={() => setCurrentIndex(index)}>
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {currentPendingItem && (
              <div className="absolute top-0 w-full h-full flex flex-col overflow-hidden bg-core-black-contrast-2">
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
                  <PendingItem data={currentPendingItem} callback={() => setCurrentIndex(null) }/>
                </animated.div>
              </div>
            )}
          </div>
        )}
        {view === 'GRID' && (
          <>
            {!currentPendingItem && (
              <div className="flex-grow flex items-center justify-center mb-28">
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
