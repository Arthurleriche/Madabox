import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateStoreSession } from '../store/slices/session.slice';
import { useAuth } from '../hooks/authentification';
import { DeviceMobileIcon } from '@heroicons/react/solid';
import Navbar from './Navbar';
import Modal from './Modal';
import FIRESTORE from '../api/firestore';
import QueueList from './QueueList.component';
import PlayingSong from './PlayingSong';
import Search from './Search.component';

function Session() {
  const [modal, setModal] = useState(false);
  const [authorize, setAuthorize] = useState(true);
  const [newSong, setNewSong] = useState(0);
  const { user } = useAuth();
  const { sessionId } = useParams();
  const session = useSelector((state) => state.session.session);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const getAccess = async (id) => {
      const { password } = await FIRESTORE.getDoc('sessions', id);

      if (user.uid || localStorage.getItem('sessionPassword') === password) {
        return setAuthorize(true);
      }
      const passwordTmp = prompt('Mot de passe de la session ?');
      if (password !== passwordTmp) {
        navigate('/home');
      } else {
        localStorage.setItem('sessionPassword', passwordTmp);
        setAuthorize(true);
      }
    };
    getAccess(sessionId);
  }, []);

  useEffect(() => {
    const recivedData = (result) => {
      dispatch(updateStoreSession(result));
    };

    if (authorize) {
      const unsub = FIRESTORE.wsGetSession(sessionId, recivedData);
      return () => unsub();
    } else {
      return;
    }
  }, [authorize]);

  if (!session) {
    return <p>Error</p>;
  }

  return (
    <div className="h-screen relative flex flex-col items-center px-4">
      {user.uid && (
        <>
          <DeviceMobileIcon
            onClick={() => setModal(!modal)}
            className={`absolute right-4 top-6 h-6 w-6 text-gray-500 hover:text-gray-400`}
          />
          {modal && (
            <Modal
              modal={modal}
              currentUserUid={user.uid}
              sessionId={window.location.pathname.split('/')[2]}
              setModal={setModal}
              close={() => setModal(false)}
              spotifyToken={session?.spotify_token}
            />
          )}
        </>
      )}

      <div className="my-[5vh] text-center">
        <h1 className="text-white text-3xl font-title">{session.name}</h1>
        <h2 className="text-gray-400 text-sm">
          Add and rank up your favorite tracks
        </h2>
      </div>
      <PlayingSong session={session} />

      <QueueList newSong={newSong} />
      <Search setNewSong={setNewSong} />
      <Navbar />
    </div>
  );
}

export default Session;
