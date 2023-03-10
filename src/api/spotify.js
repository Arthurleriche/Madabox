import { refreshToken } from './token';
import { Buffer } from 'buffer';
import FIRESTORE from './firestore';

const device = async (token) => {
  const response = await fetch(`https://api.spotify.com/v1/me/player/devices`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.status);
  }

  return await response.json();
};

const searchSong = async (token, search, session) => {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${search}&type=track&limit=10`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status === 401) {
    const tokenTmp = await refreshToken(session.user_uid);
    return searchSong(tokenTmp, search, session);
  }
  const searchArray = await response.json();
  return searchArray;
};

const playNextByTrackId = async (token, session, nextTrack, ext) => {
  if (nextTrack) {
    const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uris: [nextTrack.uri],
      }),
    });

    if (response.ok) {
      await FIRESTORE.updateQueueListNextPlay(session, nextTrack, ext);
    } else if (response.status === 401) {
      const tokenTmp = await refreshToken(session.user_uid, session);
      return playNextByTrackId(tokenTmp, session, nextTrack, ext);
    }

    return true;
  }
};

const SPOTIFY = {
  getDevices: async (token, userId) => {
    try {
      const response = await device(token);
      return response.devices;
    } catch (error) {
      if (error.message == 401) {
        const tokenTmp = await refreshToken(userId);
        const response = await device(tokenTmp);
        return response.devices;
      }
    }
  },

  tryToken: async (session) => {
    const { uid, user_uid, spotify_token } = session;
    const sessionTmp = await FIRESTORE.getDoc('sessions', uid);

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/devices`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Bearer ${spotify_token}`,
        },
      }
    );

    if (response.status === 200) {
      return sessionTmp.spotify_token;
    } else if (response.status === 401) {
      const tokenTmp = await refreshToken(user_uid);
      return tokenTmp;
    }

    return false;
  },

  refreshTokenSpot: async (user) => {
    const response = await fetch(' https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(user.client_id + ':' + user.client_secret).toString(
            'base64'
          ),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.refresh_token,
      }),
    });

    const tokenTmp = await response.json();
    return tokenTmp.access_token;
  },

  searchSong: async (token, search, session) => {
    const { user_uid } = session;
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${search}&type=track&limit=30`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      const tokenTmp = await refreshToken(user_uid);
      return searchSong(tokenTmp, search, session);
    }
    const searchArray = await response.json();
    return searchArray;
  },

  playNextByTrackId: async (session, nextTrack, ext) => {
    const { spotify_token, user_uid } = session;

    if (nextTrack) {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${spotify_token}`,
          },
          body: JSON.stringify({
            uris: [nextTrack.uri],
          }),
        }
      );

      if (response.status === 202) {
        await FIRESTORE.updateQueueListNextPlay(session, nextTrack, ext);
        return true;
      } else if (response.status === 401) {
        const tokenTmp = await refreshToken(user_uid);
        return playNextByTrackId(tokenTmp, session, nextTrack);
      } else if (response.status === 502) {
        return SPOTIFY.playNextByTrackId(session, nextTrack, ext);
      }

      return false;
    }
  },

  changeDevices: async (session, deviceId) => {
    const { spotify_token, user_uid } = session;
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${spotify_token}`,
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
        }),
      });

      if (response.status === 202) {
        return true;
      } else if (response.status === 404) {
        return SPOTIFY.changeDevices(session, deviceId);
      } else if (response.status === 401) {
        const tokenTmp = await refreshToken(user_uid);
        return await SPOTIFY.changeDevices(
          { spotify_token: tokenTmp },
          deviceId
        );
      } else if (response.status === 502) {
        return SPOTIFY.changeDevices(session, deviceId);
      }
    } catch (error) {
      console.log(error);
    }
  },

  pause: async (token, session) => {
    const { uid } = session;
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/pause`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        FIRESTORE.killSession(uid);
      }

      return response;
    } catch (error) {
      const tokenTmp = await refreshToken(session.uid);
      await SPOTIFY.pause(tokenTmp, session);
    }
  },

  playByTrackId: async (token, song) => {
    if (song) {
      fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uris: [song.uri],
        }),
      });

      return song;
    }
  },

  play: async (token) => {
    const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
    });

    return response;
  },
};

export default SPOTIFY;
