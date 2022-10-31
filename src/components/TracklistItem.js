import { HeartIcon as HeartIconSolid } from '@heroicons/react/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/outline';

import { useParams } from 'react-router-dom';
import FIRESTORE from '../api/firestore';
import { useAuth } from '../hooks/authentification';

function TracklistItem({ track }) {
  const { user } = useAuth();
  const params = useParams();
  const userTmp = user.uid || localStorage.getItem('username');

  const handleLike = () => {
    if (track.voted_uids?.includes(userTmp)) {
      FIRESTORE.decrementSongCount(params.sessionId, track, userTmp);
    } else {
      FIRESTORE.incrementSongCount(params.sessionId, track, userTmp);
    }
  };

  return (
    <div className="h-[20%] flex items-center w-full border-b border-gray-900 mb-1">
      {/* image */}
      <div className="inline-flex h-full items-center">
        <img src={track.track_picture} alt="" className="w-14 p-1" />
      </div>

      {/* body */}
      <div className="flex flex-col w-full ml-2">
        <p className="text-white text-xs font-title">{track.track}</p>
        <div className="flex items-center text-xs">
          <p className="text-gray-500">{track.artist}</p>
        </div>
      </div>
      {track.user_uid && (
        <div className="justify-center">
          {' '}
          <p className="text-gray-500 text-center text-xs overflow-x-hidden">
            {track.user_uid.substr(0, track.user_uid.indexOf('-username-')) ===
            'null'
              ? ''
              : track.user_uid.substr(0, track.user_uid.indexOf('-username-'))}
          </p>
        </div>
      )}

      {/* count */}
      <div className="w-28 h-full flex justify-center items-center">
        {track.voted_uids?.includes(userTmp) ? (
          <HeartIconSolid
            onClick={() => handleLike()}
            className="text-red-800 h-4 w-4 mr-3"
          />
        ) : (
          <HeartIconOutline
            onClick={() => handleLike()}
            className="text-white h-4 w-4 mr-3"
          />
        )}
        <span
          className={`font-title  
            ${
              track.voted_uids?.includes(userTmp)
                ? 'text-red-800'
                : 'text-white'
            }`}
        >
          {track.count}
        </span>
      </div>
    </div>
  );
}

export default TracklistItem;
