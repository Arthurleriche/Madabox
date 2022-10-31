import { getAuth } from 'firebase/auth';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../firebase';

function Signup({ setAction }) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

  useEffect(() => {
    const state = getAuth();
    if (state.currentUser) navigate('/home');
  }, []);

  const register = async (e, email, password) => {
    e.preventDefault();
    await signup(email, password)
      .then((userCredential) => {
        console.log(userCredential);

        navigate(`/spotify`);
      })
      .catch((error) => console.log(error.message));
  };

  const setActionSignUp = (e) => {
    e.preventDefault();
    setAction('login');
  };

  return (
    <div className="w-full">
      {/* title */}
      <div className="w-11/12 max-w-[35rem] mx-auto mb-12 text-center">
        <h1 className="text-white text-3xl font-title">Create Account</h1>
        <h2 className="text-gray-400 text-md">
          Please fill the input below here.
        </h2>
      </div>

      {/* form */}
      <div className="w-11/12 max-w-[35rem] mx-auto">
        <form onSubmit={(e) => register(e, email, password)} className="">
          <div className="flex flex-col mb-8">
            <label htmlFor="nickname" className="text-white mb-4">
              Nickname
            </label>
            <input
              name="nickname"
              placeholder="travis75018"
              autoComplete="off"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="h-14 bg-grayNotFocused px-4 rounded-xl text-white outline-none
              placeholder:text-ligthGray placeholder:text-sm focus:placeholder:text-mediumGreen
              focus:bg-mediumGreen"
            />
          </div>

          <div className="flex flex-col mb-8">
            <label htmlFor="email" className="text-white mb-4">
              Email
            </label>
            <input
              name="email"
              placeholder="tim@apple.com"
              autoComplete="off"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 bg-grayNotFocused px-4 rounded-xl text-white outline-none
              placeholder:text-ligthGray placeholder:text-sm focus:placeholder:text-mediumGreen
              focus:bg-mediumGreen"
            />
          </div>

          <div className="flex flex-col mb-16">
            <label htmlFor="password" className="text-white mb-4">
              Password
            </label>
            <input
              name="password"
              placeholder="Pick a strong password"
              autoComplete="off"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 bg-grayNotFocused px-4 rounded-xl text-white outline-none
              placeholder:text-ligthGray placeholder:text-sm focus:placeholder:text-mediumGreen
              focus:bg-mediumGreen"
            />
          </div>

          <div className="">
            <input
              name="submit"
              type="submit"
              className="w-full h-16 font-bold cursor-pointer rounded-xl text-black bg-lightGreen "
              value="SIGN UP"
            />
          </div>
        </form>

        <div className="text-center mt-2">
          <p className="text-gray-500">
            Already have an account?{' '}
            <span
              onClick={(e) => setActionSignUp(e)}
              className="text-lightGreen cursor-pointer hover:underline"
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
