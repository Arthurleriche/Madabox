import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TracklistItem from './TracklistItem';

export default function QueueList({ newSong }) {
  const session = useSelector((state) => state.session.session);
  const listRef = useRef(null);

  useEffect(() => {
    console.log(newSong);
    // listRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [newSong]);

  if (!session) {
    return <p>Loading...</p>;
  }

  return (
    <div className="tracklist mt-4 h-[52vh] min-h-[20rem] max-w-[35rem] mb-96 w-full overflow-y-scroll">
      {session.queue_list.map((track) => {
        return <TracklistItem key={Math.random()} track={track} />;
      })}
      <div ref={listRef} />
    </div>
  );
}
