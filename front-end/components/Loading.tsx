const Loading = () => {
  return (
    <div className='flex flex-col h-screen'>
      <div className='h-24 w-full bg-red-1'>
        <label className='flex justify-start'>
          <img className='mt-6 ml-4' src='./public/LOGORS.png' alt='' />
        </label>
      </div>
      <div className='flex flex-1 justify-center items-center w-10 mt-12'>
        <span className='loading loading-dots loading-lg place-content-center mt-12'></span>
      </div>
    </div>
  );
};

export default Loading;
