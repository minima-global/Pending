import TitleBar from '../../components/TitleBar';
import Actions from '../../components/Actions';

function Home() {
  return (
    <div className="app">
      <div>
        <TitleBar />
        <div className="p-4 overflow-hidden">
          <Actions />
        </div>
      </div>
    </div>
  );
}

export default Home;
