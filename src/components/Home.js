import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/authentification';
import { LogoutIcon } from '@heroicons/react/solid';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import FIRESTORE from '../api/firestore';

import Navbar from './Navbar';

function Home() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);

  const navigate = useNavigate();
  searchParams.get('__firebase_request_key');

  useEffect(() => {
    if (searchParams.get('access_token')) {
      FIRESTORE.recordSpotifyToken(user.uid, {
        spotify_token: searchParams.get('access_token'),
        refresh_token: searchParams.get('refresh_token'),
      });
    }
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'sessions'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsTmp = [];
      querySnapshot.forEach((doc) => {
        const sessionTmp = doc.data();
        sessionTmp.uid = doc.id;
        sessionsTmp.push(sessionTmp);
      });

      setSessions(sessionsTmp);
    });

    if (user.uid || localStorage.getItem('username')) {
      return () => unsubscribe();
    }

    const username = prompt('Quel est votre nom');
    localStorage.setItem('username', username + '-username-' + uuidv4());

    return () => unsubscribe();
  }, []);

  const signOutUser = async (e) => {
    e.preventDefault();
    await logout()
      .then(() => {
        console.log('Signed out successfully !');
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="relative h-screen pt-20 font-text">
      <div className="w-11/12 max-w-[35rem] mx-auto mb-12 text-center">
        <h1 className="text-white text-3xl font-title">Home</h1>
        <h2 className="text-gray-400 text-md">Welcome back.</h2>
      </div>

      <div className="w-11/12 max-w-[35rem] mx-auto mb-12">
        <p className="text-gray-400 font-semibold">
          Join your friends and battle for sound. Rank up your favourites tracks
          by voting.
        </p>
      </div>

      <div className="w-11/12 max-w-[35rem] mx-auto">
        <p className="text-gray-500">Join a session</p>
        {sessions &&
          sessions.map((session) => {
            if (session.active) {
              return (
                <div
                  key={session.uid}
                  className="mt-4 flex flex-col"
                  onClick={() => navigate(`/sessions/${session.uid}`)}
                >
                  <div className="h-20 shadow w-full rounded-lg bg-mediumGreen flex items-center hover:bg-opacity-90">
                    <img
                      src={
                        session?.queue_list[0]?.track_picture ||
                        'https://static.fnac-static.com/multimedia/Images/FR/NR/1e/b9/9e/10402078/1540-1/tsp20180829100017/UMLA.jpg'
                      }
                      alt=""
                      className="w-14 h-14 rounded-lg mx-2"
                    />
                    <div className="px-2 w-full flex flex-col">
                      <p className="text-white font-bold inline-block">
                        {session.name}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          })}
      </div>

      {user.uid ? (
        <>
          <LogoutIcon
            onClick={(e) => signOutUser(e)}
            className="absolute text-gray-400 right-4 top-4 w-6 h-6 hover:text-white"
          />
        </>
      ) : (
        <p
          onClick={() => navigate(`/login`)}
          className="text-white right-4 top-4 w-6 h-6 absolute"
        >
          logIn
        </p>
      )}

      <Navbar />
    </div>
  );
}

export default Home;
