import { useEffect } from 'react';
import play from '../assets/play.svg';
import { useAuth } from '../hooks/authentification';
import pause from '../assets/pause.svg';
import next from '../assets/next.svg';
import SPOTIFY from '../api/spotify';
import { useSelector, useDispatch } from 'react-redux';
import { updateActive, updateSdkReady } from '../store/slices/session.slice';
import FIRESTORE from '../api/firestore';
import { initSdk, nextTrack } from '../hooks/initSdk';

const playing = async (session, slice) => {
  if (session.current_song) {
    const play = await SPOTIFY.playNextByTrackId(session, session.current_song);
    if (play) return slice;
  } else {
    const play = await nextTrack(session);
    if (play) return slice;
  }
};

export default function playingSong({ session }) {
  const { user } = useAuth();
  const active = useSelector((state) => state.session.active);
  const sdkReadyStore = useSelector((state) => state.session.sdkReadyStore);

  const username = localStorage.getItem('username') || 'admin';
  const dispatch = useDispatch();

  const handlePause = async () => {
    dispatch(updateActive(false));
    await SPOTIFY.pause(session.spotify_token, session);
  };

  const handlePlay = () =>
    !active ? playing(session, dispatch(updateActive(play))) : handlePause();

  useEffect(() => {
    if (
      session.current_song?.next_track_count === parseInt(session.skipNumber) &&
      user.uid
    ) {
      nextTrack(session);
    }
  }, [session]);

  useEffect(async () => {
    if (user.uid && session?.spotify_token && !sdkReadyStore) {
      const recivedData = (result) => {
        dispatch(updateSdkReady(result));
      };

      initSdk(session, sdkReadyStore, recivedData);
    }
  }, []);

  const handleNextTrackVoted = () => {
    FIRESTORE.votedForNextTrack(session.uid, username);
  };

  return (
    <div className="h-32 max-w-[35rem] w-full p-2 rounded-xl bg-mediumGreen  mx-auto px-2 flex items-center">
      <div className="inline-flex h-full items-center w-1/4">
        <img
          src={session.current_song?.track_picture}
          alt=""
          className="w-24 p-1"
        />
      </div>

      <div className="w-full flex px-2 relative  justify-between">
        <div className="flex justify-between w-full items-center">
          <div>
            <p className="text-white text-xs font-title">
              <span className="text-gray-500 mr-1 text-xs">Track: </span>{' '}
              {session.current_song?.track}
            </p>

            <p className="text-white text-xs font-title">
              <span className="text-gray-500  ext-xs">Artist: </span>
              {session.current_song?.artist}
            </p>

            <p className="text-gray-500 text-xs overflow-x-hidden">
              Proposed by
              {session.current_song?.user_uid
                ? session.current_song?.user_uid.substr(
                    0,
                    session.current_song?.user_uid.indexOf('-username-')
                  )
                : 'unknow'}
            </p>

            <p className="text-xs text-gray-500">
              Next track in{' '}
              {parseInt(session.skipNumber) -
                session.current_song?.next_track_count ||
                session.skipNumber}{' '}
              skip votes
            </p>
          </div>
          {!user.uid && (
            <div className="h-full flex items-end">
              {!session.current_song?.users_voted?.includes(username) && (
                <button
                  className="px-1 text-xs bg-red-600 rounded-lg mt-2"
                  onClick={handleNextTrackVoted}
                >
                  skip
                </button>
              )}
            </div>
          )}
        </div>

        {/* play/pause + next */}
        {user.uid && sdkReadyStore && (
          <div className="flex items-center">
            <img
              src={active !== false || !sdkReadyStore ? pause : play}
              alt=""
              className={`hover:scale-110  h-4 mr-4 ${
                active && 'svg-to-green'
              }`}
              onClick={(e) => handlePlay(e)}
            />

            <img
              onClick={() => nextTrack(session)}
              src={next}
              alt=""
              className="hover:scale-110 w-4 h-4 mr-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}
