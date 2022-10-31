import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../firebase';
import FormInput from './FormInput';

function Login({ setAction }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signin } = useContext(AuthContext);
  const navigate = useNavigate();

  const login = async (e, email, password) => {
    e.preventDefault();
    await signin(email, password)
      .then(() => {
        navigate(`/spotify`);
      })
      .catch((error) => console.log(error.message));
  };

  const setActionLogin = (e) => {
    e.preventDefault();
    setAction('signup');
  };

  return (
    <div className="w-full h-[75%]">
      {/* title */}
      <div className="w-11/12 max-w-[35rem] mx-auto mb-20 text-center">
        <h1 className="text-white text-3xl font-title">Log in</h1>
        <h2 className="text-gray-400 text-md">
          Please fill the input below here.
        </h2>
      </div>

      {/* form */}
      <div className="w-11/12 max-w-[35rem] mx-auto">
        <form onSubmit={(e) => login(e, email, password)}>
          <FormInput
            label="Email"
            inputOptions={{
              required: true,
              name: 'email',
              placeholder: 'tim@apple.com',
              autoComplete: 'off',
              type: 'text',
              value: email,
              onChange: (e) => setEmail(e.target.value),
            }}
          />
          <FormInput
            label="Password"
            inputOptions={{
              required: true,
              name: 'password',
              placeholder: '*********',
              autoComplete: 'off',
              type: 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
            }}
          />

          <button
            name="submit"
            type="submit"
            className="w-full mt-28 font-bold h-16 cursor-pointer rounded-xl text-black bg-lightGreen hover:bg-opacity-75 "
            value="LOG IN"
          >
            Log in
          </button>
        </form>

        <div className="text-center mt-2">
          <p className="text-gray-500">
            <span
              className="text-lightGreen cursor-pointer hover:underline mr-2"
              onClick={(e) => setActionLogin(e)}
            >
              Create
            </span>
            an account !
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
