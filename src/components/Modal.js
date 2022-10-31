import { useRef, useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import SPOTIFY from '../api/spotify';
import { useNavigate } from 'react-router-dom';
import { DeviceMobileIcon, DesktopComputerIcon } from '@heroicons/react/solid';
import FIRESTORE from '../api/firestore';

function Modal({
  modal,
  currentUserUid,
  close,
  sessionId,
  setModal,
  spotifyToken,
}) {
  const [devices, setDevices] = useState();
  const [selectedDevice, setSelectedDevice] = useState();
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(async () => {
    const devicesAvailable = await SPOTIFY.getDevices(
      spotifyToken,
      currentUserUid
    );

    setDevices(devicesAvailable);
  }, [modal]);

  const changeDevice = async (id) => {
    await SPOTIFY.changeDevices(spotifyToken, id, currentUserUid);
    setModal(false);
  };

  const stopSession = async () => {
    FIRESTORE.RestoreQueueList(sessionId);
    navigate('/home');
  };

  return ReactDom.createPortal(
    <>
      {modal && (
        <div
          onClick={() => close()}
          className={`absolute grid place-content-center top-0 left-0 z-50 bg-black bg-opacity-40 w-full h-full`}
        >
          <div
            className="bg-black bg-opacity-95 rounded-lg w-[80vw] min-w-[220px] max-w-[420px] px-4 pt-4 pb-6"
            onClick={(e) => e.stopPropagation()}
            ref={ref}
          >
            <div className="flex flex-col justify-center mb-8">
              {devices &&
                devices.map((device) => {
                  return (
                    <button
                      key={device.name}
                      className={`flex justify-center items-center m-2 h-16 rounded-md px-2
                        ${
                          device.is_active
                            ? 'bg-lightGreen'
                            : 'hover:bg-gray-900 focus:bg-orangeSelection focus:bg-opacity-70'
                        }`}
                      onClick={() => setSelectedDevice(device.id)}
                    >
                      {device.type === 'Computer' && (
                        <DesktopComputerIcon className="text-white w-10" />
                      )}

                      {device.type === 'Smartphone' && (
                        <DeviceMobileIcon className="text-white w-10" />
                      )}

                      <div className="m-1 w-full rounded-md flex items-center px-4">
                        <p className="text-gray-300 text-sm font-semibold">
                          {device.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              {devices?.length === 0 && (
                <p className="text-white mx-auto py-8 font-bold">
                  No available device
                </p>
              )}
            </div>

            <div className="flex justify-around">
              <button
                onClick={() => changeDevice(selectedDevice)}
                className="font-title w-20 h-12 block font-bold cursor-pointer rounded-lg bg-lightGreen bg-opacity-70 hover:bg-opacity-90 text-gray-400 hover:text-white"
              >
                SELECT
              </button>

              <button
                onClick={stopSession}
                className="font-title h-12 w-20 font-bold cursor-pointer rounded-lg bg-red-800 bg-opacity-70 hover:bg-opacity-90 text-gray-400 hover:text-white"
              >
                STOP
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.getElementById('portal')
  );
}

export default Modal;
