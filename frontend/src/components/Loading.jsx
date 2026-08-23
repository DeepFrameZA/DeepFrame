const Loading = ({ className = "" }) => {
  return (
    <>
      <div
        className={`${className} flex justify-center h-dvh bg-base-200 text-primary`}
      >
        <span className="loading loading-bars loading-xl"></span>
      </div>
    </>
  );
};
export default Loading;
