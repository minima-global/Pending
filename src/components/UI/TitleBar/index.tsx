import useAndroidShowTitleBar from '../../../hooks/useAndroidShowTitleBar';

const TitleBar = () => {
  const openTitleBar = useAndroidShowTitleBar();

  return (
    <div className="sticky top-0 z-40" onClick={openTitleBar}>
      <div className="grid grid-cols-12">
        <div className="col-span-6 flex items-center p-4">
          <img src="./icon.png" className="w-8 h-8 rounded" alt="Logo" />
          <div className="ml-3 text-lg font-bold">Pending</div>
        </div>
        <div className="col-span-6 relative flex items-center justify-end p-4" />
      </div>
    </div>
  );
};

export default TitleBar;
