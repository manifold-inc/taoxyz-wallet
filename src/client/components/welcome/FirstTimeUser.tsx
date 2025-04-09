import taoxyz from '@public/icons/taoxyz.svg';

const FirstTimeUser = () => {
  return (
    <div className="h-screen w-screen">
      <div className="flex h-full w-full bg-mf-night-500 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-mf-safety-500 scale-down-center" />
        <div className="flex items-center relative z-10">
          <img src={taoxyz} alt="Taoxyz Logo" className="h-12 w-12" />
          <p className="text-mf-edge-500 text-3xl font-blinker font-bold slide-out-right">
            TAO.XYZ
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeUser;
