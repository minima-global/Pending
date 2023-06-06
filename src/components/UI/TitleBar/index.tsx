const TitleBar = () => {
  return (
    <div className="sticky top-0 z-40 bg-core-black-100">
      <div className="grid grid-cols-12">
        <div className="col-span-6 flex items-center p-4">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.4484 6.42613L21.2111 11.6205L19.6268 5.3437L14.0818 3.20995L12.5827 9.493L11.2537 2.12753L5.70868 0L0 24H6.05565L7.81015 16.6283L9.12602 24H15.1948L16.6874 17.7107L18.2651 24H24.3208L28 8.55365L22.4484 6.42613Z"
              fill="white"
            />
          </svg>
        </div>
        <div className="col-span-6 relative flex items-center justify-end p-4" />
      </div>
    </div>
  );
};

export default TitleBar;
