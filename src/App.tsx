import './index.css';
import AppProvider from './AppContext';
import Home from './pages/Home';
import ActionModal from './components/ActionModal';
import AppIsInReadMode from './components/AppIsInReadMode';

function App() {
  return (
    <AppProvider>
      <AppIsInReadMode />
      <Home />
      <ActionModal />
    </AppProvider>
  );
}

export default App;
