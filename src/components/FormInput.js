const FormInput = ({ label, inputOptions }) => {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="text-white mb-4">{label}</label>}
      <input
        className="h-14 bg-grayNotFocused px-4 rounded-xl text-white outline-none
              placeholder:text-ligthGray placeholder:text-sm focus:placeholder:text-mediumGreen
              focus:bg-mediumGreen"
        {...inputOptions}
      />
    </div>
  );
};

export default FormInput;
