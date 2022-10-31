import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FIRESTORE from '../api/firestore';
import { useAuth } from '../hooks/authentification';

function SpotifyConnect() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState({
    client_id: '',
    client_secret: '',
  });

  const navigate = useNavigate();

  useEffect(async () => {
    const userTmp = await FIRESTORE.getDoc('profiles', user.uid);

    if (userTmp.client_id === null && userTmp.client_secret === null) {
      userTmp.client_id = '';
      userTmp.client_secret = '';
    }

    setCredentials(userTmp);
  }, []);

  const connectToSpotify = (e, body) => {
    e.preventDefault();
    addSpotifyCrendetialFirebase(e, body);

    window.location.href = `${process.env.REACT_APP_SPOTIFY_SERVER}/spotify_server/auth/login?client_id=${credentials.client_id}&client_secret=${credentials.client_secret}&user_uid=12345`;
  };

  const addSpotifyCrendetialFirebase = async (e, body) => {
    try {
      e.preventDefault();
      FIRESTORE.updateDoc('profiles', user.uid, body);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen min-h-[790px] flex flex-col items-center pt-20 px-4">
      {/* title */}
      <div className="w-11/12 max-w-[35rem] mx-auto mb-12">
        <h1 className="text-white text-3xl font-title">Connect your Spotify</h1>
        <h2 className="text-gray-400 text-md">
          Share your music to your friends.
        </h2>
      </div>
      {/* desecription */}
      <div className="w-11/12 max-w-[35rem] mx-auto mb-12">
        <p className="text-gray-400 font-semibold">
          Go on developer.spotify.com {'>'} Connect with your spotify account{' '}
          {'>'} Dashboard {'>'} Create an app {'>'} get your your Client Id and
          Client Secret.
        </p>
      </div>
      {/* form */}
      <div className="w-11/12 max-w-[35rem] mx-auto">
        <form
          className=""
          type="submit"
          onSubmit={(e) => connectToSpotify(e, credentials)}
        >
          <div className="flex flex-col mb-8">
            <label htmlFor="email" className="text-white mb-4">
              Client Id
            </label>
            <input
              name="client id"
              placeholder="65AZDaz7AZDaz290da87"
              autoComplete="off"
              type="text"
              onChange={(e) =>
                setCredentials({ ...credentials, client_id: e.target.value })
              }
              value={credentials.client_id}
              className="h-14 bg-grayNotFocused px-4 rounded-xl text-white outline-none
              placeholder:text-ligthGray placeholder:text-sm focus:placeholder:text-mediumGreen
              focus:bg-mediumGreen"
            />
          </div>

          <div className="flex flex-col mb-16">
            <label htmlFor="password" className="text-white mb-4">
              Client Secret
            </label>
            <input
              name="client secret"
              placeholder="******"
              autoComplete="off"
              type="password"
              onChange={(e) =>
                setCredentials({
                  ...credentials,
                  client_secret: e.target.value,
                })
              }
              value={credentials.client_secret}
              className="h-14 bg-grayNotFocused px-4 rounded-xl text-white outline-none
              placeholder:text-ligthGray placeholder:text-sm focus:placeholder:text-mediumGreen
              focus:bg-mediumGreen"
            />
          </div>
          <input
            name="submit"
            type="submit"
            className="w-48 h-16 block mx-auto font-bold cursor-pointer rounded-full text-white bg-lightGreen "
            value="CONNECT"
          />
        </form>
        <p
          onClick={() => navigate('/home')}
          className="mt-4 text-center underline cursor-pointer text-sm text-gray-500 font-semibold hover:text-gray-400"
        >
          Skip
        </p>
      </div>
    </div>
  );
}

export default SpotifyConnect;
