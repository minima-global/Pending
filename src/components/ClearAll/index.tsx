import { useContext, useState } from 'react';
import { appContext } from '../../AppContext';
import ConfirmModal from './ConfirmModal';

function ClearAll() {
  const { pendingData } = useContext(appContext);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
      <ConfirmModal display={showConfirm} dismiss={() => setShowConfirm(false)} />
      <div
        onClick={() => setShowConfirm(true)}
        className="cursor-pointer mx-auto my-3 text-center text-core-grey-90 w-full"
      >
        {pendingData && pendingData.length > 0 && <div>Clear all</div>}
      </div>
    </div>
  );
}

export default ClearAll;
