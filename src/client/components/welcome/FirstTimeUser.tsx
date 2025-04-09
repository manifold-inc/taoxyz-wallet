import taoxyz from '@public/icons/taoxyz.svg';

const FirstTimeUser = () => {
  return (
    <div className="bg-mf-safety-500 flex h-screen w-screen items-center justify-center">
      <div className="bg-mf-milk-500 rounded-lg p-4">
        <img src={taoxyz} alt="Taoxyz Logo" className="h-16 w-16" />
        <h1>FirstTimeUser</h1>
      </div>
    </div>
  );
};

export default FirstTimeUser;
