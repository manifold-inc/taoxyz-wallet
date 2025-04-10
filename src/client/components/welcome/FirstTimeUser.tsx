import taoxyz from '@public/icons/taoxyz.svg';

const FirstTimeUser = () => {
  return (
    <div className="h-screen w-screen">
      <div className="flex h-full w-full bg-mf-night-500 justify-center items-center relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-mf-safety-500 scale-down-center z-10" />

        {/* Logo Animation Container */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 slide-left">
          <img src={taoxyz} alt="Taoxyz Logo" className="h-8 w-8" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 slide-right">
          <p className="text-mf-edge-500 text-4xl font-bold font-blinker">TAO.XYZ</p>
        </div>

        <div className="absolute bottom-20 px-10 py-1.5 bg-mf-ash-500 rounded-full z-0 slide-up">
          <button className="text-mf-sybil-500 text-lg rounded-full cursor-pointer">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeUser;
