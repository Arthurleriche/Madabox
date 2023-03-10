import { useEffect, useState } from 'react';
import FIRESTORE from '../api/firestore';
import { useAuth } from '../hooks/authentification';
import FormInput from './FormInput';
import Navbar from './Navbar';

function Settings() {
  const { user } = useAuth();

  const [settings, setSettings] = useState({
    name: '',
    skipNumber: '3',
    password: '',
    active: false,
    library: [],
    lib: false,
    uid: null,
  });

  const { name, skipNumber, password, active, library, uid, lib } = settings;

  useEffect(() => {
    const updateStore = async () => {
      const userTmp = await FIRESTORE.getDoc('profiles', user.uid);

      const sessionTmp = await FIRESTORE.getDoc(
        'sessions',
        userTmp.session_uid
      );

      setSettings({
        uid: sessionTmp?.uid,
        name: sessionTmp?.name,
        skipNumber: sessionTmp?.skipNumber,
        password: sessionTmp?.password,
        active: sessionTmp?.active,
        library: sessionTmp?.library,
        lib: sessionTmp?.lib,
      });
    };
    updateStore();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await FIRESTORE.updateDoc('sessions', settings.uid, settings);

    alert('Changes saved');
  };

  const handleChangeActive = () => {
    setSettings((prev) => {
      return { ...settings, active: !prev.active };
    });
  };
  const handleChangeLib = () => {
    setSettings((prev) => {
      return { ...settings, lib: !prev.lib };
    });
  };

  const handleDeleteTrackOnLibrary = async (deleteTrack) => {
    const library = settings.library.filter(
      (song) => song.uri !== deleteTrack.uri
    );
    await FIRESTORE.updateDoc('sessions', settings.uid, { library });
    setSettings({ ...settings, library });
  };

  const displayLibrary = library.map((song) => {
    return (
      <div
        key={song.uri}
        className="h-[20%] mx-10 lg:mx-[300px] flex items-center pb-2  border-b border-gray-900 mb-1"
      >
        <div className="inline-flex h-full items-center">
          <img src={song.track_picture} alt="" className="w-14 p-1" />
        </div>
        <div className="flex flex-col w-full ml-2">
          <p className="text-white text-xs font-title">{song.track}</p>
          <div className="flex items-center text-xs">
            <p className="text-gray-500">{song.artist}</p>
          </div>
        </div>
        <button
          className="text-gray-500 hover:text-red-500"
          onClick={() => handleDeleteTrackOnLibrary(song)}
        >
          Delete
        </button>
      </div>
    );
  });

  if (!uid) {
    return <p>Loading...</p>;
  }

  return (
    <div className="pb-32">
      {/* title */}
      <div className="text-center pt-20 mb-10">
        <h1 className="text-white text-3xl font-title">Settings</h1>
      </div>
      <form onSubmit={handleSubmit} className="px-10 lg:px-[300px]">
        <FormInput
          label="Name Session"
          inputOptions={{
            name: 'name',
            placeholder: 'Name Session',
            autoComplete: 'off',
            type: 'text',
            value: name,
            onChange: (e) => setSettings({ ...settings, name: e.target.value }),
          }}
        />
        <FormInput
          label="Skip Number"
          inputOptions={{
            name: 'skipNumber',
            placeholder: 'Skip Number',
            autoComplete: 'off',
            type: 'text',
            value: skipNumber,
            onChange: (e) =>
              setSettings({ ...settings, skipNumber: e.target.value }),
          }}
        />
        <FormInput
          label="Password"
          inputOptions={{
            name: 'skipNumber',
            placeholder: 'Skip Number',
            autoComplete: 'off',
            type: 'text',
            value: password,
            onChange: (e) =>
              setSettings({ ...settings, password: e.target.value }),
          }}
        />

        <div className="flex items-center mb-4 ">
          <label htmlFor="session" className="text-white mr-4">
            Record in Library
          </label>
          <input
            name="session"
            checked={lib}
            onChange={handleChangeLib}
            type="checkbox"
            className="w-6"
          />
        </div>

        <div className="flex items-center mb-4 ">
          <label htmlFor="session" className="text-white mr-4">
            Active Session
          </label>
          <input
            name="session"
            checked={active}
            onChange={handleChangeActive}
            type="checkbox"
            className="w-6"
          />
        </div>
        <button
          name="submit"
          type="submit"
          className="w-full font-bold h-16 mt-16 cursor-pointer rounded-xl text-black bg-lightGreen hover:bg-opacity-75 "
          value="UPDATE"
        >
          Update
        </button>
      </form>

      <div className="mt-[5vh] mb-[6vh] text-center">
        <h1 className="text-white text-3xl font-title">Library</h1>
      </div>

      {displayLibrary}

      <Navbar />
    </div>
  );
}

export default Settings;
