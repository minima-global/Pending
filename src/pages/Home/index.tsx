import TitleBar from '../../components/TitleBar';
import Actions from '../../components/Actions';
import ClearAll from '../../components/ClearAll';

function Home() {
  return (
    <div className="app">
      <div>
        <TitleBar />
        <div className="p-4 overflow-hidden">
          <Actions />
          <ClearAll />
        </div>
      </div>
    </div>
  );
}

export default Home;
