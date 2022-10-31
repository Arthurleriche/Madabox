import { useEffect, useState } from 'react';
import { SearchIcon } from '@heroicons/react/solid';
import SPOTIFY from '../api/spotify';
import { useSelector } from 'react-redux';

import FIRESTORE from '../api/firestore';

export default function Search({ setNewSong }) {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const session = useSelector((state) => state.session.session);

  const searchTrack = async (e, query) => {
    e.preventDefault();
    if (!search) return;
    const result = await SPOTIFY.searchSong(
      session.spotify_token,
      query,
      session
    );
    const tracks = result?.tracks?.items;
    setSearchResult(tracks);
  };

  useEffect(() => {
    if (!search) setSearchResult('');
  }, [search]);

  const selectTrackToQueueList = async (track) => {
    const body = {
      track: track.name,
      artist: track.artists[0].name,
      track_picture: track.album.images[0].url,
      uri: track.uri,
      count: 0,
      duration: track.duration_ms,
      user_uid: localStorage.getItem('username') || 'admin',
      voted_uids: [],
    };

    FIRESTORE.addSongToQueueList(session, body);
    setNewSong(1);
    setSearchResult('');
  };

  return (
    <>
      {searchResult && (
        <div
          onClick={() => setSearchResult('')}
          className="fixed top-0 bottom-0 left-0 right-0 bg-white opacity-20"
        />
      )}

      <div className="fixed bottom-16 w-full">
        <div className="relative top-0 bg-black bg-opacity-95 w-full max-h-[35vh] overflow-y-scroll">
          {searchResult &&
            searchResult.map((track) => {
              return (
                <div
                  className="w-full text-gray-300 font-light border-b border-gray-900 min-h-[4rem] flex items-center px-4 py-2"
                  key={track.id}
                  onClick={() => selectTrackToQueueList(track)}
                >
                  <img
                    className="h-6 w-6 rounded-full mr-2 mb-1 border border-gray-600"
                    src={track.album.images[0].url}
                  />

                  <div>
                    <p className="mr-1 font-bold">{track.name}</p>
                    <div className="flex items-center text-xs">
                      <p>{track.artists[0].name}</p>

                      {track.artists[1] && (
                        <div key={Math.random()} className="flex">
                          <span className="mr-1">,</span>
                          <div>
                            <p>{track.artists[1].name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <form onSubmit={(e) => searchTrack(e, search)} className="relative">
          <input
            type="text"
            className="outline-none text-white w-full h-12 bg-lightGreen px-6
            placeholder:font-title"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input type="submit" className="hidden" />

          <button className="absolute right-4 h-full">
            <SearchIcon className="w-8 h-8 text-gray-400" />
          </button>
        </form>
      </div>
    </>
  );
}
