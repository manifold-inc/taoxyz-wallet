const Skeleton = ({ className }: { className: string }) => {
  return <div className={`bg-mf-ash-300 rounded animate-pulse ${className}`} />;
};

export default Skeleton;
