import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const firestoreGetDoc = async (collection, docId) => {
  const docRef = await getDoc(doc(db, collection, docId));
  let data = docRef.data();
  data.uid = docRef.id;
  return data;
};

const firestoreUpdateDoc = async (collection, id, body) => {
  updateDoc(doc(db, collection, id), body).catch(() => {
    throw new Error('Update Failed');
  });
  return true;
};

const checkIfTrackExist = (list, newTrack) => {
  return list.findIndex((newSong) => newSong.uri === newTrack.uri) !== -1
    ? true
    : false;
};

const FIRESTORE = {
  getDoc: (collection, id) => {
    return firestoreGetDoc(collection, id);
  },
  updateDoc: (collection, id, body) => {
    return firestoreUpdateDoc(collection, id, body);
  },

  addSongToQueueList: async (session, body) => {
    const { uid, queue_list } = session;
    if (!queue_list.some((song) => song.uri === body.uri)) {
      const queueList = [...queue_list, body];
      firestoreUpdateDoc('sessions', uid, { queue_list: queueList });
    }
  },

  updateQueueListNextPlay: async (id, track, ext) => {
    const session = await firestoreGetDoc('sessions', id);

    const currentTrack = {
      track: track.track,
      artist: track.artist,
      track_picture: track.track_picture,
      uri: track.uri,
      duration: track.duration,
      user_uid: track.user_uid,
    };

    if (session.queue_list[0] && session.queue_list[0].uri === track.uri) {
      let sessionTmp = session;
      sessionTmp.queue_list.splice(0, 1);
      if (!checkIfTrackExist(sessionTmp.library, currentTrack)) {
        session.library = [...sessionTmp.library, currentTrack];
      }
      firestoreUpdateDoc('sessions', id, {
        active: true,
        queue_list: sessionTmp.queue_list,
        current_song: currentTrack,
        library: sessionTmp.library,
      });
    } else if (ext) {
      firestoreUpdateDoc('sessions', id, { current_song: currentTrack });
    }
  },

  RestoreQueueList: async (id) => {
    firestoreUpdateDoc('sessions', id, { queue_list: [] });
  },

  recordSpotifyToken: async (id, token) => {
    const { session_uid } = await firestoreGetDoc('profiles', id);
    let body;

    if (token?.refresh_token) {
      body = {
        spotify_token: token.spotify_token,
        refresh_token: token.refresh_token,
      };
    } else {
      body = {
        spotify_token: token,
      };
    }

    firestoreUpdateDoc('profiles', id, body);
    firestoreUpdateDoc('sessions', session_uid, body);

    return body;
  },

  incrementSongCount: async (id, track, user) => {
    let { queue_list } = await firestoreGetDoc('sessions', id);
    const index = queue_list.findIndex(
      (elt) => elt.track === track.track && elt.artist === track.artist
    );

    const usersVoted = queue_list[index]['voted_uids'] || [];

    if (usersVoted.includes(user)) return;

    usersVoted.push(user);
    queue_list[index].count++;
    queue_list[index]['voted_uids'] = usersVoted;
    queue_list.sort(function (a, b) {
      return b.count - a.count;
    });

    firestoreUpdateDoc('sessions', id, { queue_list });
  },

  decrementSongCount: async (id, track, user) => {
    let { queue_list } = await firestoreGetDoc('sessions', id);
    const index = queue_list.findIndex(
      (elt) => elt.track === track.track && elt.artist === track.artist
    );
    const usersVoted = queue_list[index]['voted_uids'];

    if (usersVoted.includes(user)) {
      usersVoted.splice(usersVoted.indexOf(user), 1);
      queue_list[index].count--;
      queue_list[index]['voted_uids'] = usersVoted;
      queue_list.sort(function (a, b) {
        return b.count - a.count;
      });

      firestoreUpdateDoc('sessions', id, { queue_list });
    }
  },

  votedForNextTrack: async (id, userInformation) => {
    const { current_song } = await firestoreGetDoc('sessions', id);
    current_song.next_track_count = current_song.next_track_count + 1 || 1;
    current_song.users_voted
      ? (current_song.users_voted = [
          ...current_song.users_voted,
          userInformation,
        ])
      : (current_song.users_voted = [userInformation]);

    firestoreUpdateDoc('sessions', id, { current_song });
  },

  killSession: async (id) => {
    firestoreUpdateDoc('session', id, { active: false });
  },

  wsGetSession: (sessionId, slice) =>
    onSnapshot(doc(db, 'sessions', sessionId), (doc) => {
      const sessionTmp = doc.data();
      sessionTmp.uid = doc.id;
      slice(sessionTmp);
    }),
};

export default FIRESTORE;
