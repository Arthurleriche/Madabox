import SPOTIFY from '../api/spotify';
import FIRESTORE from '../api/firestore';

const handleConnectToSdk = async (deviceId, session, slice) => {
  const response = await SPOTIFY.changeDevices(session, deviceId);
  if (response) {
    slice(true);
    return true;
  }

  alert('Please reload page');
};

export const nextTrack = async (session) => {
  const { uid } = session;
  const sessionTmp = await FIRESTORE.getDoc('sessions', uid);
  if (!sessionTmp.queue_list[0]) {
    let randomSong = sessionTmp.library.filter(
      (song) => song.uri !== sessionTmp.current_song.uri
    );
    let randomNum = Math.floor(Math.random() * randomSong.length);

    return SPOTIFY.playNextByTrackId(sessionTmp, randomSong[randomNum], true);
  }
  return SPOTIFY.playNextByTrackId(sessionTmp, sessionTmp.queue_list[0], false);
};

const checkIf = async (state, session) => {
  if (state.restrictions.disallow_resuming_reasons) return;

  if (
    state.track_window.previous_tracks.length !== 0 &&
    state.track_window.previous_tracks.find(
      (x) => x.id === state.track_window.current_track.id
    ) &&
    state.paused
  )
    nextTrack(session);
};

export const initSdk = (session, sdkReadyStore, slice) => {
  if (sdkReadyStore) return;

  let player;
  const script = document.createElement('script');
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  script.async = true;
  document.body.appendChild(script);

  window.onSpotifyWebPlaybackSDKReady = () => {
    player = new window.Spotify.Player({
      name: 'Web Playback SDK',
      getOAuthToken: async (cb) => {
        const token = await SPOTIFY.tryToken(session);
        cb(token);
      },
    });

    player.on('playback_error', ({ message }) => {
      console.error('Failed to perform playback', message);
    });

    player.addListener('ready', ({ device_id }) => {
      handleConnectToSdk(device_id, session, slice);
    });

    player.addListener('not_ready', ({ device_id }) => {
      alert('no more connected with ' + device_id);
    });

    player.addListener('player_state_changed', (state) => {
      checkIf(state, session);
    });

    player.connect();
  };
};
