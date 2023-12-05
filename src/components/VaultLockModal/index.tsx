import { useContext, useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { appContext } from '../../AppContext';
import { lock, unlock } from '../../lib';

export function VaultLockModal({ callback }) {
  const { displayVaultIsLocked, setDisplayVaultIsLocked } = useContext(appContext);
  const display = displayVaultIsLocked;
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dismiss = () => {
    setIsLoading(false);
    setDisplayVaultIsLocked(false);
  };

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleOnChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(evt.target.value);
  };

  const handleOnSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();

    try {
      setIsLoading(true);
      await unlock(password);
      setPassword('');
      setDisplayVaultIsLocked(false);
      await callback();
      lock(password);
    } catch (error) {
      setError(error as boolean);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal display={!!display} frosted>
      <form onSubmit={handleOnSubmit} className="w-full">
        <h2 className="text-xl font-bold mb-4">Your node is locked</h2>
        <p className="text-md mb-6 text-gray-400">
          Please enter your password to unlock your node to accept this command
        </p>
        {error && (
          <div className="mb-5 text-white">
            <div className="flex items-center text-sm gap-3 bg-red-600 font-bold w-full text-left p-3 capitalize">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              {error}
            </div>
          </div>
        )}
        <div className="relative mb-4">
          <input
            value={password}
            onChange={handleOnChange}
            type={showPassword ? 'text' : 'password'}
            className="rounded outline-none w-full pl-3 pr-16 py-3 bg-core-black-contrast"
          />
          <div
            onClick={toggleShowPassword}
            className="cursor-pointer absolute top-0 right-0 flex items-center justify-center w-12 h-12"
          >
            {showPassword && <img src="/assets/eye.svg" width="16" height="16" alt="Password shown" />}
            {!showPassword && <img src="/assets/eye-off.svg" width="16" height="16" alt="Password hidden" />}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <Button type="submit" loading={isLoading} disabled={password.length === 0} size="medium">
            Unlock node
          </Button>
          <Button type="button" size="medium" variant="secondary" onClick={dismiss}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default VaultLockModal;
