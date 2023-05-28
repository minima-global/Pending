import './index.css';
import AppProvider from './AppContext';
import Home from './pages/Home';
import ActionModal from './components/ActionModal';

function App() {
  return (
    <AppProvider>
      <Home />
      <ActionModal />
    </AppProvider>
  );
}

export default App;
