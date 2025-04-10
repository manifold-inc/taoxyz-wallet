import taoxyz from '@public/icons/taoxyz.svg';

interface InitialProps {
  onGetStarted: () => void;
}

const Initial = ({ onGetStarted }: InitialProps) => {
  return (
    <div className="flex h-full w-full bg-mf-night-500 justify-center items-center relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-mf-safety-500 scale-down-center z-10" />

      {/* Logo Animation */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 slide-left">
        <img src={taoxyz} alt="Taoxyz Logo" className="h-8 w-8" />
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 slide-right">
        <p className="text-mf-edge-500 text-4xl font-bold blinker-font">TAO.XYZ</p>
      </div>

      {/* Button Animation */}
      <div className="absolute bottom-16 px-8 py-1.5 bg-mf-sybil-opacity rounded-full z-0 slide-up text-base text-mf-sybil-500 cursor-pointer border border-mf-sybil-opacity hover:border-mf-sybil-500 transition-colors hover:text-mf-edge-500">
        <button className="rounded-full cursor-pointer" onClick={onGetStarted}>
          <span>Get Started</span>
        </button>
      </div>
    </div>
  );
};

export default Initial;
