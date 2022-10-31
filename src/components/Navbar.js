import { HomeIcon, CollectionIcon } from '@heroicons/react/outline';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authentification';

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="fixed bottom-0 w-full">
      <div className="h-14 bg-black bg-opacity-95 flex justify-around items-center">
        <div className="group cursor-pointer" onClick={() => navigate('/home')}>
          <HomeIcon className="text-white h-6 w-6 mx-auto group-hover:text-gray-400" />
          <p className="text-white text-2xs text-center group-hover:text-gray-400">
            Accueil
          </p>
        </div>

        {user.uid && (
          <div
            className="group cursor-pointer"
            onClick={() => navigate('/settings')}
          >
            <CollectionIcon className="text-white h-6 w-6 mx-auto group-hover:text-gray-400" />
            <p className="text-white text-2xs text-center group-hover:text-gray-400">
              Settings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
